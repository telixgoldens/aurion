// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {TestUSDC} from "../test/mocks/TestUSDC.sol";
import {TokenFaucet} from "../contracts/faucet/TokenFaucet.sol";
import {CreditOracle} from "../contracts/oracle/CreditOracle.sol";
import {CreditManager} from "../contracts/core/CreditManager.sol";
import {CreditRouter} from "../contracts/core/CreditRouter.sol";
import {LiquidationController} from "../contracts/fees/LiquidationController.sol";
import {InsurancePool} from "../contracts/pools/InsurancePool.sol";
import {CreditPool} from "../contracts/pools/CreditPool.sol";

import {AaveAdapter} from "../contracts/adapters/AaveAdapter.sol";
import {CompoundAdapter} from "../contracts/adapters/CompoundAdapter.sol";

contract DeploySepolia is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        // --- Params ---
        uint256 bonus = 108e16;          // 1.08
        uint256 faucetClaim = 1_000e6;   // 1000 USDC (6 decimals)
        uint256 faucetCooldown = 3600;   // 1 hour

        // External protocol addresses (YOU MUST SET THESE IN .env)
        address aavePool = vm.envAddress("AAVE_POOL");         // IAave pool address
        address compoundCToken = vm.envAddress("COMPOUND_CTOKEN"); // ICompound cToken address

        vm.startBroadcast(pk);

        // 1) Deploy test USDC + faucet
        TestUSDC usdc = new TestUSDC();
        TokenFaucet faucet = new TokenFaucet(address(usdc), faucetClaim, faucetCooldown);
        usdc.setMinter(address(faucet), true);

        // 2) Deploy oracle + liquidation controller
        CreditOracle oracle = new CreditOracle();
        LiquidationController liq = new LiquidationController(bonus);

        // 3) Deploy router (manager + insurancePool initially 0 like your current setup)
        CreditRouter router = new CreditRouter(
            address(0),
            address(oracle),
            address(liq),
            address(0)
        );

        // 4) Deploy credit manager, then set into router
        CreditManager manager = new CreditManager(address(router), address(oracle));
        router.setCreditManager(address(manager));

        // 5) Deploy insurance pool, then set into router
        InsurancePool insurancePool = new InsurancePool(address(usdc), address(router));
        router.setInsurancePool(address(insurancePool));

        // 6) Deploy credit pool (controller = router)
        CreditPool creditPool = new CreditPool(address(usdc), address(manager), address(router));
        router.setCreditPool(address(creditPool));  
        router.setManagerPool(address(creditPool));  

        // 7) Deploy adapters (for router.borrowFromAave/borrowFromCompound)
        AaveAdapter aaveAdapter = new AaveAdapter(aavePool);
        CompoundAdapter compoundAdapter = new CompoundAdapter(compoundCToken);

        vm.stopBroadcast();

        // --- Logs ---
        console2.log("TestUSDC:", address(usdc));
        console2.log("TokenFaucet:", address(faucet));
        console2.log("CreditOracle:", address(oracle));
        console2.log("LiquidationController:", address(liq));
        console2.log("CreditRouter:", address(router));
        console2.log("CreditManager:", address(manager));
        console2.log("InsurancePool:", address(insurancePool));
        console2.log("CreditPool:", address(creditPool));
        console2.log("AaveAdapter:", address(aaveAdapter));
        console2.log("CompoundAdapter:", address(compoundAdapter));
    }
}
