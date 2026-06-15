// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ICreditManager} from "../interfaces/ICreditManager.sol";
import {ICreditScoreEngine} from "../interfaces/ICreditScoreEngine.sol";
import {CreditOracle} from "../oracle/CreditOracle.sol";
import {Errors} from "../libraries/Errors.sol";
import {AaveAdapter} from "../adapters/AaveAdapter.sol";
import {CreditPool} from "../pools/CreditPool.sol";
import {CompoundAdapter} from "../adapters/CompoundAdapter.sol";
import {InsurancePool} from "../pools/InsurancePool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {LiquidationController} from "../fees/LiquidationController.sol";

contract CreditRouter {
    using SafeERC20 for IERC20;

    ICreditManager public creditManager;
    ICreditScoreEngine public scoreEngine;
    CreditOracle public immutable ORACLE;
    LiquidationController public immutable LIQUIDATION_CONTROLLER;
    InsurancePool public insurancePool;
    CreditPool public creditPool;

    address public immutable OWNER;

    uint256 public closeFactorBps = 5000;
    mapping(address => bool) public isBorrower;
    mapping(address => uint256) public protocolCount;

    event BorrowerWhitelisted(address indexed borrower, bool allowed);
    event CreditManagerSet(address manager);
    event InsurancePoolSet(address pool);
    event CreditPoolSet(address pool);
    event CloseFactorUpdated(uint256 bps);
    event CreditDelegated(address indexed user, uint256 amount);
    event ScoreEngineSet(address engine);
    event BorrowedFromAave(address indexed user, address asset, uint256 amount);
    event BorrowedFromCompound(address indexed user, uint256 amount);
    event RepaidToAave(address indexed user, address asset, uint256 amount);
    event RepaidToCompound(address indexed user, address asset, uint256 amount);
    event Liquidated(
        address indexed user,
        address indexed liquidator,
        address indexed asset,
        uint256 repayAmount,
        uint256 seizeAmount,
        uint256 bonusPaid,
        uint256 bonusShortfall
    );

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

    modifier onlyOwner() {
        if (msg.sender != OWNER) revert Errors.NotAuthorized();
        _;
    }

    function syncAaveCollateral(address aavePool, address user) external {
    if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
    (bool ok, bytes memory data) = aavePool.staticcall(
        abi.encodeWithSignature("getUserAccountData(address)", user)
    );
    if (!ok) revert Errors.InvalidAmount();
    (uint256 collateral,,,,,) = abi.decode(data, (uint256,uint256,uint256,uint256,uint256,uint256));

    creditManager.setAaveCollateral(user, collateral);   

    if (address(scoreEngine) != address(0)) {
        scoreEngine.recordSupply(user, collateral);
    }
    
    }

    function syncCompoundCollateral(address cToken, address user) external {
    if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
    (bool ok, bytes memory data) = cToken.staticcall(
        abi.encodeWithSignature("getAccountSnapshot(address)", user)
    );
    if (!ok) revert Errors.InvalidAmount();
    (, uint256 cTokenBal,, uint256 exchangeRate) =
        abi.decode(data, (uint256,uint256,uint256,uint256));
    uint256 collateral = (cTokenBal * exchangeRate) / 1e18;

    creditManager.setCompoundCollateral(user, collateral);  

    if (address(scoreEngine) != address(0)) {
        scoreEngine.recordSupply(user, collateral);
    }
}

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

        protocolCount[msg.sender] = _activeProtocolCount(msg.sender);

        if (address(scoreEngine) != address(0)) {
            uint256 limit = creditManager.creditLimit(msg.sender);
            uint256 debt  = creditManager.totalDebt(msg.sender);
            uint256 utilBps = limit > 0 ? (debt * 10_000) / limit : 0;
            scoreEngine.recordBorrow(msg.sender, amount, protocolCount[msg.sender], utilBps);
        }

        AaveAdapter(adapter).borrow(asset, amount, msg.sender);
        emit BorrowedFromAave(msg.sender, asset, amount);
    }

    function borrowFromCompound(
    address adapter,
    uint256 amount
) external {
    if (amount == 0) revert Errors.InvalidAmount();
    if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
    if (!creditManager.validateBorrow(msg.sender, amount)) revert Errors.InsufficientCredit();

    creditManager.onBorrow(msg.sender, amount);
    creditManager.recordCompoundBorrow(msg.sender, amount);

    protocolCount[msg.sender] = _activeProtocolCount(msg.sender);

    if (address(scoreEngine) != address(0)) {
        uint256 limit = creditManager.creditLimit(msg.sender);
        uint256 debt  = creditManager.totalDebt(msg.sender);
        uint256 utilBps = limit > 0 ? (debt * 10_000) / limit : 0;
        scoreEngine.recordBorrow(msg.sender, amount, protocolCount[msg.sender], utilBps);
    }

    CompoundAdapter(adapter).borrow(amount, msg.sender);
    emit BorrowedFromCompound(msg.sender, amount);
}

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

        if (address(scoreEngine) != address(0)) {
            scoreEngine.recordRepayment(msg.sender);
        }

        emit RepaidToAave(msg.sender, asset, amount);
    }

    function repayToCompound(
        address adapter,
        address asset,
        uint256 amount
    ) external {
        if (amount == 0) revert Errors.InvalidAmount();

        IERC20(asset).safeTransferFrom(msg.sender, adapter, amount);
        CompoundAdapter(adapter).repay(amount, msg.sender);

        creditManager.onRepay(msg.sender, amount);
        creditManager.recordCompoundRepay(msg.sender, amount);

        if (address(scoreEngine) != address(0)) {
            scoreEngine.recordRepayment(msg.sender);
        }

        emit RepaidToCompound(msg.sender, asset, amount);
    }

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

        if (address(scoreEngine) != address(0)) {
            scoreEngine.recordLiquidation(user);
        }

        uint256 bonusPaid = 0;
        if (bonus > 0) {
            bonusPaid = insurancePool.cover(bonus);
        }

        uint256 totalPay = repayAmount + bonusPaid;
        IERC20(asset).safeTransfer(msg.sender, totalPay);

        emit Liquidated(user, msg.sender, asset, repayAmount, seize, bonusPaid, bonus - bonusPaid);
    }

    function setCreditManager(address _cm) external onlyOwner {
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

    function setManagerPool(address pool) external onlyOwner {
        if (pool == address(0)) revert Errors.ZeroAddress();
        creditManager.setPool(pool);
    }

    function setScoreEngine(address engine) external onlyOwner {
        if (engine == address(0)) revert Errors.ZeroAddress();
        scoreEngine = ICreditScoreEngine(engine);
        (bool ok,) = address(creditManager).call(
            abi.encodeWithSignature("setScoreEngine(address)", engine)
        );
        require(ok, "setScoreEngine failed");
        emit ScoreEngineSet(engine);
    }

    function unfreezeAccount(address user) external onlyOwner {
        creditManager.unfreeze(user);
    }

    function _activeProtocolCount(address user) internal view returns (uint256 count) {
        if (creditManager.aaveDebt(user) > 0) count++;
        if (creditManager.compoundDebt(user) > 0) count++;
    }
}
