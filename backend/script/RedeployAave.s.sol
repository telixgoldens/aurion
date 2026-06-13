// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TestUSDC} from "../test/mocks/TestUSDC.sol";
import {MockAavePool} from "../test/mocks/MockAavePool.sol";
import {AaveAdapter} from "../contracts/adapters/AaveAdapter.sol";

contract RedeployAave is Script {
    function run() external {
        uint256 pk       = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        // Pull existing addresses from env — nothing else changes
        address usdc   = vm.envAddress("USDC");
        address router = vm.envAddress("CREDIT_ROUTER");

        vm.startBroadcast(pk);

        // 1) New MockAavePool (fixed 4-param repay)
        MockAavePool mockAave = new MockAavePool(usdc);

        // 2) Seed with liquidity — deployer must have minter role (set in original deploy)
        TestUSDC(usdc).mint(address(mockAave), 5_000_000e6);

        // 3) New AaveAdapter pointing to new pool
        AaveAdapter aaveAdapter = new AaveAdapter(address(mockAave), router);

        vm.stopBroadcast();

        // Wiring verification
        require(address(aaveAdapter.AAVE())   == address(mockAave), "WIRE: adapter->pool mismatch");
        require(aaveAdapter.ROUTER()           == router,            "WIRE: adapter->router mismatch");

        console2.log("=== Aave redeploy complete ===");
        console2.log("New MockAavePool :", address(mockAave));
        console2.log("New AaveAdapter  :", address(aaveAdapter));
        console2.log("");
        console2.log("Update your .env:");
        console2.log("  VITE_MOCK_AAVE_POOL=", address(mockAave));
        console2.log("  VITE_AAVE_ADAPTER=  ", address(aaveAdapter));
    }
}