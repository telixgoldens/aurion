// SPDX-License-Identifier: MIT
//
// CreditScoreEngine — Arbitrum Stylus (Rust/WASM)
//
// This contract is called by CreditManager.sol via a Solidity interface.
// It performs all heavy credit scoring math off the EVM, in WASM, which is
// significantly cheaper and faster for iterative / floating-point-style math.
//
// Scoring model (max 1000 points):
//   Account Age Score    : 0–150  (based on days since first borrow)
//   Health Factor Score  : 0–250  (based on aggregated collateral/debt ratio)
//   Repayment Score      : 0–200  (based on repayment count, capped at 20)
//   Delegated Score      : 0–100  (based on delegated credit amount)
//   Cross-Protocol Score : 0–100  (bonus for activity on both Aave + Compound)
//   Volatility Discount  : 0–100  (penalty for high utilization variance)
//   Utilization Penalty  : 0–150  (penalty for >50% utilization)
//   Liquidation Penalty  : 0–300  (100 per liquidation, max 300)

#![cfg_attr(not(any(test, feature = "export-abi")), no_main, no_std)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::U256,
    prelude::*,
};

// ─── Storage ──────────────────────────────────────────────────────────────────

sol_storage! {
    #[entrypoint]
    pub struct CreditScoreEngine {
        /// owner — only address allowed to call mutating functions
        address owner;
        /// authorised callers (e.g. CreditManager.sol)
        mapping(address => bool) authorised;
    }
}

// ─── Errors ───────────────────────────────────────────────────────────────────

sol! {
    error NotAuthorised();
    error InvalidInput();
}

#[derive(SolidityError)]
pub enum EngineError {
    NotAuthorised(NotAuthorised),
    InvalidInput(InvalidInput),
}

// ─── Public API ───────────────────────────────────────────────────────────────

#[public]
impl CreditScoreEngine {
    // ── Admin ────────────────────────────────────────────────────────────────

    /// Called once after deployment — sets the owner.
    pub fn initialize(&mut self) -> Result<(), EngineError> {
        let zero = stylus_sdk::alloy_primitives::Address::ZERO;
        if self.owner.get() != zero {
            return Err(EngineError::NotAuthorised(NotAuthorised {}));
        }
        self.owner.set(self.vm().msg_sender());
        Ok(())
    }

    /// Authorise or de-authorise a caller (e.g. CreditManager).
    pub fn set_authorised(
        &mut self,
        caller: stylus_sdk::alloy_primitives::Address,
        allowed: bool,
    ) -> Result<(), EngineError> {
        self.only_owner()?;
        self.authorised.setter(caller).set(allowed);
        Ok(())
    }

    // ── Core scoring — pure view functions (no state writes) ────────────────

    /// Primary entry point: returns the full credit score (0–1000) given all
    /// user metrics. Called by CreditManager.sol instead of doing this math
    /// in Solidity.
    ///
    /// Parameters
    /// ----------
    /// collateral_value   : USD value of collateral (6 decimals, USDC-style)
    /// delegated_credit   : USD delegated credit from CreditPool (6 decimals)
    /// total_debt         : Current total debt (6 decimals)
    /// account_age_days   : Days since the account was first opened
    /// repayment_count    : Number of successful repayments
    /// liquidation_count  : Number of times the account was liquidated
    /// aave_debt          : Debt outstanding on Aave (6 decimals)
    /// compound_debt      : Debt outstanding on Compound (6 decimals)
    /// prev_utilization_bps: Utilization 7 days ago (basis points, 0–10000)
    ///                       Used to compute volatility. Pass current if unknown.
    #[allow(clippy::too_many_arguments)]
    pub fn compute_credit_score(
        &self,
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        aave_debt: U256,
        compound_debt: U256,
        prev_utilization_bps: U256,
    ) -> U256 {
        let (age, health, repay, delegated, cross, volatility_disc, util_pen, liq_pen) =
            self.score_breakdown_internal(
                collateral_value,
                delegated_credit,
                total_debt,
                account_age_days,
                repayment_count,
                liquidation_count,
                aave_debt,
                compound_debt,
                prev_utilization_bps,
            );

        let gross = age + health + repay + delegated + cross;
        let penalties = util_pen + liq_pen + volatility_disc;

        if penalties >= gross {
            return U256::ZERO;
        }

        let score = gross - penalties;
        if score > U256::from(1000u64) {
            U256::from(1000u64)
        } else {
            score
        }
    }

