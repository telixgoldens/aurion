// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {CreditOracle} from "../contracts/oracle/CreditOracle.sol";
import {CreditManager} from "../contracts/core/CreditManager.sol";
import {CreditRouter} from "../contracts/core/CreditRouter.sol";
import {LiquidationController} from "../contracts/fees/LiquidationController.sol";
import {InsurancePool} from "../contracts/pools/InsurancePool.sol";

// optional
import {CreditGovernor} from "../contracts/governance/CreditGovernor.sol";
import {InsuranceFund} from "../contracts/insurance/InsuranceFund.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address asset = vm.envAddress("ASSET"); // e.g. USDC on Arbitrum Sepolia (if you have it)
        uint256 bonus = 108e16; // 1.08e18

        vm.startBroadcast(pk);

        // 1) Oracle (for now your CreditOracle is a simple ownable/healthy flag style oracle)
        CreditOracle oracle = new CreditOracle();

        // 2) Liquidation config
        LiquidationController liq = new LiquidationController(bonus);

        // 3) Router first with empty manager + empty insurance
        CreditRouter router = new CreditRouter(
            address(0),
            address(oracle),
            address(liq),
            address(0)
        );

        // 4) Manager wired to router
        CreditManager manager = new CreditManager(address(router), address(oracle));

        // 5) Wire manager into router
        router.setCreditManager(address(manager));

        // 6) Insurance pool (ERC20) and wire into router
        InsurancePool insurancePool = new InsurancePool(asset, address(router));
        router.setInsurancePool(address(insurancePool));

        // 7) OPTIONAL: governance contract (currently standalone, not wired)
        CreditGovernor governor = new CreditGovernor();

        // 8) OPTIONAL: ETH insurance fund (only useful if you later route ETH fees to it)
        // Set controller = deployer for now (or governor if you prefer)
        InsuranceFund insuranceFund = new InsuranceFund(msg.sender);

        vm.stopBroadcast();

        console2.log("CreditOracle:", address(oracle));
        console2.log("LiquidationController:", address(liq));
        console2.log("CreditRouter:", address(router));
        console2.log("CreditManager:", address(manager));
        console2.log("InsurancePool:", address(insurancePool));
        console2.log("CreditGovernor:", address(governor));
        console2.log("InsuranceFund:", address(insuranceFund));
    }
}
