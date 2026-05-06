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
import {MockAavePool} from "../test/mocks/MockAavePool.sol";
import {MockCToken} from "../test/mocks/MockCToken.sol";
import {AaveAdapter} from "../contracts/adapters/AaveAdapter.sol";
import {CompoundAdapter} from "../contracts/adapters/CompoundAdapter.sol";
import {ICreditScoreEngine} from "../contracts/interfaces/ICreditScoreEngine.sol";

contract DeploySepolia is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        // --- Params ---
        uint256 bonus = 108e16;
        uint256 faucetClaim = 1_000e6;
        uint256 faucetCooldown = 3600;

        // --- Optional: wire Stylus engine in the same run ---
        // Set STYLUS_ENGINE in your .env after `cargo stylus deploy`.
        // If not set, engine stays unwired — call setScoreEngine() later.
        address stylusEngine = vm.envOr("STYLUS_ENGINE", address(0));

        vm.startBroadcast(pk);

        // 1) Deploy test USDC + faucet
        TestUSDC usdc = new TestUSDC();
        TokenFaucet faucet = new TokenFaucet(address(usdc), faucetClaim, faucetCooldown);
        usdc.setMinter(address(faucet), true);

        // 2) Deploy oracle + liquidation controller
        CreditOracle oracle = new CreditOracle();
        LiquidationController liq = new LiquidationController(bonus);

        // 3) Deploy router (manager + insurancePool initially 0)
        CreditRouter router = new CreditRouter(
            address(0), address(oracle), address(liq), address(0)
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


        // 7) Deploy mock pools and seed with liquidity
        MockAavePool mockAave = new MockAavePool(address(usdc));
        MockCToken mockCToken = new MockCToken(address(usdc));
        usdc.setMinter(deployer, true);
        uint256 fiveMillion = 5_000_000e6;
        usdc.mint(address(mockAave), fiveMillion);
        usdc.mint(address(mockCToken), fiveMillion);

        // 8) Adapters point to mocks, router-only access
        AaveAdapter aaveAdapter = new AaveAdapter(address(mockAave), address(router));
        CompoundAdapter compoundAdapter = new CompoundAdapter(address(mockCToken), address(router));

        // 9) Wire Stylus score engine if already deployed
        if (stylusEngine != address(0)) {
            // Initialize the Stylus contract (sets deployer as owner)
            ICreditScoreEngine(stylusEngine).initialize();

            // Authorise CreditManager to call the engine
            ICreditScoreEngine(stylusEngine).setAuthorised(address(manager), true);

            // Wire engine into CreditManager via router
            router.setScoreEngine(stylusEngine);

            console2.log("ScoreEngine initialised and wired:", stylusEngine);
        }

        vm.stopBroadcast();

        // --- Logs ---
        console2.log("TestUSDC:             ", address(usdc));
        console2.log("TokenFaucet:          ", address(faucet));
        console2.log("CreditOracle:         ", address(oracle));
        console2.log("LiquidationController:", address(liq));
        console2.log("CreditRouter:         ", address(router));
        console2.log("CreditManager:        ", address(manager));
        console2.log("InsurancePool:        ", address(insurancePool));
        console2.log("CreditPool:           ", address(creditPool));
        console2.log("AaveAdapter:          ", address(aaveAdapter));
        console2.log("CompoundAdapter:      ", address(compoundAdapter));
        console2.log("MockAavePool:         ", address(mockAave));
        console2.log("MockCToken:           ", address(mockCToken));
        if (stylusEngine != address(0)) {
            console2.log("StylusScoreEngine:    ", stylusEngine);
        } else {
            console2.log("StylusScoreEngine:     NOT YET DEPLOYED");
            console2.log("  -> deploy with: cargo stylus deploy --endpoint $RPC");
            console2.log("  -> then wire:   cast send", address(router),
                "\"setScoreEngine(address)\" <STYLUS_ADDR> --private-key $PRIVATE_KEY");
        }

        // --- Write deployments/<chainId>.json ---
        _writeJson(
            block.chainid,
            deployer,
            address(usdc),
            address(faucet),
            address(oracle),
            address(liq),
            address(router),
            address(manager),
            address(insurancePool),
            address(creditPool),
            address(aaveAdapter),
            address(compoundAdapter),
            address(mockAave),
            address(mockCToken),
            stylusEngine
        );
    }

    function _writeJson(
        uint256 chainId,
        address deployer,
        address usdc,
        address faucet,
        address oracle,
        address liq,
        address router,
        address manager,
        address insurancePool,
        address creditPool,
        address aaveAdapter,
        address compoundAdapter,
        address mockAave,
        address mockCToken,
        address stylusEngine
    ) internal {
        string memory path = string.concat(
            "./deployments/", vm.toString(chainId), ".json"
        );

        string memory json = string.concat(
            '{\n',
            '  "chainId": ',          vm.toString(chainId),    ',\n',
            '  "deployer": "',         vm.toString(deployer),   '",\n',
            '  "timestamp": ',         vm.toString(block.timestamp), ',\n',
            '  "usdc": "',             vm.toString(usdc),       '",\n',
            '  "faucet": "',           vm.toString(faucet),     '",\n',
            '  "creditOracle": "',     vm.toString(oracle),     '",\n',
            '  "liquidationController": "', vm.toString(liq),   '",\n',
            '  "creditRouter": "',     vm.toString(router),     '",\n',
            '  "creditManager": "',    vm.toString(manager),    '",\n',
            '  "insurancePool": "',    vm.toString(insurancePool), '",\n',
            '  "creditPool": "',       vm.toString(creditPool), '",\n',
            '  "aaveAdapter": "',      vm.toString(aaveAdapter),'",\n',
            '  "compoundAdapter": "',  vm.toString(compoundAdapter), '",\n',
            '  "mockAavePool": "',     vm.toString(mockAave),   '",\n',
            '  "mockCToken": "',       vm.toString(mockCToken), '",\n',
            '  "stylusScoreEngine": "',vm.toString(stylusEngine),'"\n',
            '}'
        );

        vm.writeFile(path, json);
        console2.log("Deployment JSON ->", path);
    }
}
