// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICompound {
    function borrow(uint256 amount) external returns (uint256);

    /// @notice Repay a borrow. Returns 0 on success.
    function repayBorrow(uint256 amount) external returns (uint256);

    /// @notice The underlying ERC20 token (USDC in our case).
    function underlying() external view returns (address);
}
