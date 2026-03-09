// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICreditManager {
    function setPool(address pool) external;

    function validateBorrow(address user, uint256 amount) external view returns (bool);

    function onBorrow(address user, uint256 amount) external;

    function onRepay(address user, uint256 amount) external;

    function onLiquidation(address user, uint256 repayAmount) external;

    function totalDebt(address user) external view returns (uint256);

    function creditLimit(address user) external view returns (uint256);

    function frozen(address user) external view returns (bool);

    function setDelegatedCredit(address user, uint256 value) external;

    function healthFactor(address user) external view returns (uint256);

    function collateralValue(address user) external view returns (uint256);

    function delegatedCredit(address user) external view returns (uint256);

    function creditScore(address user) external view returns (uint256);

    function riskTier(address user) external view returns (uint8);

    function scoreBreakdown(address user)
        external
        view
        returns (
            uint256 ageScore,
            uint256 healthScore,
            uint256 repaymentScore,
            uint256 delegatedScore,
            uint256 utilizationPenalty,
            uint256 liquidationPenalty
        );

    function userMetrics(address user)
        external
        view
        returns (
            uint256 collateral,
            uint256 delegated,
            uint256 debt,
            uint256 hf,
            uint256 score,
            uint8 tier,
            uint256 openedAt,
            uint256 borrows,
            uint256 repays,
            uint256 liquidations,
            bool isFrozen
        );
}