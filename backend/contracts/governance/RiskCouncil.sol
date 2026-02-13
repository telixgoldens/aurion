// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { CreditManager } from "../core/CreditManager.sol";

contract RiskCouncil {
    address public owner;
    CreditManager public manager;

    constructor(address _manager) {
        owner = msg.sender;
        manager = CreditManager(_manager);
    }

    modifier onlyOwner() {
    _onlyOwner();
    _;
}

function _onlyOwner() internal view{
    require(msg.sender == owner, "ONLY_COUNCIL");
}


    function freezeAccount(address user) external onlyOwner {
        manager.freeze(user);
    }
}
