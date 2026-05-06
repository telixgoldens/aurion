// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ICreditManager} from "../interfaces/ICreditManager.sol";
import {CreditOracle} from "../oracle/CreditOracle.sol";
import {Errors} from "../libraries/Errors.sol";
import {AaveAdapter} from "../adapters/AaveAdapter.sol";
import {CreditPool} from "../pools/CreditPool.sol";
import {CompoundAdapter} from "../adapters/CompoundAdapter.sol";
import {InsurancePool} from "../pools/InsurancePool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {LiquidationController} from "../fees/LiquidationController.sol";

/// @title CreditRouter
/// @notice Gateway for all borrow/repay/liquidate actions.
///         Delegates credit accounting to CreditManager and per-protocol
///         debt tracking so the Stylus score engine can compute cross-protocol
///         scores correctly.
contract CreditRouter {
    using SafeERC20 for IERC20;

    // ─── State ────────────────────────────────────────────────────────────────

    ICreditManager public creditManager;
    CreditOracle public immutable ORACLE;
    LiquidationController public immutable LIQUIDATION_CONTROLLER;
    InsurancePool public insurancePool;
    CreditPool public creditPool;

    address public immutable OWNER;

    uint256 public closeFactorBps = 5000;
    mapping(address => bool) public isBorrower;

    // ─── Events ───────────────────────────────────────────────────────────────

    event BorrowerWhitelisted(address indexed borrower, bool allowed);
    event CreditManagerSet(address manager);
    event InsurancePoolSet(address pool);
    event CreditPoolSet(address pool);
    event CloseFactorUpdated(uint256 bps);
    event CreditDelegated(address indexed user, uint256 amount);
    event BorrowedFromAave(address indexed user, address asset, uint256 amount);
    event BorrowedFromCompound(address indexed user, uint256 amount);
    event RepaidToAave(address indexed user, address asset, uint256 amount);
    event RepaidToCompound(address indexed user, uint256 amount);
    event Liquidated(
        address indexed user,
        address indexed liquidator,
        address indexed asset,
        uint256 repayAmount,
        uint256 seizeAmount,
        uint256 bonusPaid,
        uint256 bonusShortfall
    );

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(
        address _manager,
        address _oracle,
        address _liquidationController,
        address _insurancePool
    ) {
        if (_oracle == address(0)) revert Errors.ZeroAddress();
        if (_liquidationController == address(0)) revert Errors.ZeroAddress();

        if (_manager != address(0)) {
            creditManager = ICreditManager(_manager);
        }
        if (_insurancePool != address(0)) {
            insurancePool = InsurancePool(_insurancePool);
        }
        ORACLE = CreditOracle(_oracle);
        LIQUIDATION_CONTROLLER = LiquidationController(_liquidationController);
        OWNER = msg.sender;
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != OWNER) revert Errors.NotAuthorized();
        _;
    }

    // ─── Borrow ───────────────────────────────────────────────────────────────

    /// @notice Borrow from the Aave pool through its adapter.
    ///         Records the borrow in CreditManager for both credit limit
    ///         enforcement and per-protocol debt tracking (feeds Stylus score).
    function borrowFromAave(
        address adapter,
        address asset,
        uint256 amount
    ) external {
        if (amount == 0) revert Errors.InvalidAmount();
        if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) revert Errors.InsufficientCredit();

        creditManager.onBorrow(msg.sender, amount);
        creditManager.recordAaveBorrow(msg.sender, amount);

        AaveAdapter(adapter).borrow(asset, amount, msg.sender);

        emit BorrowedFromAave(msg.sender, asset, amount);
    }

    /// @notice Borrow from the Compound pool through its adapter.
    function borrowFromCompound(
        address adapter,
        uint256 amount
    ) external {
        if (amount == 0) revert Errors.InvalidAmount();
        if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) revert Errors.InsufficientCredit();

        creditManager.onBorrow(msg.sender, amount);
        creditManager.recordCompoundBorrow(msg.sender, amount);

        CompoundAdapter(adapter).borrow(amount);

        emit BorrowedFromCompound(msg.sender, amount);
    }

    // ─── Repay ────────────────────────────────────────────────────────────────

    /// @notice Repay an Aave borrow.
    ///         Records the repayment so credit score and debt tracking update.
    function repayToAave(
        address adapter,
        address asset,
        uint256 amount
    ) external {
        if (amount == 0) revert Errors.InvalidAmount();

        IERC20(asset).safeTransferFrom(msg.sender, adapter, amount);
        AaveAdapter(adapter).repay(asset, amount, msg.sender);

        creditManager.onRepay(msg.sender, amount);
        creditManager.recordAaveRepay(msg.sender, amount);

        emit RepaidToAave(msg.sender, asset, amount);
    }

    /// @notice Repay a Compound borrow.
    function repayToCompound(
        address adapter,
        address asset,
        uint256 amount
    ) external {
        if (amount == 0) revert Errors.InvalidAmount();

        IERC20(asset).safeTransferFrom(msg.sender, adapter, amount);
        CompoundAdapter(adapter).repay(amount);

        creditManager.onRepay(msg.sender, amount);
        creditManager.recordCompoundRepay(msg.sender, amount);

        emit RepaidToCompound(msg.sender, amount);
    }

    // ─── Liquidation ──────────────────────────────────────────────────────────

    function liquidate(
        address user,
        uint256 repayAmount,
        address asset
    ) external {
        if (repayAmount == 0) revert Errors.InvalidAmount();
        if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();

        uint256 hf = creditManager.healthFactor(user);
        if (!LIQUIDATION_CONTROLLER.isLiquidatable(hf)) revert Errors.NotLiquidatable();

        uint256 debt = creditManager.totalDebt(user);
        if (debt == 0) revert Errors.NotLiquidatable();

        uint256 maxRepay = (debt * closeFactorBps) / 10_000;
        if (repayAmount > maxRepay) repayAmount = maxRepay;
        if (repayAmount > debt) revert Errors.RepayExceedsDebt();

        if (address(insurancePool) == address(0)) revert Errors.NotAuthorized();
        if (asset != address(insurancePool.ASSET())) revert Errors.InvalidAsset();

        uint256 seize = LIQUIDATION_CONTROLLER.seizeAmount(repayAmount);
        uint256 bonus = seize - repayAmount;

        IERC20(asset).safeTransferFrom(msg.sender, address(this), repayAmount);
        creditManager.onLiquidation(user, repayAmount);

        uint256 bonusPaid = 0;
        if (bonus > 0) {
            bonusPaid = insurancePool.cover(bonus);
        }

        uint256 totalPay = repayAmount + bonusPaid;
        IERC20(asset).safeTransfer(msg.sender, totalPay);

        emit Liquidated(user, msg.sender, asset, repayAmount, seize, bonusPaid, bonus - bonusPaid);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setCreditManager(address _cm) external onlyOwner {
        if (address(creditManager) != address(0)) revert Errors.AlreadySet();
        if (_cm == address(0)) revert Errors.ZeroAddress();
        creditManager = ICreditManager(_cm);
        emit CreditManagerSet(_cm);
    }

    function setInsurancePool(address pool) external onlyOwner {
        if (address(insurancePool) != address(0)) revert Errors.AlreadySet();
        if (pool == address(0)) revert Errors.ZeroAddress();
        insurancePool = InsurancePool(pool);
        emit InsurancePoolSet(pool);
    }

    function setCreditPool(address pool) external onlyOwner {
        if (address(creditPool) != address(0)) revert Errors.AlreadySet();
        if (pool == address(0)) revert Errors.ZeroAddress();
        creditPool = CreditPool(pool);
        creditManager.setPool(pool);
        emit CreditPoolSet(pool);
    }

    function setBorrower(address borrower, bool allowed) external onlyOwner {
        isBorrower[borrower] = allowed;
        emit BorrowerWhitelisted(borrower, allowed);
    }

    function delegateCredit(address user, uint256 amount) external onlyOwner {
        if (address(creditPool) == address(0)) revert Errors.NotAuthorized();
        if (user == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.InvalidAmount();
        creditPool.delegateCredit(user, amount);
        emit CreditDelegated(user, amount);
    }

    function setCloseFactorBps(uint256 bps) external onlyOwner {
        if (bps == 0 || bps > 10_000) revert Errors.InvalidAmount();
        closeFactorBps = bps;
        emit CloseFactorUpdated(bps);
    }

    /// @notice Directly set the pool on CreditManager without going through setCreditPool.
    ///         Used in deploy to wire creditPool into manager after both are deployed.
    function setManagerPool(address pool) external onlyOwner {
        if (pool == address(0)) revert Errors.ZeroAddress();
        creditManager.setPool(pool);
    }

    /// @notice Set the Stylus CreditScoreEngine on CreditManager.
    ///         Call this after deploying the Stylus contract.
    function setScoreEngine(address engine) external onlyOwner {
        if (engine == address(0)) revert Errors.ZeroAddress();
        // CreditManager.setScoreEngine is onlyRouter — call through here
        (bool ok,) = address(creditManager).call(
            abi.encodeWithSignature("setScoreEngine(address)", engine)
        );
        require(ok, "setScoreEngine failed");
    }

    /// @notice Unfreeze an account (admin action after review).
    function unfreezeAccount(address user) external onlyOwner {
        creditManager.unfreeze(user);
    }
}
