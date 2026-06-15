// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors }        from "../libraries/Errors.sol";
import { ICreditManager } from "../interfaces/ICreditManager.sol";
import { SafeERC20 }     from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 }        from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CreditPool {
    using SafeERC20 for IERC20;

    IERC20          public immutable USDC;
    ICreditManager  public immutable CREDIT_MANAGER;
    address         public immutable CONTROLLER;

    uint256 private _totalDeposits;
    uint256 private _totalDelegated;

    mapping(address => uint256) private _deposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event CreditDelegated(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(address _usdc, address _creditManager, address _controller) {
        USDC           = IERC20(_usdc);
        CREDIT_MANAGER = ICreditManager(_creditManager);
        CONTROLLER     = _controller;
    }

    modifier onlyController() {
        if (msg.sender != CONTROLLER) revert Errors.NotAuthorized();
        _;
    }


    function totalDeposits()     external view returns (uint256) { return _totalDeposits; }
    function totalDelegated()    external view returns (uint256) { return _totalDelegated; }
    function depositOf(address lender) external view returns (uint256) { return _deposits[lender]; }

    function availableLiquidity() public view returns (uint256) {
        return _totalDeposits - _totalDelegated;
    }


    function deposit(uint256 amount) external {
        if (amount == 0) revert Errors.InvalidAmount();
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        _totalDeposits        += amount;
        _deposits[msg.sender] += amount;   
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0)                          revert Errors.InvalidAmount();
        if (_deposits[msg.sender] < amount)       revert Errors.InvalidAmount();
        if (availableLiquidity() < amount)        revert Errors.InsufficientCredit();

        _deposits[msg.sender] -= amount;
        _totalDeposits        -= amount;
        USDC.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function delegateCredit(address user, uint256 amount) external onlyController {
        if (amount == 0)                    revert Errors.InvalidAmount();
        if (amount > availableLiquidity())  revert Errors.InsufficientCredit();
        _totalDelegated += amount;
        CREDIT_MANAGER.setDelegatedCredit(user, amount);
        emit CreditDelegated(user, amount);
    }

    function repay(uint256 amount) external {
        if (amount == 0) revert Errors.InvalidAmount();

        uint256 debt = CREDIT_MANAGER.totalDebt(msg.sender);
        if (debt == 0) revert Errors.InvalidAmount();
        uint256 repayAmount = amount > debt ? debt : amount;

        USDC.safeTransferFrom(msg.sender, address(this), repayAmount);
        CREDIT_MANAGER.onRepay(msg.sender, repayAmount);

        uint256 delegated = CREDIT_MANAGER.delegatedCredit(msg.sender);
        uint256 toRelease = repayAmount > delegated ? delegated : repayAmount;
        if (toRelease > 0) {
            CREDIT_MANAGER.setDelegatedCredit(msg.sender, delegated - toRelease);
            _totalDelegated -= toRelease;
        }

        emit Repaid(msg.sender, repayAmount);
    }
}