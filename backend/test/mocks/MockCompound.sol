// test/mocks/MockCompound.sol
pragma solidity ^0.8.20;

contract MockCompound {
    mapping(address => uint256) public debt;

    function borrow(uint256 amount) external {
        debt[msg.sender] += amount;
    }

    function repay(uint256 amount) external {
        debt[msg.sender] -= amount;
    }
}
