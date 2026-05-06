// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockCToken {
    IERC20 public immutable USDC;

    mapping(address => uint256) public depositsOf;
    mapping(address => uint256) public debt;

    uint256 public totalDeposits;
    uint256 public totalBorrows;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(address usdc) {
        USDC = IERC20(usdc);
    }

    /// @notice Required by ICompound — returns the underlying ERC20 (USDC).
    function underlying() external view returns (address) {
        return address(USDC);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "INVALID_AMOUNT");
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "TRANSFER_FROM_FAIL"
        );

        depositsOf[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "INVALID_AMOUNT");
        require(depositsOf[msg.sender] >= amount, "INSUFFICIENT_DEPOSIT");
        require(availableLiquidity() >= amount, "INSUFFICIENT_LIQUIDITY");

        depositsOf[msg.sender] -= amount;
        totalDeposits -= amount;

        require(USDC.transfer(msg.sender, amount), "TRANSFER_FAIL");

        emit Withdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external returns (uint256) {
        require(amount > 0, "INVALID_AMOUNT");
        require(availableLiquidity() >= amount, "INSUFFICIENT_LIQUIDITY");

        debt[msg.sender] += amount;
        totalBorrows += amount;

        require(USDC.transfer(msg.sender, amount), "TRANSFER_FAIL");

        emit Borrowed(msg.sender, amount);

        return 0;
    }

    /// @notice Original repay — called directly by users.
    function repay(uint256 amount) external {
        _repay(msg.sender, amount);
    }

    /// @notice Compound-style repay — called by CompoundAdapter (which holds
    ///         the tokens and calls on behalf of the borrower).
    ///         Returns 0 on success to match the Compound cToken ABI.
    function repayBorrow(uint256 amount) external returns (uint256) {
        _repay(msg.sender, amount);
        return 0;
    }

    function availableLiquidity() public view returns (uint256) {
        return totalDeposits - totalBorrows;
    }

    function utilizationBps() external view returns (uint256) {
        if (totalDeposits == 0) return 0;
        return (totalBorrows * 10_000) / totalDeposits;
    }

    function userDeposit(address user) external view returns (uint256) {
        return depositsOf[user];
    }

    function userDebt(address user) external view returns (uint256) {
        return debt[user];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _repay(address borrower, uint256 amount) internal {
        require(amount > 0, "INVALID_AMOUNT");
        require(debt[borrower] > 0, "NO_DEBT");

        uint256 repayAmount = amount > debt[borrower] ? debt[borrower] : amount;

        debt[borrower] -= repayAmount;
        totalBorrows -= repayAmount;

        require(
            USDC.transferFrom(msg.sender, address(this), repayAmount),
            "TRANSFER_FROM_FAIL"
        );

        emit Repaid(borrower, repayAmount);
    }
}
