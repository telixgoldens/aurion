// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICreditManager } from "../interfaces/ICreditManager.sol";
import { CreditOracle } from "../oracle/CreditOracle.sol";
import { Errors } from "../libraries/Errors.sol";
import { AaveAdapter } from "../adapters/AaveAdapter.sol";
import { CreditPool } from "../pools/CreditPool.sol"; 
import { CompoundAdapter } from "../adapters/CompoundAdapter.sol";
import { InsurancePool } from "../pools/InsurancePool.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { LiquidationController } from "../fees/LiquidationController.sol";



contract CreditRouter {
    using SafeERC20 for IERC20;
    ICreditManager public creditManager;
    CreditOracle public immutable ORACLE;
    LiquidationController public immutable LIQUIDATION_CONTROLLER;
    InsurancePool public insurancePool;
    CreditPool public creditPool;

    address public immutable OWNER;

    uint256 public closeFactorBps = 5000; 

    event CreditManagerSet(address manager);
    event InsurancePoolSet(address pool);
    event CloseFactorUpdated(uint256 bps);
    event CreditPoolSet(address pool);
    event CreditDelegated(address indexed pool, address indexed user, uint256 amount);


    event Liquidated(
        address indexed user,
        address indexed liquidator,
        address indexed asset,
        uint256 repayAmount,
        uint256 seizeAmount,
        uint256 bonusPaid,
        uint256 bonusShortfall
    );

    constructor(address _manager, address _oracle, address _liquidationController, address _insurancePool) {
        creditManager = ICreditManager(_manager);
        ORACLE = CreditOracle(_oracle);
        LIQUIDATION_CONTROLLER = LiquidationController(_liquidationController);
        insurancePool = InsurancePool(_insurancePool);
        OWNER = msg.sender;
    }

    modifier onlyOwner() {
    _onlyOwner();
    _;
   }

    function _onlyOwner() internal view {
    if (msg.sender != OWNER) revert Errors.NotAuthorized();
   }

    function borrowFromAave( address adapter, address asset, uint256 amount) external {
        if (amount == 0) revert Errors.InvalidAmount();   
        if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) revert Errors.InsufficientCredit();
        creditManager.onBorrow(msg.sender, amount);
        AaveAdapter(adapter).borrow(asset, amount, msg.sender);
    }

    function borrowFromCompound( address adapter, uint256 amount ) external {
        if (amount == 0) revert Errors.InvalidAmount();
        if (!ORACLE.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) revert Errors.InsufficientCredit();
        creditManager.onBorrow(msg.sender, amount);
        CompoundAdapter(adapter).borrow(amount);
    }

     function setCreditManager(address _cm) external onlyOwner{
     if(address(creditManager) != address(0)) revert Errors.NotAuthorized();
      creditManager = ICreditManager(_cm);
      emit CreditManagerSet(_cm);
    }

    function setInsurancePool(address pool) external onlyOwner {
        if (address(insurancePool) != address(0)) revert Errors.NotAuthorized();
        insurancePool = InsurancePool(pool);
        emit InsurancePoolSet(pool);
    }

    function setCreditPool(address pool) external onlyOwner {
        if (address(creditPool) != address(0)) revert Errors.NotAuthorized(); 
        if (pool == address(0)) revert Errors.NotAuthorized(); 
        creditPool = CreditPool(pool);
        emit CreditPoolSet(pool);
    }

    function delegateCredit(address user, uint256 amount) external onlyOwner {
        if (address(creditPool) == address(0)) revert Errors.NotAuthorized();
        if (user == address(0)) revert Errors.NotAuthorized();
        if (amount == 0) revert Errors.InvalidAmount();

        creditPool.delegateCredit(user, amount);
        emit CreditDelegated(address(creditPool), user, amount);
    }

    function setCloseFactorBps(uint256 bps) external onlyOwner {
        if (bps == 0 || bps > 10_000) revert Errors.InvalidAmount();
        closeFactorBps = bps;
        emit CloseFactorUpdated(bps);
    }

    function setManagerPool(address pool) external onlyOwner {
    if (pool == address(0)) revert Errors.NotAuthorized();
    creditManager.setPool(pool);
    }


    function liquidate( address user, uint256 repayAmount, address asset ) external {
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

    IERC20(asset).safeTransferFrom( msg.sender, address(this), repayAmount );

    creditManager.onLiquidation(user, repayAmount);
    uint256 bonusPaid = 0;
    if (bonus > 0) { bonusPaid = insurancePool.cover(bonus); }
    uint256 totalPay = repayAmount + bonusPaid;

    IERC20(asset).safeTransfer(msg.sender, totalPay);
    emit Liquidated(user, msg.sender, asset, repayAmount, seize, bonusPaid, bonus - bonusPaid);
    }

}
