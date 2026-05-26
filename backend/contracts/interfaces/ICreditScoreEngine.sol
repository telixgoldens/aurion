// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICreditScoreEngine {
    function initialize() external;

    function setAuthorised(address caller, bool allowed) external;

    function computeCreditScore(
        uint256 collateralValue,
        uint256 delegatedCredit,
        uint256 totalDebt,
        uint256 accountAgeDays,
        uint256 repaymentCount,
        uint256 liquidationCount,
        uint256 protocolCount,
        uint256 prevUtilizationBps
    ) external view returns (uint256 score);

    function scoreBreakdown(
        uint256 collateralValue,
        uint256 delegatedCredit,
        uint256 totalDebt,
        uint256 accountAgeDays,
        uint256 repaymentCount,
        uint256 liquidationCount,
        uint256 protocolCount,
        uint256 prevUtilizationBps
    ) external view returns (
        uint256 ageScore,
        uint256 healthScore,
        uint256 repayScore,
        uint256 delegatedScore,
        uint256 diversityScore,
        uint256 volatilityPenalty,
        uint256 utilizationPenalty,
        uint256 liquidationPenalty
    );

    function riskTierFromScore(uint256 score) external view returns (uint256 tier);

    function maxLtvBps(uint256 tier) external view returns (uint256 ltv);

    function aggregateHealthFactor(
        uint256 aaveCollateral,
        uint256 aaveLiqThresholdBps,
        uint256 aaveDebt,
        uint256 compoundCollateral,
        uint256 compoundLiqThresholdBps,
        uint256 compoundDebt
    ) external view returns (uint256 hf);

    function recordSupply(address user, uint256 amount) external;

    function recordBorrow(
        address user,
        uint256 amount,
        uint256 protocolCount,
        uint256 utilizationBps
    ) external;

    function recordRepayment(address user) external;

    function recordLiquidation(address user) external;

    function averageUtilization(address user) external view returns (uint256);
}
