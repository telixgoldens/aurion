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

contract DeploySepolia is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        uint256 bonus = 108e16;
        uint256 faucetClaim = 1_000e6;
        uint256 faucetCooldown = 3600;

        vm.startBroadcast(pk);
        

        TestUSDC usdc = new TestUSDC();
        TokenFaucet faucet = new TokenFaucet(address(usdc), faucetClaim, faucetCooldown);
        usdc.setMinter(address(faucet), true);

        CreditOracle oracle = new CreditOracle();
        LiquidationController liq = new LiquidationController(bonus);

        CreditRouter router = new CreditRouter(
            address(0), address(oracle), address(liq), address(0)
        );

        CreditManager manager = new CreditManager(address(router), address(oracle));
        router.setCreditManager(address(manager));

        InsurancePool insurancePool = new InsurancePool(address(usdc), address(router));
        router.setInsurancePool(address(insurancePool));

        CreditPool creditPool = new CreditPool(address(usdc), address(manager), address(router));
        router.setCreditPool(address(creditPool));

        MockAavePool mockAave = new MockAavePool(address(usdc));
        MockCToken mockCToken = new MockCToken(address(usdc));
        usdc.setMinter(deployer, true);
        uint256 fiveMillion = 5_000_000e6;
        usdc.mint(address(mockAave), fiveMillion);
        usdc.mint(address(mockCToken), fiveMillion);

        AaveAdapter aaveAdapter = new AaveAdapter(address(mockAave), address(router));
        CompoundAdapter compoundAdapter = new CompoundAdapter(address(mockCToken), address(router));

        router.setScoreEngine(0xF1914F16Ee1135cAc49cd48E5AD2Ad036792602E);
        ICreditScoreEngine(0xF1914F16Ee1135cAc49cd48E5AD2Ad036792602E)
            .setAuthorised(address(router),  true);
        ICreditScoreEngine(0xF1914F16Ee1135cAc49cd48E5AD2Ad036792602E)
            .setAuthorised(address(manager), true);

        vm.stopBroadcast();

        // ── Wiring verification (will revert if anything is wrong) ──────────
        require(
            address(router.creditManager()) == address(manager),
            "WIRE: router.creditManager mismatch"
        );
        require(
            manager.router() == address(router),
            "WIRE: manager.router mismatch"
        );
        require(
            address(router.ORACLE()) == address(oracle),
            "WIRE: oracle mismatch"
        );
        require(
            oracle.healthy() == true,
            "WIRE: oracle not healthy"
        );
        require(
            address(router.insurancePool()) == address(insurancePool),
            "WIRE: insurancePool mismatch"
        );
        require(
            address(router.creditPool()) == address(creditPool),
            "WIRE: creditPool mismatch"
        );
        require(
            address(manager.pool()) == address(creditPool),
            "WIRE: manager.pool mismatch"
        );
        require(
            aaveAdapter.ROUTER() == address(router),
            "WIRE: aaveAdapter.ROUTER mismatch"
        );
        require(
            compoundAdapter.ROUTER() == address(router),
            "WIRE: compoundAdapter.ROUTER mismatch"
        );

        console2.log("=== ALL WIRING CHECKS PASSED ===");
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
            address(mockCToken)
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
        address mockCToken
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
            '  "stylusScoreEngine": "0xf1914f16ee1135cac49cd48e5ad2ad036792602e"\n',
            '}'
        );

        vm.writeFile(path, json);
        console2.log("Deployment JSON ->", path);
    }
}
