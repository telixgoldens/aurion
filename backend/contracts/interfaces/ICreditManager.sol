// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICreditManager {
    // ─── Pool setup ───────────────────────────────────────────────────────────
    function setPool(address pool) external;

    // ─── Core lifecycle ───────────────────────────────────────────────────────
    function validateBorrow(address user, uint256 amount) external view returns (bool);
    function onBorrow(address user, uint256 amount) external;
    function onRepay(address user, uint256 amount) external;
    function onLiquidation(address user, uint256 repayAmount) external;
    function freeze(address user) external;
    function unfreeze(address user) external;

    // ─── Per-protocol debt tracking (feeds Stylus cross-protocol score) ───────
    function recordAaveBorrow(address user, uint256 amount) external;
    function recordCompoundBorrow(address user, uint256 amount) external;
    function recordAaveRepay(address user, uint256 amount) external;
    function recordCompoundRepay(address user, uint256 amount) external;

    // ─── Score engine ─────────────────────────────────────────────────────────
    function setScoreEngine(address engine) external;

    // ─── Views ────────────────────────────────────────────────────────────────
    function totalDebt(address user) external view returns (uint256);
    function creditLimit(address user) external view returns (uint256);
    function frozen(address user) external view returns (bool);
    function setDelegatedCredit(address user, uint256 value) external;
    function healthFactor(address user) external view returns (uint256);
    function collateralValue(address user) external view returns (uint256);
    function delegatedCredit(address user) external view returns (uint256);
    function creditScore(address user) external view returns (uint256);
    function riskTier(address user) external view returns (uint8);

    // ─── Score breakdown — 8 components (6 positive + 2 penalty) ─────────────
    // Renamed from scoreBreakdown to creditScoreBreakdown to match CreditManager.
    // The original 6-value scoreBreakdown is kept below for backwards compat.
    function creditScoreBreakdown(address user)
        external
        view
        returns (
            uint256 ageScore,
            uint256 healthScore,
            uint256 repayScore,
            uint256 delegatedScore,
            uint256 crossProtocolScore,
            uint256 volatilityDiscount,
            uint256 utilizationPenalty,
            uint256 liquidationPenalty
        );

    // ─── Legacy — kept so existing callers don't break ────────────────────────
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
