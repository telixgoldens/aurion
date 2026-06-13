// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {MockCToken} from "../test/mocks/MockCToken.sol";
import {CompoundAdapter} from "../contracts/adapters/CompoundAdapter.sol";
import {TestUSDC} from "../test/mocks/TestUSDC.sol";
import {CreditRouter} from "../contracts/core/CreditRouter.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        TestUSDC usdc = TestUSDC(0x51a6c5b461Ee43f2602b8d83ebFdA0dbA88BF278);
        CreditRouter router = CreditRouter(0x03c663b0B45f55A217f244e180496C3C10550Aee);

        MockCToken mockCToken = new MockCToken(address(usdc));

        usdc.setMinter(deployer, true);
        uint256 fiveMillion = 5_000_000e6;
        usdc.mint(address(mockCToken), fiveMillion);

        CompoundAdapter compoundAdapter = new CompoundAdapter(address(mockCToken), address(router));

        vm.stopBroadcast();

        console2.log("MockCToken:", address(mockCToken));
        console2.log("CompoundAdapter:", address(compoundAdapter));
    }
}