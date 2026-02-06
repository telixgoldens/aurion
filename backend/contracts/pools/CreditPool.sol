// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";

contract CreditPool {
    address public manager;
    uint256 public totalDeposits;
    uint256 public totalDelegated;

    mapping(address => uint256) public balances;

    constructor(address _manager) {
        manager = _manager;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;
    }

    function delegate(address user, uint256 amount) external {
        if (msg.sender != manager) revert Errors.NotAuthorized();
        if (totalDelegated + amount > totalDeposits) {
            revert Errors.InsufficientCredit();
        }
        totalDelegated += amount;
    }
}
