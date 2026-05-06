// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockAavePool {
    IERC20 public immutable USDC;

    mapping(address => uint256) public depositsOf;
    mapping(address => uint256) public debtOf;

    uint256 public totalDeposits;
    uint256 public totalBorrows;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(address usdc) {
        USDC = IERC20(usdc);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "INVALID_AMOUNT");
        require(USDC.transferFrom(msg.sender, address(this), amount), "TRANSFER_FROM_FAIL");

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

    function borrow(
        address asset,
        uint256 amount,
        uint256,
        uint16,
        address onBehalfOf
    ) external {
        require(asset == address(USDC), "UNSUPPORTED_ASSET");
        require(amount > 0, "INVALID_AMOUNT");
        require(availableLiquidity() >= amount, "INSUFFICIENT_LIQUIDITY");

        debtOf[onBehalfOf] += amount;
        totalBorrows += amount;

        require(USDC.transfer(onBehalfOf, amount), "TRANSFER_FAIL");

        emit Borrowed(onBehalfOf, amount);
    }

    function repay(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external returns (uint256) {
        require(asset == address(USDC), "UNSUPPORTED_ASSET");
        require(amount > 0, "INVALID_AMOUNT");

        uint256 debt = debtOf[onBehalfOf];
        require(debt > 0, "NO_DEBT");

        uint256 repayAmount = amount > debt ? debt : amount;

        debtOf[onBehalfOf] -= repayAmount;
        totalBorrows -= repayAmount;

        require(
            USDC.transferFrom(msg.sender, address(this), repayAmount),
            "TRANSFER_FROM_FAIL"
        );

        emit Repaid(onBehalfOf, repayAmount);

        return repayAmount;
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
        return debtOf[user];
    }
}