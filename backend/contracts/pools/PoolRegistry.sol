// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PoolRegistry {
    mapping(address => bool) public approvedPools;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function approvePool(address pool) external {
        require(msg.sender == owner, "ONLY_OWNER");
        approvedPools[pool] = true;
    }
}
