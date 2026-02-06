// test/mocks/MockAavePool.sol
pragma solidity ^0.8.20;

contract MockAavePool {
    mapping(address => uint256) public debt;

    function borrow(
        address asset,
        uint256 amount,
        uint256,
        uint16,
        address onBehalfOf
    ) external {
        debt[onBehalfOf] += amount;
    }

    function repay(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external {
        debt[onBehalfOf] -= amount;
    }
}
