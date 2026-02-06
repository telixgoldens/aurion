// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAave {
    function borrow(
        address asset,
        uint256 amount,
        uint256 rateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;
}
