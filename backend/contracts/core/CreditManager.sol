// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Errors} from "../libraries/Errors.sol";
import {ICreditManager} from "../interfaces/ICreditManager.sol";
import {ICreditScoreEngine} from "../interfaces/ICreditScoreEngine.sol";

/// @title CreditManager
/// @notice Central state coordinator for all credit accounts.
///         Credit scoring and rate math are delegated to the Arbitrum Stylus
///         CreditScoreEngine (WASM) for cheaper, more complex computation.
contract CreditManager is ICreditManager {
    // ─── Roles ────────────────────────────────────────────────────────────────

    address public router;
    address public oracle;
    address public pool;

    /// @notice Arbitrum Stylus CreditScoreEngine — handles all score math in WASM.
    ICreditScoreEngine public scoreEngine;

    // ─── Per-user state ───────────────────────────────────────────────────────

    mapping(address => uint256) private _collateralValue;
    mapping(address => uint256) private _delegatedCredit;
    mapping(address => uint256) private _totalDebt;
    mapping(address => bool) public frozen;

    mapping(address => uint256) public accountOpenedAt;
    mapping(address => uint256) public borrowCount;
    mapping(address => uint256) public repaymentCount;
    mapping(address => uint256) public liquidationCount;

    /// @notice Per-protocol debt tracking — fed into cross-protocol score.
    mapping(address => uint256) public aaveDebt;
    mapping(address => uint256) public compoundDebt;

    /// @notice Utilization snapshot 7 days ago — fed into volatility calculation.
    mapping(address => uint256) public prevUtilizationBps;
    mapping(address => uint256) public prevUtilizationTimestamp;

    // ─── Events ───────────────────────────────────────────────────────────────

    event BorrowRecorded(address indexed user, uint256 amount, uint256 newDebt);
    event RepayRecorded(address indexed user, uint256 amount, uint256 newDebt);
    event LiquidationRecorded(address indexed user, uint256 repayAmount, uint256 newDebt);
    event Frozen(address indexed user);
    event Unfrozen(address indexed user);
    event ScoreEngineSet(address engine);
    event PoolSet(address pool);
    event UtilizationSnapshotted(address indexed user, uint256 utilizationBps);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyRouter() {
        if (msg.sender != router) revert Errors.NotAuthorized();
        _;
    }

    modifier onlyRouterOrPool() {
        if (msg.sender != router && msg.sender != pool) revert Errors.NotAuthorized();
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _router, address _oracle) {
        if (_router == address(0)) revert Errors.ZeroAddress();
        if (_oracle == address(0)) revert Errors.ZeroAddress();
        router = _router;
        oracle = _oracle;
    }

    // ─── Admin setters ────────────────────────────────────────────────────────

    /// @notice Set the Stylus score engine. One-time — cannot be replaced.
    function setScoreEngine(address _engine) external onlyRouter {
        if (address(scoreEngine) != address(0)) revert Errors.AlreadySet();
        if (_engine == address(0)) revert Errors.ZeroAddress();
        scoreEngine = ICreditScoreEngine(_engine);
        emit ScoreEngineSet(_engine);
    }

    /// @notice Set the CreditPool. One-time.
    function setPool(address _pool) external onlyRouter {
        if (pool != address(0)) revert Errors.AlreadySet();
        if (_pool == address(0)) revert Errors.ZeroAddress();
        pool = _pool;
        emit PoolSet(_pool);
    }

    function setCollateralValue(address user, uint256 value) external onlyRouter {
        _collateralValue[user] = value;
    }

    function setDelegatedCredit(address user, uint256 value) external onlyRouterOrPool {
        _delegatedCredit[user] = value;
    }

    // ─── Protocol-specific debt tracking ─────────────────────────────────────

    /// @notice Called by CreditRouter when a borrow is routed to Aave.
    function recordAaveBorrow(address user, uint256 amount) external onlyRouter {
        aaveDebt[user] += amount;
    }

    /// @notice Called by CreditRouter when a borrow is routed to Compound.
    function recordCompoundBorrow(address user, uint256 amount) external onlyRouter {
        compoundDebt[user] += amount;
    }

    /// @notice Called by CreditRouter on repayment — reduces per-protocol debt.
    function recordAaveRepay(address user, uint256 amount) external onlyRouter {
        uint256 d = aaveDebt[user];
        aaveDebt[user] = amount >= d ? 0 : d - amount;
    }

    function recordCompoundRepay(address user, uint256 amount) external onlyRouter {
        uint256 d = compoundDebt[user];
        compoundDebt[user] = amount >= d ? 0 : d - amount;
    }

    // ─── Lifecycle hooks ──────────────────────────────────────────────────────

    function validateBorrow(address user, uint256 amount) external view override returns (bool) {
        if (frozen[user]) return false;
        if (amount == 0) return false;

        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        return _totalDebt[user] + amount <= limit;
    }

    function onBorrow(address user, uint256 amount) external override onlyRouter {
        if (!this.validateBorrow(user, amount)) revert Errors.InsufficientCredit();

        if (accountOpenedAt[user] == 0) {
            accountOpenedAt[user] = block.timestamp;
        }

        _snapshotUtilization(user);
        _totalDebt[user] += amount;
        borrowCount[user] += 1;

        emit BorrowRecorded(user, amount, _totalDebt[user]);
    }

    function onRepay(address user, uint256 amount) external onlyRouter {
        uint256 debt = _totalDebt[user];
        if (amount > debt) amount = debt;

        _snapshotUtilization(user);
        _totalDebt[user] -= amount;

        if (amount > 0) {
            repaymentCount[user] += 1;
        }

        emit RepayRecorded(user, amount, _totalDebt[user]);
    }

    function onLiquidation(address user, uint256 repayAmount) external override onlyRouter {
        if (repayAmount == 0) revert Errors.InvalidAmount();

        uint256 debt = _totalDebt[user];
        if (repayAmount > debt) revert Errors.RepayExceedsDebt();

        _totalDebt[user] = debt - repayAmount;
        liquidationCount[user] += 1;
        frozen[user] = true;

        emit LiquidationRecorded(user, repayAmount, _totalDebt[user]);
        emit Frozen(user);
    }

    function freeze(address user) external onlyRouter {
        frozen[user] = true;
        emit Frozen(user);
    }

    /// @notice Unfreeze an account — allows router to reinstate a user after review.
    function unfreeze(address user) external onlyRouter {
        frozen[user] = false;
        emit Unfrozen(user);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function totalDebt(address user) external view override returns (uint256) {
        return _totalDebt[user];
    }

    function creditLimit(address user) external view override returns (uint256) {
        return _collateralValue[user] + _delegatedCredit[user];
    }

    function collateralValue(address user) external view returns (uint256) {
        return _collateralValue[user];
    }

    function delegatedCredit(address user) external view returns (uint256) {
        return _delegatedCredit[user];
    }

    function healthFactor(address user) public view returns (uint256) {
        uint256 debt = _totalDebt[user];
        if (debt == 0) return type(uint256).max;

        uint256 credit = _collateralValue[user] + _delegatedCredit[user];
        return (credit * 1e18) / debt;
    }

    /// @notice Credit score — delegates to Stylus engine if set, falls back to
    ///         on-chain calculation otherwise (graceful degradation during deploy).
    function creditScore(address user) public view returns (uint256) {
        if (address(scoreEngine) != address(0)) {
            return scoreEngine.computeCreditScore(
                _collateralValue[user],
                _delegatedCredit[user],
                _totalDebt[user],
                _accountAgeDays(user),
                repaymentCount[user],
                liquidationCount[user],
                aaveDebt[user],
                compoundDebt[user],
                prevUtilizationBps[user]
            );
        }
        // Fallback: simplified on-chain scoring (no cross-protocol, no volatility)
        return _fallbackCreditScore(user);
    }

    /// @notice Full score breakdown from the Stylus engine — for frontend display.
    function creditScoreBreakdown(address user) external view returns (
        uint256 ageScore,
        uint256 healthScore,
        uint256 repayScore,
        uint256 delegatedScore,
        uint256 crossProtocolScore,
        uint256 volatilityDiscount,
        uint256 utilizationPenalty,
        uint256 liquidationPenalty
    ) {
        require(address(scoreEngine) != address(0), "ScoreEngine not set");
        return scoreEngine.scoreBreakdown(
            _collateralValue[user],
            _delegatedCredit[user],
            _totalDebt[user],
            _accountAgeDays(user),
            repaymentCount[user],
            liquidationCount[user],
            aaveDebt[user],
            compoundDebt[user],
            prevUtilizationBps[user]
        );
    }

    /// @notice Legacy 6-value scoreBreakdown — satisfies original ICreditManager interface.
    ///         Use creditScoreBreakdown() for the full 8-value Stylus breakdown.
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
        )
    {
        ageScore         = _accountAgeScore(user);
        healthScore      = _healthFactorScore(user);
        repaymentScore   = _repaymentBehaviorScore(user);
        delegatedScore   = _delegatedCreditScore(user);
        utilizationPenalty = _utilizationPenalty(user);
        liquidationPenalty = _liquidationPenalty(user);
    }

    function riskTier(address user) external view returns (uint8) {
        return _tierFromScore(creditScore(user));
    }

    function userMetrics(address user) external view returns (
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
    ) {
        collateral = _collateralValue[user];
        delegated  = _delegatedCredit[user];
        debt       = _totalDebt[user];
        hf         = healthFactor(user);
        score      = creditScore(user);
        tier       = _tierFromScore(score);
        openedAt   = accountOpenedAt[user];
        borrows    = borrowCount[user];
        repays     = repaymentCount[user];
        liquidations = liquidationCount[user];
        isFrozen   = frozen[user];
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    function _tierFromScore(uint256 score) internal pure returns (uint8) {
        if (score >= 700) return 3;
        if (score >= 500) return 2;
        if (score >= 300) return 1;
        return 0;
    }

    function _accountAgeDays(address user) internal view returns (uint256) {
        uint256 openedAt = accountOpenedAt[user];
        if (openedAt == 0 || block.timestamp <= openedAt) return 0;
        return (block.timestamp - openedAt) / 1 days;
    }

    /// @notice Snapshot utilization every 7 days for volatility tracking.
    function _snapshotUtilization(address user) internal {
        if (block.timestamp >= prevUtilizationTimestamp[user] + 7 days) {
            uint256 limit = _collateralValue[user] + _delegatedCredit[user];
            uint256 util = limit == 0 ? 0 : (_totalDebt[user] * 10_000) / limit;
            prevUtilizationBps[user] = util;
            prevUtilizationTimestamp[user] = block.timestamp;
            emit UtilizationSnapshotted(user, util);
        }
    }

    /// @notice Simplified fallback scoring used before Stylus engine is deployed.
    function _fallbackCreditScore(address user) internal view returns (uint256) {
        uint256 ageDays = _accountAgeDays(user);
        uint256 ageScore = ageDays >= 180 ? 150 : (ageDays * 150) / 180;

        uint256 hf = healthFactor(user);
        uint256 healthScore;
        if (hf == type(uint256).max) healthScore = 250;
        else if (hf >= 2e18) healthScore = 250;
        else if (hf >= 15e17) healthScore = 200;
        else if (hf >= 12e17) healthScore = 150;
        else if (hf >= 1e18) healthScore = 100;
        else healthScore = 0;

        uint256 reps = repaymentCount[user];
        uint256 repayScore = reps >= 20 ? 200 : reps * 10;

        uint256 d = _delegatedCredit[user];
        uint256 cap = 10_000e6;
        uint256 delegatedScore = d >= cap ? 100 : (d * 100) / cap;

        uint256 gross = ageScore + healthScore + repayScore + delegatedScore;

        // Utilization penalty
        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        uint256 debt = _totalDebt[user];
        uint256 utilPenalty = 0;
        if (limit > 0 && debt > 0) {
            uint256 utilBps = (debt * 10_000) / limit;
            if (utilBps > 10_000) utilPenalty = 150;
            else if (utilBps > 5_000) utilPenalty = ((utilBps - 5_000) * 150) / 5_000;
        }

        uint256 liqPenalty = liquidationCount[user] * 100;
        if (liqPenalty > 300) liqPenalty = 300;

        uint256 totalPenalty = utilPenalty + liqPenalty;
        if (totalPenalty >= gross) return 0;
        uint256 score = gross - totalPenalty;
        return score > 1000 ? 1000 : score;
    }

    // ─── Individual score component helpers (used by legacy scoreBreakdown) ───

    function _accountAgeScore(address user) internal view returns (uint256) {
        uint256 ageDays = _accountAgeDays(user);
        if (ageDays >= 180) return 150;
        return (ageDays * 150) / 180;
    }

    function _healthFactorScore(address user) internal view returns (uint256) {
        uint256 hf = healthFactor(user);
        if (hf == type(uint256).max) return 250;
        if (hf >= 2e18)  return 250;
        if (hf >= 15e17) return 200;
        if (hf >= 12e17) return 150;
        if (hf >= 1e18)  return 100;
        return 0;
    }

    function _repaymentBehaviorScore(address user) internal view returns (uint256) {
        uint256 reps = repaymentCount[user];
        if (reps >= 20) return 200;
        return reps * 10;
    }

    function _delegatedCreditScore(address user) internal view returns (uint256) {
        uint256 d = _delegatedCredit[user];
        if (d == 0) return 0;
        uint256 cap = 10_000e6;
        if (d >= cap) return 100;
        return (d * 100) / cap;
    }

    function _utilizationPenalty(address user) internal view returns (uint256) {
        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        uint256 debt  = _totalDebt[user];
        if (limit == 0 || debt == 0) return 0;
        uint256 utilBps = (debt * 10_000) / limit;
        if (utilBps <= 5_000)  return 0;
        if (utilBps >= 10_000) return 150;
        return ((utilBps - 5_000) * 150) / 5_000;
    }

    function _liquidationPenalty(address user) internal view returns (uint256) {
        uint256 penalty = liquidationCount[user] * 100;
        return penalty > 300 ? 300 : penalty;
    }
}
