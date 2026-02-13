// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditOracle {
    bool public healthy = true;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

   modifier onlyOwner() {
    _onlyOwner();
    _;
}

function _onlyOwner() internal view{
    require(msg.sender == owner, "ONLY_OWNER");
}


    function setHealthy(bool _healthy) external onlyOwner {
        healthy = _healthy;
    }
}
