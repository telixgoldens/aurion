// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditGovernor {
    address public owner;

    uint256 public creditApr; 

    uint256 public constant MIN_APR = 150;   
    uint256 public constant MAX_APR = 700;  

    constructor() {
        owner = msg.sender;
        creditApr = 600;
    }

    modifier onlyOwner() {
    _onlyOwner();
    _;
}

function _onlyOwner() internal view{
    require (msg.sender == owner, "ONLY_GOV");
}


    function setCreditApr(uint256 newApr) external onlyOwner {
        require(newApr >= MIN_APR && newApr <= MAX_APR, "APR_OUT_OF_RANGE");
        creditApr = newApr;
    }
}
