// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ICreditScoreEngine
/// @notice Solidity interface for the Arbitrum Stylus CreditScoreEngine WASM contract.
///         CreditManager calls this instead of running score math in Solidity.
interface ICreditScoreEngine {
    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Called once after deployment — sets the deployer as owner.
    function initialize() external;

    /// @notice Authorise or de-authorise a caller (e.g. CreditManager).
    function setAuthorised(address caller, bool allowed) external;
    /// @notice Compute a credit score (0–1000) from raw user metrics.
    /// @param collateralValue   USD collateral value (6 decimals)
    /// @param delegatedCredit   USD delegated credit (6 decimals)
    /// @param totalDebt         Current total debt (6 decimals)
    /// @param accountAgeDays    Days since account was first opened
    /// @param repaymentCount    Number of successful repayments
    /// @param liquidationCount  Number of liquidations
    /// @param aaveDebt          Debt on Aave (6 decimals)
    /// @param compoundDebt      Debt on Compound (6 decimals)
    /// @param prevUtilizationBps Utilization 7 days ago in bps (for volatility calc)
    function computeCreditScore(
        uint256 collateralValue,
        uint256 delegatedCredit,
        uint256 totalDebt,
        uint256 accountAgeDays,
        uint256 repaymentCount,
        uint256 liquidationCount,
        uint256 aaveDebt,
        uint256 compoundDebt,
        uint256 prevUtilizationBps
    ) external view returns (uint256 score);

    /// @notice Full breakdown of score components for frontend display.
    /// @return ageScore Age-based score (0-150)
    /// @return healthScore Health factor score (0-250)
    /// @return repayScore Repayment history score (0-200)
    /// @return delegatedScore Delegated credit score (0-100)
    /// @return crossProtocolScore Cross-protocol bonus (0-100)
    /// @return volatilityDiscount Volatility penalty (0-100)
    /// @return utilizationPenalty Utilization penalty (0-150)
    /// @return liquidationPenalty Liquidation penalty (0-300)
    function scoreBreakdown(
        uint256 collateralValue,
        uint256 delegatedCredit,
        uint256 totalDebt,
        uint256 accountAgeDays,
        uint256 repaymentCount,
        uint256 liquidationCount,
        uint256 aaveDebt,
        uint256 compoundDebt,
        uint256 prevUtilizationBps
    ) external view returns (
        uint256 ageScore,
        uint256 healthScore,
        uint256 repayScore,
        uint256 delegatedScore,
        uint256 crossProtocolScore,
        uint256 volatilityDiscount,
        uint256 utilizationPenalty,
        uint256 liquidationPenalty
    );

    /// @notice Derive risk tier (0–3) from a credit score.
    function riskTierFromScore(uint256 score) external view returns (uint256 tier);

    /// @notice Max LTV in bps for a given risk tier.
    function maxLtvBps(uint256 tier) external view returns (uint256 ltv);

    /// @notice Aggregate health factor across Aave + Compound, scaled 1e18.
    function aggregateHealthFactor(
        uint256 aaveCollateral,
        uint256 aaveLiqThresholdBps,
        uint256 aaveDebt,
        uint256 compoundCollateral,
        uint256 compoundLiqThresholdBps,
        uint256 compoundDebt
    ) external view returns (uint256 hf);

    /// @notice Variable rate model — returns borrow rate in bps/year.
    function borrowRateBps(
        uint256 utilizationBps,
        uint256 baseRateBps,
        uint256 slope1Bps,
        uint256 slope2Bps,
        uint256 optimalUtilizationBps
    ) external view returns (uint256 rate);

    /// @notice Supply rate in bps/year.
    function supplyRateBps(
        uint256 utilizationBps,
        uint256 borrowRateBpsVal,
        uint256 reserveFactorBps
    ) external view returns (uint256 rate);
}