    /// Returns the full score breakdown — useful for frontend transparency.
    /// Returns (ageScore, healthScore, repayScore, delegatedScore,
    ///          crossProtocolScore, volatilityDiscount,
    ///          utilizationPenalty, liquidationPenalty)
    #[allow(clippy::too_many_arguments)]
    pub fn score_breakdown(
        &self,
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        aave_debt: U256,
        compound_debt: U256,
        prev_utilization_bps: U256,
    ) -> (U256, U256, U256, U256, U256, U256, U256, U256) {
        self.score_breakdown_internal(
            collateral_value,
            delegated_credit,
            total_debt,
            account_age_days,
            repayment_count,
            liquidation_count,
            aave_debt,
            compound_debt,
            prev_utilization_bps,
        )
    }

    /// Derives the risk tier from a credit score.
    /// Returns: 3 = Conservative (≥700), 2 = Moderate (≥500),
    ///          1 = Aggressive (≥300), 0 = Unrated
    pub fn risk_tier_from_score(&self, score: U256) -> U256 {
        if score >= U256::from(700u64) {
            U256::from(3u64)
        } else if score >= U256::from(500u64) {
            U256::from(2u64)
        } else if score >= U256::from(300u64) {
            U256::from(1u64)
        } else {
            U256::ZERO
        }
    }

    /// Max LTV in basis points for a given risk tier.
    /// 3 → 7500 (75%), 2 → 8500 (85%), 1 → 9500 (95%), 0 → 0
    pub fn max_ltv_bps(&self, tier: U256) -> U256 {
        if tier == U256::from(3u64) {
            U256::from(7500u64)
        } else if tier == U256::from(2u64) {
            U256::from(8500u64)
        } else if tier == U256::from(1u64) {
            U256::from(9500u64)
        } else {
            U256::ZERO
        }
    }

    /// Aggregated health factor across Aave + Compound positions.
    /// Returns scaled by 1e18. Returns U256::MAX if no debt.
    ///
    /// aave_collateral / compound_collateral: individual collateral values
    /// aave_liq_threshold_bps / compound_liq_threshold_bps:
    ///   liquidation thresholds in bps (e.g. 8500 = 85%)
    pub fn aggregate_health_factor(
        &self,
        aave_collateral: U256,
        aave_liq_threshold_bps: U256,
        aave_debt: U256,
        compound_collateral: U256,
        compound_liq_threshold_bps: U256,
        compound_debt: U256,
    ) -> U256 {
        let total_debt = aave_debt + compound_debt;
        if total_debt.is_zero() {
            return U256::MAX;
        }

        // weighted_collateral = Σ(collateral_i * liq_threshold_i) / 10000
        let aave_weighted = aave_collateral * aave_liq_threshold_bps / U256::from(10_000u64);
        let compound_weighted =
            compound_collateral * compound_liq_threshold_bps / U256::from(10_000u64);

        let total_weighted = aave_weighted + compound_weighted;

        // HF = total_weighted_collateral * 1e18 / total_debt
        let scale = U256::from(10u64).pow(U256::from(18u64));
        total_weighted * scale / total_debt
    }

