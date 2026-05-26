#![no_std]

extern crate alloc;

use alloc::{vec, vec::Vec};

use alloy_sol_types::sol;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    prelude::*,
};

sol_storage! {
    #[entrypoint]
    pub struct CreditScoreEngine {
        address owner;
        mapping(address => bool) authorised;
        mapping(address => UserProfile) profiles;
    }

    pub struct UserProfile {
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 repaymentCount;
        uint256 liquidationCount;
        uint256 protocolCount;
        uint256 lastUtilizationBps;
        uint256 utilizationSnapshots;
        uint256 utilizationAccumulator;
        uint256 score;
        uint256 lastUpdated;
    }
}

sol! {
    error NotAuthorised();
    error InvalidInput();
}

#[derive(SolidityError)]
pub enum EngineError {
    NotAuthorised(NotAuthorised),
    InvalidInput(InvalidInput),
}

#[public]
impl CreditScoreEngine {

    pub fn initialize(&mut self) -> Result<(), Vec<u8>> {
        let zero = Address::ZERO;

        if self.owner.get() != zero {
            return Err(
                EngineError::NotAuthorised(
                    NotAuthorised {}
                ).into()
            );
        }

        self.owner.set(
            self.vm().msg_sender()
        );

        Ok(())
    }

    pub fn set_authorised(
        &mut self,
        caller: Address,
        allowed: bool,
    ) -> Result<(), Vec<u8>> {

        if self.vm().msg_sender()
            != self.owner.get()
        {
            return Err(
                EngineError::NotAuthorised(
                    NotAuthorised {}
                ).into()
            );
        }

        self.authorised
            .setter(caller)
            .set(allowed);

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn compute_credit_score(
        &self,
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        protocol_count: U256,
        prev_utilization_bps: U256,
    ) -> U256 {

        score_math::compute(
            collateral_value,
            delegated_credit,
            total_debt,
            account_age_days,
            repayment_count,
            liquidation_count,
            protocol_count,
            prev_utilization_bps,
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn score_breakdown(
        &self,
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        protocol_count: U256,
        prev_utilization_bps: U256,
    ) -> (
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
    ) {

        score_math::breakdown(
            collateral_value,
            delegated_credit,
            total_debt,
            account_age_days,
            repayment_count,
            liquidation_count,
            protocol_count,
            prev_utilization_bps,
        )
    }

    pub fn risk_tier_from_score(
        &self,
        score: U256,
    ) -> U256 {

        score_math::risk_tier(score)
    }

    pub fn max_ltv_bps(
        &self,
        tier: U256,
    ) -> U256 {

        score_math::max_ltv(tier)
    }

    pub fn aggregate_health_factor(
        &self,
        aave_collateral: U256,
        aave_liq_bps: U256,
        aave_debt: U256,
        compound_collateral: U256,
        compound_liq_bps: U256,
        compound_debt: U256,
    ) -> U256 {

        score_math::aggregate_hf(
            aave_collateral,
            aave_liq_bps,
            aave_debt,
            compound_collateral,
            compound_liq_bps,
            compound_debt,
        )
    }

    pub fn record_supply(
    &mut self,
    user: Address,
    amount: U256,
) -> Result<(), Vec<u8>> {

    self.only_authorised()?;

    let block_timestamp =
        self.vm().block_timestamp();

    let mut profile =
        self.profiles.setter(user);

    let current =
        profile.totalSupplied.get();

    profile
        .totalSupplied
        .set(current + amount);

    profile
        .lastUpdated
        .set(
            U256::from(
                block_timestamp
            )
        );

    Ok(())
}

pub fn record_borrow(
    &mut self,
    user: Address,
    amount: U256,
    protocol_count: U256,
    utilization_bps: U256,
) -> Result<(), Vec<u8>> {

    self.only_authorised()?;

    let block_timestamp =
        self.vm().block_timestamp();

    let mut profile =
        self.profiles.setter(user);

    let borrowed =
        profile.totalBorrowed.get();

    profile
        .totalBorrowed
        .set(borrowed + amount);

    let old_acc =
        profile
            .utilizationAccumulator
            .get();

    profile
        .utilizationAccumulator
        .set(
            old_acc
                + utilization_bps
        );

    let snaps =
        profile
            .utilizationSnapshots
            .get();

    profile
        .utilizationSnapshots
        .set(
            snaps
                + U256::from(1u64)
        );

    profile
        .lastUtilizationBps
        .set(utilization_bps);

    profile
        .protocolCount
        .set(protocol_count);

    profile
        .lastUpdated
        .set(
            U256::from(
                block_timestamp
            )
        );

    Ok(())
}

pub fn average_utilization(
    &self,
    user: Address,
) -> U256 {

    let profile =
        self.profiles.get(user);

    let snaps =
        profile
            .utilizationSnapshots
            .get();

    if snaps == U256::ZERO {
        return U256::ZERO;
    }

    profile
        .utilizationAccumulator
        .get()
        / snaps
}
    pub fn record_repayment(
        &mut self,
        user: Address,
    ) -> Result<(), Vec<u8>> {

        self.only_authorised()?;

        let mut profile =
            self.profiles.setter(user);

        let current =
            profile.repaymentCount.get();

        profile
            .repaymentCount
            .set(
                current
                    + U256::from(1u64)
            );

        Ok(())
    }

    pub fn record_liquidation(
        &mut self,
        user: Address,
    ) -> Result<(), Vec<u8>> {

        self.only_authorised()?;

        let mut profile =
            self.profiles.setter(user);

        let current =
            profile.liquidationCount.get();

        profile
            .liquidationCount
            .set(
                current
                    + U256::from(1u64)
            );

        Ok(())
    }

    fn only_authorised(
        &self,
    ) -> Result<(), Vec<u8>> {

        if !self.authorised.get(
            self.vm().msg_sender()
        ) {

            return Err(
                EngineError::NotAuthorised(
                    NotAuthorised {}
                ).into()
            );
        }

        Ok(())
    }
}

pub mod score_math {

    use stylus_sdk::alloy_primitives::U256;

    #[allow(clippy::too_many_arguments)]
    pub fn compute(
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        protocol_count: U256,
        prev_utilization_bps: U256,
    ) -> U256 {

        let (
            age,
            health,
            repay,
            delegated,
            diversity,
            vol_pen,
            util_pen,
            liq_pen,
        ) = breakdown(
            collateral_value,
            delegated_credit,
            total_debt,
            account_age_days,
            repayment_count,
            liquidation_count,
            protocol_count,
            prev_utilization_bps,
        );

        let stability_bonus =
            if util_pen.is_zero() {
                U256::from(50u64)
            } else {
                U256::ZERO
            };

        let gross =
            age
            + health
            + repay
            + delegated
            + diversity
            + stability_bonus;

        let penalties =
            util_pen
            + liq_pen
            + vol_pen;

        if penalties >= gross {
            return U256::ZERO;
        }

        let score =
            gross - penalties;

        if score > U256::from(1000u64) {
            U256::from(1000u64)
        } else {
            score
        }
    }

    #[allow(clippy::too_many_arguments)]
    pub fn breakdown(
        collateral_value: U256,
        delegated_credit: U256,
        total_debt: U256,
        account_age_days: U256,
        repayment_count: U256,
        liquidation_count: U256,
        protocol_count: U256,
        prev_utilization_bps: U256,
    ) -> (
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
        U256,
    ) {

        (
            age_score(account_age_days),

            health_score(
                collateral_value,
                delegated_credit,
                total_debt,
            ),

            repayment_score(
                repayment_count
            ),

            delegated_score(
                delegated_credit
            ),

            diversity_score(
                protocol_count
            ),

            volatility_penalty(
                collateral_value,
                delegated_credit,
                total_debt,
                prev_utilization_bps,
            ),

            util_penalty(
                collateral_value,
                delegated_credit,
                total_debt,
            ),

            liq_penalty(
                liquidation_count
            ),
        )
    }

    pub fn risk_tier(
        score: U256,
    ) -> U256 {

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

    pub fn max_ltv(
        tier: U256,
    ) -> U256 {

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

    pub fn aggregate_hf(
        aave_collateral: U256,
        aave_liq_bps: U256,
        aave_debt: U256,
        compound_collateral: U256,
        compound_liq_bps: U256,
        compound_debt: U256,
    ) -> U256 {

        let total_debt =
            aave_debt
            + compound_debt;

        if total_debt.is_zero() {
            return U256::MAX;
        }

        let aave_weighted =
            aave_collateral
            * aave_liq_bps
            / U256::from(10_000u64);

        let compound_weighted =
            compound_collateral
            * compound_liq_bps
            / U256::from(10_000u64);

        let scale =
            U256::from(10u64)
                .pow(
                    U256::from(18u64)
                );

        (
            aave_weighted
            + compound_weighted
        ) * scale / total_debt
    }

    pub fn age_score(
        days: U256,
    ) -> U256 {

        if days >= U256::from(180u64) {
            U256::from(150u64)
        } else {
            days
                * U256::from(150u64)
                / U256::from(180u64)
        }
    }

    pub fn diversity_score(
        protocols: U256,
    ) -> U256 {

        if protocols >= U256::from(4u64) {
            U256::from(150u64)
        } else if protocols
            == U256::from(3u64)
        {
            U256::from(100u64)
        } else if protocols
            == U256::from(2u64)
        {
            U256::from(60u64)
        } else if protocols
            == U256::from(1u64)
        {
            U256::from(25u64)
        } else {
            U256::ZERO
        }
    }

    pub fn health_score(
        collateral: U256,
        delegated: U256,
        debt: U256,
    ) -> U256 {

        if debt.is_zero() {
            return U256::from(250u64);
        }

        let scale =
            U256::from(10u64)
                .pow(
                    U256::from(18u64)
                );

        let hf =
            (collateral + delegated)
            * scale
            / debt;

        if hf >= U256::from(2u64) * scale {
            U256::from(250u64)
        } else if hf
            >= U256::from(15u64)
                * scale
                / U256::from(10u64)
        {
            U256::from(200u64)
        } else if hf
            >= U256::from(12u64)
                * scale
                / U256::from(10u64)
        {
            U256::from(150u64)
        } else if hf >= scale {
            U256::from(100u64)
        } else {
            U256::ZERO
        }
    }

    pub fn repayment_score(
        count: U256,
    ) -> U256 {

        if count >= U256::from(20u64) {
            U256::from(200u64)
        } else {
            count
                * U256::from(10u64)
        }
    }

    pub fn delegated_score(
        delegated: U256,
    ) -> U256 {

        if delegated.is_zero() {
            return U256::ZERO;
        }

        let cap =
            U256::from(10_000u64)
            * U256::from(10u64)
                .pow(
                    U256::from(6u64)
                );

        if delegated >= cap {
            U256::from(100u64)
        } else {
            delegated
                * U256::from(100u64)
                / cap
        }
    }

    pub fn volatility_penalty(
        collateral: U256,
        delegated: U256,
        debt: U256,
        prev_bps: U256,
    ) -> U256 {

        let limit =
            collateral + delegated;

        if limit.is_zero()
            || debt.is_zero()
        {
            return U256::ZERO;
        }

        let current_bps =
            debt
            * U256::from(10_000u64)
            / limit;

        let swing =
            if current_bps > prev_bps {
                current_bps - prev_bps
            } else {
                prev_bps - current_bps
            };

        if swing <= U256::from(1000u64) {
            return U256::ZERO;
        }

        let penalty =
            (swing
                - U256::from(1000u64))
            * U256::from(100u64)
            / U256::from(4000u64);

        if penalty > U256::from(100u64) {
            U256::from(100u64)
        } else {
            penalty
        }
    }

    pub fn util_penalty(
        collateral: U256,
        delegated: U256,
        debt: U256,
    ) -> U256 {

        let limit =
            collateral + delegated;

        if limit.is_zero()
            || debt.is_zero()
        {
            return U256::ZERO;
        }

        let bps =
            debt
            * U256::from(10_000u64)
            / limit;

        if bps <= U256::from(5000u64) {
            U256::ZERO
        } else if bps
            >= U256::from(10_000u64)
        {
            U256::from(150u64)
        } else {

            (
                bps
                - U256::from(5000u64)
            ) * U256::from(150u64)
                / U256::from(5000u64)
        }
    }

    pub fn liq_penalty(
        count: U256,
    ) -> U256 {

        let penalty =
            count
            * U256::from(100u64);

        if penalty
            > U256::from(300u64)
        {
            U256::from(300u64)
        } else {
            penalty
        }
    }
}

#[cfg(feature = "export-abi")]
fn main() {}