// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract MockCToken {
    IERC20 public immutable USDC;
    mapping(address => uint256) public debt;

    constructor(address usdc) {
        USDC = IERC20( usdc);
    }

    function borrow(uint256 amount) external returns (uint256) {
        debt[msg.sender] += amount;
        USDC.transfer(msg.sender, amount);
        return 0; 
    }

    function repay(uint256 amount) external {
        debt[msg.sender] -= amount;
        USDC.transferFrom(msg.sender, address(this), amount);
    }
}