    /// Variable interest rate model (Aave-style two-slope).
    ///
    /// Returns borrow rate in basis points per year.
    ///
    /// Below optimal utilization: rate = base_rate + (utilization / optimal) * slope1
    /// Above optimal utilization: rate = base_rate + slope1 + ((utilization - optimal) /
    ///                                   (1 - optimal)) * slope2
    ///
    /// All rates in bps. Utilization in bps (0–10000).
    /// Typical values: base=100, slope1=400, slope2=7500, optimal=8000
    pub fn borrow_rate_bps(
        &self,
        utilization_bps: U256,
        base_rate_bps: U256,
        slope1_bps: U256,
        slope2_bps: U256,
        optimal_utilization_bps: U256,
    ) -> U256 {
        if utilization_bps.is_zero() {
            return base_rate_bps;
        }

        let max_bps = U256::from(10_000u64);

        if utilization_bps <= optimal_utilization_bps {
            // Linear segment below optimal
            base_rate_bps + (utilization_bps * slope1_bps / optimal_utilization_bps)
        } else {
            // Steep segment above optimal
            let excess = utilization_bps - optimal_utilization_bps;
            let remaining_capacity = max_bps - optimal_utilization_bps;
            base_rate_bps + slope1_bps + (excess * slope2_bps / remaining_capacity)
        }
    }

