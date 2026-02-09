// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import { CreditOracle } from "../contracts/oracle/CreditOracle.sol";
import { CreditManager } from "../contracts/core/CreditManager.sol";
import { CreditRouter } from "../contracts/core/CreditRouter.sol";
import { AaveAdapter } from "../contracts/adapters/AaveAdapter.sol";
import { InsuranceFund } from "../contracts/insurance/InsuranceFund.sol";
import { FeeController } from "../contracts/fees/FeeController.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        CreditOracle oracle = new CreditOracle();
        CreditRouter router = new CreditRouter(address(0), address(oracle));
        CreditManager manager = new CreditManager(address(router), address(oracle));

        router = new CreditRouter(address(manager), address(oracle));

        AaveAdapter aaveAdapter = new AaveAdapter(
            0x794a61358D6845594F94dc1DB02A252b5b4814aD
        );

        InsuranceFund insurance = new InsuranceFund(address(0));
        FeeController fees = new FeeController(
    msg.sender,
    payable(address(insurance))
);


        vm.stopBroadcast();
    }
}
