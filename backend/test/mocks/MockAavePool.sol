// test/mocks/MockAavePool.sol
pragma solidity ^0.8.20;

contract MockAavePool {
    mapping(address => uint256) public debtOf;

    function borrow(
        address asset,
        uint256 amount,
        uint256,
        uint16,
        address user
    ) external {
        debtOf[user] += amount;
    }

    function repay(
        address asset,
        uint256 amount,
        address user
    ) external {
        debtOf[user] -= amount;
    }
}
