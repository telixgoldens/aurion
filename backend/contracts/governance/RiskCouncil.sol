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
        require(msg.sender == owner, "ONLY_COUNCIL");
        _;
    }

    function freezeAccount(address user) external onlyOwner {
        manager.freeze(user);
    }
}