    /// Supply rate: borrow_rate * utilization * (1 - reserve_factor)
    /// Returns supply rate in bps per year.
    /// reserve_factor_bps: e.g. 1000 = 10%
    pub fn supply_rate_bps(
        &self,
        utilization_bps: U256,
        borrow_rate_bps_val: U256,
        reserve_factor_bps: U256,
    ) -> U256 {
        let max_bps = U256::from(10_000u64);
        let net_factor = max_bps - reserve_factor_bps;
        borrow_rate_bps_val * utilization_bps / max_bps * net_factor / max_bps
    }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

impl CreditScoreEngine {
    fn only_owner(&self) -> Result<(), EngineError> {
        if self.vm().msg_sender() != self.owner.get() {
            return Err(EngineError::NotAuthorised(NotAuthorised {}));
        }
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    fn score_breakdown_internal(
        &self,
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        aave_debt: U256,
        compound_debt: U256,
        prev_utilization_bps: U256,
    ) -> (U256, U256, U256, U256, U256, U256, U256, U256) {
        let age_score = self.age_score(account_age_days);
        let health_score = self.health_score(collateral_value, delegated_credit, total_debt);
        let repay_score = self.repayment_score(repayment_count);
        let delegated_score = self.delegated_score(delegated_credit);
        let cross_score = self.cross_protocol_score(aave_debt, compound_debt);
        let volatility_disc =
            self.volatility_discount(collateral_value, delegated_credit, total_debt, prev_utilization_bps);
        let util_penalty = self.utilization_penalty(collateral_value, delegated_credit, total_debt);
        let liq_penalty = self.liquidation_penalty(liquidation_count);

        (
            age_score,
            health_score,
            repay_score,
            delegated_score,
            cross_score,
            volatility_disc,
            util_penalty,
            liq_penalty,
        )
    }

    /// 0–150 points. Maxes out at 180 days.
    fn age_score(&self, account_age_days: U256) -> U256 {
        let max_days = U256::from(180u64);
        let max_score = U256::from(150u64);

        if account_age_days >= max_days {
            max_score
        } else {
            account_age_days * max_score / max_days
        }
    }

    /// 0–250 points based on health factor.
    /// HF = (collateral + delegated) / debt, scaled 1e18
    fn health_score(&self, collateral: U256, delegated: U256, debt: U256) -> U256 {
        if debt.is_zero() {
            return U256::from(250u64);
        }

        let credit = collateral + delegated;
        let scale = U256::from(10u64).pow(U256::from(18u64));
        let hf = credit * scale / debt; // scaled by 1e18

        let e18 = scale;
        let e18_15 = U256::from(15u64) * e18 / U256::from(10u64); // 1.5e18
        let e18_12 = U256::from(12u64) * e18 / U256::from(10u64); // 1.2e18
        let e18_2 = U256::from(2u64) * e18; // 2.0e18

        if hf >= e18_2 {
            U256::from(250u64)
        } else if hf >= e18_15 {
            U256::from(200u64)
        } else if hf >= e18_12 {
            U256::from(150u64)
        } else if hf >= e18 {
            U256::from(100u64)
        } else {
            U256::ZERO
        }
    }

    /// 0–200 points. 10 per repayment, maxes at 20 repayments.
    fn repayment_score(&self, repayment_count: U256) -> U256 {
        let max_reps = U256::from(20u64);
        let points_per = U256::from(10u64);

        if repayment_count >= max_reps {
            U256::from(200u64)
        } else {
            repayment_count * points_per
        }
    }

    /// 0–100 points based on delegated credit amount.
    /// Cap at 10_000 USDC (10_000e6).
    fn delegated_score(&self, delegated: U256) -> U256 {
        if delegated.is_zero() {
            return U256::ZERO;
        }
        // cap = 10_000 * 10^6
        let cap = U256::from(10_000u64) * U256::from(10u64).pow(U256::from(6u64));
        if delegated >= cap {
            U256::from(100u64)
        } else {
            delegated * U256::from(100u64) / cap
        }
    }

    /// 0–100 bonus points for using BOTH Aave and Compound.
    /// Rewards cross-protocol diversification.
    fn cross_protocol_score(&self, aave_debt: U256, compound_debt: U256) -> U256 {
        match (!aave_debt.is_zero(), !compound_debt.is_zero()) {
            (true, true) => U256::from(100u64), // full bonus — active on both
            (true, false) | (false, true) => U256::from(40u64), // partial — single protocol
            (false, false) => U256::ZERO,
        }
    }

    /// 0–100 discount (penalty) for high utilization volatility.
    /// Measures swing between previous and current utilization.
    fn volatility_discount(
        &self,
        collateral: U256,
        delegated: U256,
        debt: U256,
        prev_utilization_bps: U256,
    ) -> U256 {
        let limit = collateral + delegated;
        if limit.is_zero() || debt.is_zero() {
            return U256::ZERO;
        }

        let current_util_bps = debt * U256::from(10_000u64) / limit;

        // Absolute swing between current and previous utilization
        let swing_bps = if current_util_bps > prev_utilization_bps {
            current_util_bps - prev_utilization_bps
        } else {
            prev_utilization_bps - current_util_bps
        };

        // No penalty under 1000bps (10%) swing
        if swing_bps <= U256::from(1000u64) {
            return U256::ZERO;
        }

        // Linear penalty up to 100 for a 5000bps (50%) swing
        let excess_swing = swing_bps - U256::from(1000u64);
        let max_swing = U256::from(4000u64);
        let penalty = excess_swing * U256::from(100u64) / max_swing;

        if penalty > U256::from(100u64) {
            U256::from(100u64)
        } else {
            penalty
        }
    }

    /// 0–150 penalty for utilization above 50%.
    fn utilization_penalty(&self, collateral: U256, delegated: U256, debt: U256) -> U256 {
        let limit = collateral + delegated;
        if limit.is_zero() || debt.is_zero() {
            return U256::ZERO;
        }

        let util_bps = debt * U256::from(10_000u64) / limit;

        if util_bps <= U256::from(5000u64) {
            U256::ZERO
        } else if util_bps >= U256::from(10_000u64) {
            U256::from(150u64)
        } else {
            (util_bps - U256::from(5000u64)) * U256::from(150u64) / U256::from(5000u64)
        }
    }

    /// 100 per liquidation, capped at 300.
    fn liquidation_penalty(&self, liquidation_count: U256) -> U256 {
        let penalty = liquidation_count * U256::from(100u64);
        if penalty > U256::from(300u64) {
            U256::from(300u64)
        } else {
            penalty
        }
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use stylus_sdk::alloy_primitives::U256;

    fn engine() -> CreditScoreEngine {
        unsafe { CreditScoreEngine::new(U256::ZERO, 0) }
    }

    fn u(n: u64) -> U256 { U256::from(n) }
    fn scale(n: u64, decimals: u32) -> U256 {
        U256::from(n) * U256::from(10u64).pow(U256::from(decimals))
    }

    // ── age_score ─────────────────────────────────────────────────────────

    #[test]
    fn age_score_zero_days() {
        let e = engine();
        assert_eq!(e.age_score(u(0)), u(0));
    }

    #[test]
    fn age_score_max_at_180_days() {
        let e = engine();
        assert_eq!(e.age_score(u(180)), u(150));
        assert_eq!(e.age_score(u(365)), u(150)); // capped
    }

    #[test]
    fn age_score_90_days_is_75() {
        let e = engine();
        assert_eq!(e.age_score(u(90)), u(75));
    }

    // ── health_score ──────────────────────────────────────────────────────

    #[test]
    fn health_score_no_debt_is_250() {
        let e = engine();
        assert_eq!(e.health_score(scale(1000, 6), u(0), u(0)), u(250));
    }

    #[test]
    fn health_score_hf_above_2_is_250() {
        let e = engine();
        // collateral = 2000, debt = 500 → HF = 4.0
        assert_eq!(e.health_score(scale(2000, 6), u(0), scale(500, 6)), u(250));
    }

    #[test]
    fn health_score_hf_below_1_is_0() {
        let e = engine();
        // collateral = 400, debt = 500 → HF = 0.8
        assert_eq!(e.health_score(scale(400, 6), u(0), scale(500, 6)), u(0));
    }

    // ── repayment_score ───────────────────────────────────────────────────

    #[test]
    fn repayment_score_20_reps_is_200() {
        let e = engine();
        assert_eq!(e.repayment_score(u(20)), u(200));
        assert_eq!(e.repayment_score(u(50)), u(200));
    }

    #[test]
    fn repayment_score_5_reps_is_50() {
        let e = engine();
        assert_eq!(e.repayment_score(u(5)), u(50));
    }

    // ── cross_protocol_score ──────────────────────────────────────────────

    #[test]
    fn cross_protocol_both_active_is_100() {
        let e = engine();
        assert_eq!(e.cross_protocol_score(scale(100, 6), scale(200, 6)), u(100));
    }

    #[test]
    fn cross_protocol_one_active_is_40() {
        let e = engine();
        assert_eq!(e.cross_protocol_score(scale(100, 6), u(0)), u(40));
    }

    #[test]
    fn cross_protocol_neither_is_0() {
        let e = engine();
        assert_eq!(e.cross_protocol_score(u(0), u(0)), u(0));
    }

    // ── utilization_penalty ───────────────────────────────────────────────

    #[test]
    fn util_penalty_below_50_pct_is_zero() {
        let e = engine();
        // debt=400, limit=1000 → 40% util
        assert_eq!(e.utilization_penalty(scale(1000, 6), u(0), scale(400, 6)), u(0));
    }

    #[test]
    fn util_penalty_full_is_150() {
        let e = engine();
        // debt=1000, limit=1000 → 100% util
        assert_eq!(e.utilization_penalty(scale(1000, 6), u(0), scale(1000, 6)), u(150));
    }

    // ── liquidation_penalty ───────────────────────────────────────────────

    #[test]
    fn liq_penalty_0_is_zero() {
        let e = engine();
        assert_eq!(e.liquidation_penalty(u(0)), u(0));
    }

    #[test]
    fn liq_penalty_caps_at_300() {
        let e = engine();
        assert_eq!(e.liquidation_penalty(u(5)), u(300));
        assert_eq!(e.liquidation_penalty(u(100)), u(300));
    }

    // ── borrow_rate_bps ───────────────────────────────────────────────────

    #[test]
    fn borrow_rate_zero_util_is_base() {
        let e = engine();
        // base=100, slope1=400, slope2=7500, optimal=8000
        assert_eq!(e.borrow_rate_bps(u(0), u(100), u(400), u(7500), u(8000)), u(100));
    }

    #[test]
    fn borrow_rate_at_optimal_is_base_plus_slope1() {
        let e = engine();
        // at 80% util: rate = 100 + 400 = 500 bps
        assert_eq!(e.borrow_rate_bps(u(8000), u(100), u(400), u(7500), u(8000)), u(500));
    }

    #[test]
    fn borrow_rate_above_optimal_uses_slope2() {
        let e = engine();
        // at 90% util: excess=1000, remaining=2000
        // rate = 100 + 400 + (1000 * 7500 / 2000) = 100 + 400 + 3750 = 4250
        assert_eq!(e.borrow_rate_bps(u(9000), u(100), u(400), u(7500), u(8000)), u(4250));
    }

    // ── aggregate_health_factor ───────────────────────────────────────────

    #[test]
    fn aggregate_hf_no_debt_is_max() {
        let e = engine();
        let hf = e.aggregate_health_factor(
            scale(1000, 6), u(8500),
            u(0),
            scale(500, 6), u(7500),
            u(0),
        );
        assert_eq!(hf, U256::MAX);
    }

    #[test]
    fn aggregate_hf_computed_correctly() {
        let e = engine();
        // aave: collateral=1000, threshold=85%, debt=500
        // compound: collateral=500, threshold=75%, debt=200
        // weighted = (1000*8500 + 500*7500)/10000 = (8500000+3750000)/10000 = 1225
        // total_debt = 700
        // HF = 1225 * 1e18 / 700 ≈ 1.75e18
        let hf = e.aggregate_health_factor(
            scale(1000, 6), u(8500),
            scale(500, 6),
            scale(500, 6), u(7500),
            scale(200, 6),
        );
        // Should be ~1.75e18
        let expected_approx = U256::from(175u64) * U256::from(10u64).pow(U256::from(16u64));
        assert!(hf >= expected_approx - U256::from(10u64).pow(U256::from(14u64)));
        assert!(hf <= expected_approx + U256::from(10u64).pow(U256::from(14u64)));
    }

    // ── compute_credit_score (integration) ───────────────────────────────

    #[test]
    fn score_new_user_is_low() {
        let e = engine();
        let score = e.compute_credit_score(
            scale(1000, 6), // collateral
            u(0),           // no delegated
            u(0),           // no debt
            u(0),           // 0 days old
            u(0),           // 0 repayments
            u(0),           // 0 liquidations
            u(0),           // no aave debt
            u(0),           // no compound debt
            u(0),           // prev util = 0
        );
        // new account, no debt → health=250, everything else 0 → score=250
        assert_eq!(score, u(250));
    }

    #[test]
    fn score_established_user_is_high() {
        let e = engine();
        let score = e.compute_credit_score(
            scale(5000, 6),  // collateral
            scale(2000, 6),  // delegated
            scale(1000, 6),  // debt (HF = 7.0 → 250)
            u(200),          // 200 days old → 150
            u(25),           // >20 repayments → 200
            u(0),            // no liquidations
            scale(500, 6),   // active on aave
            scale(500, 6),   // active on compound → cross=100
            u(1000),         // prev util 10% (debt/limit=1000/7000=14%) → small swing
        );
        // gross = 150+250+200+100+100 = 800
        // util pen: debt=1000, limit=7000 → 14% → 0
        // liq pen: 0
        // volatility: current=1428bps, prev=1000bps, swing=428 < 1000 → 0
        // score = 800
        assert_eq!(score, u(800));
    }

    #[test]
    fn score_never_exceeds_1000() {
        let e = engine();
        let score = e.compute_credit_score(
            scale(100_000, 6),
            scale(100_000, 6),
            scale(1, 6),
            u(365),
            u(100),
            u(0),
            scale(1000, 6),
            scale(1000, 6),
            u(0),
        );
        assert!(score <= u(1000));
    }

    #[test]
    fn score_liquidated_account_is_penalised() {
        let e = engine();
        let score = e.compute_credit_score(
            scale(1000, 6),
            u(0),
            scale(500, 6),
            u(180),
            u(10),
            u(3), // 3 liquidations → -300
            u(500),
            u(0),
            u(5000),
        );
        // gross: age=150, health=?(HF=2→250), repay=100, delegated=0, cross=40 = 540
        // penalties: liq=300, util=? (debt=500,limit=1000 → 50% → 0), volatility small
        // score = 540 - 300 = 240
        assert!(score <= u(300));
    }
}