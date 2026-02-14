// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockAavePool {
    IERC20 public immutable USDC;

    mapping(address => uint256) public debtOf;

    constructor(address usdc) {
        USDC = IERC20(usdc);
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256 /*rateMode*/,
        uint16 /*referralCode*/,
        address onBehalfOf
    ) external {
        require(asset == address(USDC), "UNSUPPORTED_ASSET");

        debtOf[onBehalfOf] += amount;

        // Send liquidity to borrower
        require(USDC.transfer(onBehalfOf, amount), "TRANSFER_FAIL");
    }

    function repay(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external {
        require(asset == address(USDC), "UNSUPPORTED_ASSET");

        debtOf[onBehalfOf] -= amount;

        // Pull funds back
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FAIL"
        );
    }
}
