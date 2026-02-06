// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompound {
    function borrow(uint256 amount) external returns (uint256);
}
