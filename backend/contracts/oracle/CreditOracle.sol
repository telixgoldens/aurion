// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditOracle {
    bool public healthy = true;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    function setHealthy(bool _healthy) external onlyOwner {
        healthy = _healthy;
    }
}
