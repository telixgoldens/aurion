// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";
import { ICreditManager } from "../interfaces/ICreditManager.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CreditPool {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC;
    ICreditManager public immutable CREDIT_MANAGER;
    address public immutable CONTROLLER; // router/governance

    uint256 private _totalDeposits;
    uint256 private _totalDelegated;

    constructor(address _usdc, address _creditManager, address _controller) {
        USDC = IERC20(_usdc);
        CREDIT_MANAGER = ICreditManager(_creditManager);
        CONTROLLER = _controller;
    }

    modifier onlyController() {
        if (msg.sender != CONTROLLER) revert Errors.NotAuthorized();
        _;
    }

    function totalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    function totalDelegated() external view returns (uint256) {
        return _totalDelegated;
    }

    function availableLiquidity() public view returns (uint256) {
        return _totalDeposits - _totalDelegated;
    }

    function deposit(uint256 amount) external {
        if (amount == 0) revert Errors.InvalidAmount();
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        _totalDeposits += amount;
    }

    function delegateCredit(address user, uint256 amount) external onlyController {
        if (amount == 0) revert Errors.InvalidAmount();
        if (amount > availableLiquidity()) revert Errors.InsufficientCredit();

        _totalDelegated += amount;
        CREDIT_MANAGER.setDelegatedCredit(user, amount);
    }
}
