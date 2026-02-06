// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";
import { ICreditManager } from "../interfaces/ICreditManager.sol";

contract CreditManager is ICreditManager {
    address public router;
    address public oracle;

    mapping(address => uint256) private _collateralValue;
    mapping(address => uint256) private _delegatedCredit;
    mapping(address => uint256) private _totalDebt;
    mapping(address => bool) public frozen;

    modifier onlyRouter() {
        if (msg.sender != router) revert Errors.NotAuthorized();
        _;
    }

    constructor(address _router, address _oracle) {
        router = _router;
        oracle = _oracle;
    }

    function setCollateralValue(address user, uint256 value) external onlyRouter {
        _collateralValue[user] = value;
    }

    function setDelegatedCredit(address user, uint256 value) external onlyRouter {
        _delegatedCredit[user] = value;
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
        if (!this.validateBorrow(user, amount)) {
            revert Errors.InsufficientCredit();
        }
        _totalDebt[user] += amount;
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
}
