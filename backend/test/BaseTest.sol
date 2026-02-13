// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";

import {CreditManager} from "../contracts/core/CreditManager.sol";
import {CreditRouter} from "../contracts/core/CreditRouter.sol";
import {CreditPool} from "../contracts/pools/CreditPool.sol";
import { InsurancePool } from "../contracts/pools/InsurancePool.sol";
import { LiquidationController } from "../contracts/fees/LiquidationController.sol";
import {MockAavePool} from "./mocks/MockAavePool.sol";
import {MockCompound} from "./mocks/MockCompound.sol";
import {MockOracle} from "./mocks/MockOracle.sol";
import {MockERC20} from "./mocks/MockERC20.sol";
import {MockAaveAdapter} from "./mocks/MockAaveAdapter.sol";

abstract contract BaseTest is Test {
    address internal alice = address(0xA11CE);
    address internal bob   = address(0xB0B);
    address internal admin = address(this);

    CreditManager internal creditManager;
    CreditRouter internal router;
    CreditPool internal creditPool;
    LiquidationController internal liquidationController;
    InsurancePool internal insurancePool;
    MockAaveAdapter internal aaveAdapter;

    MockAavePool internal aave;
    MockCompound internal compound;
    MockOracle internal oracle;
    MockERC20 internal usdc;

    function setUp() public virtual {
    usdc = new MockERC20("USDC", "USDC", 6); 
    oracle = new MockOracle();
    aave = new MockAavePool();
    aaveAdapter = new MockAaveAdapter(address(aave));
    compound = new MockCompound();
    liquidationController = new LiquidationController(108e16);

    router = new CreditRouter( address(0), address(oracle), address(liquidationController), address(0) );

    creditManager = new CreditManager( address(router), address(oracle));
    router.setCreditManager(address(creditManager));

    insurancePool = new InsurancePool(address(usdc), address(router));
    router.setInsurancePool(address(insurancePool));

    creditPool = new CreditPool(address(usdc), address(creditManager), address(router));
    vm.prank(address(router));
    creditManager.setPool(address(creditPool));


    oracle.setPrice(address(usdc), 1e6);

    usdc.mint(alice, 1_000_000e6);
    usdc.mint(bob,   1_000_000e6);
    }

}
