// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompound {
    function borrow(uint256 amount) external returns (uint256);
    function borrowFor(uint256 amount, address borrower) external returns (uint256);
    function repayBorrowBehalf(address borrower, uint256 amount) external returns (uint256);
    function underlying() external view returns (address);
}
