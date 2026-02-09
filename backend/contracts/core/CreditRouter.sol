// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICreditManager } from "../interfaces/ICreditManager.sol";
import { CreditOracle } from "../oracle/CreditOracle.sol";
import { Errors } from "../libraries/Errors.sol";
import { AaveAdapter } from "../adapters/AaveAdapter.sol";
import { CompoundAdapter } from "../adapters/CompoundAdapter.sol";

contract CreditRouter {
    ICreditManager public creditManager;
    CreditOracle public immutable oracle;

    constructor(address _manager, address _oracle) {
        creditManager = ICreditManager(_manager);
        oracle = CreditOracle(_oracle);
    }

    function borrowFromAave(
        address adapter,
        address asset,
        uint256 amount
    ) external {
        if (!oracle.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) {
            revert Errors.InsufficientCredit();
        }

        creditManager.onBorrow(msg.sender, amount);
        AaveAdapter(adapter).borrow(asset, amount, msg.sender);
    }

    function borrowFromCompound(
        address adapter,
        uint256 amount
    ) external {
        if (!oracle.healthy()) revert Errors.OracleUnhealthy();
        if (!creditManager.validateBorrow(msg.sender, amount)) {
            revert Errors.InsufficientCredit();
        }

        creditManager.onBorrow(msg.sender, amount);
        CompoundAdapter(adapter).borrow(amount);
    }

     function setCreditManager(address _cm) external {
     require(address(creditManager) == address(0), "Already set");
      creditManager = ICreditManager(_cm);
    }

}
