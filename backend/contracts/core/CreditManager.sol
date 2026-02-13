// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";
import { ICreditManager } from "../interfaces/ICreditManager.sol";

contract CreditManager is ICreditManager {
    address public router;
    address public oracle;
    address public pool;

    mapping(address => uint256) private _collateralValue;
    mapping(address => uint256) private _delegatedCredit;
    mapping(address => uint256) private _totalDebt;
    mapping(address => bool) public frozen;

    event BorrowRecorded(address indexed user, uint256 amount, uint256 newDebt);
    event LiquidationRecorded(address indexed user, uint256 repayAmount, uint256 newDebt);
    event Frozen(address indexed user);

   modifier onlyRouter() {
    _onlyRouter();
    _;
   }

   function _onlyRouter() internal view {
    if (msg.sender != router) revert Errors.NotAuthorized();
   }


    constructor(address _router, address _oracle) {
        router = _router;
        oracle = _oracle;
    }

    function setCollateralValue(address user, uint256 value) external onlyRouter {
        _collateralValue[user] = value;
    }

    function validateBorrow(
        address user,
        uint256 amount
    ) external view override returns (bool) {
        if (frozen[user]) return false;
        if (amount == 0) return false;

        uint256 limit = _collateralValue[user] + _delegatedCredit[user];
        return _totalDebt[user] + amount <= limit;
    }

    function onBorrow(address user, uint256 amount) external override onlyRouter {
        if (!this.validateBorrow(user, amount)) revert Errors.InsufficientCredit();
        _totalDebt[user] += amount;
        emit BorrowRecorded(user, amount, _totalDebt[user]);
    }

    function totalDebt(address user) external view override returns (uint256) {
        return _totalDebt[user];
    }

    function creditLimit(address user) external view override returns (uint256) {
        return _collateralValue[user] + _delegatedCredit[user];
    }

    function freeze(address user) external onlyRouter {
        frozen[user] = true;
    }
    
    function setPool(address _pool) external onlyRouter {
    pool = _pool;
    }

    modifier onlyRouterOrPool() {
    if (msg.sender != router && msg.sender != pool) revert Errors.NotAuthorized();
    _;
    }

    function setDelegatedCredit(address user, uint256 value) external onlyRouterOrPool {
    _delegatedCredit[user] = value;
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

    function onRepay(address user, uint256 amount) external onlyRouter {
    uint256 debt = _totalDebt[user];
    if (amount > debt) amount = debt;
    _totalDebt[user] -= amount;
    }

    function onLiquidation(
    address user,
    uint256 repayAmount
    ) external override onlyRouter {
   if (repayAmount == 0) revert Errors.InvalidAmount();
        uint256 debt = _totalDebt[user];
        if (repayAmount > debt) revert Errors.RepayExceedsDebt();

        _totalDebt[user] = debt - repayAmount;
        frozen[user] = true;

        emit LiquidationRecorded(user, repayAmount, _totalDebt[user]);
        emit Frozen(user);
    }

}
