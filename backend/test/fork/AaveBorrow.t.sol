// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ForkBase} from "./ForkBase.t.sol";
import {ArbitrumAddresses} from "../utils/ArbitrumAddresses.sol";
import { CreditManager } from "../../contracts/core/CreditManager.sol";
import { CreditRouter } from "../../contracts/core/CreditRouter.sol";
import { CreditOracle } from "../../contracts/oracle/CreditOracle.sol";
import { AaveAdapter } from "../../contracts/adapters/AaveAdapter.sol";
import { LiquidationController } from "../../contracts/fees/LiquidationController.sol";


contract AaveBorrowForkTest is ForkBase {
    CreditManager manager;
    CreditRouter router;
    CreditOracle oracle;
    AaveAdapter adapter;
    LiquidationController internal liquidationController;

    address user = address(0xABCD);

    function setUp() public {
        setUpFork();

        oracle = new CreditOracle();
        adapter = new AaveAdapter(ArbitrumAddresses.AAVE_POOL);
        liquidationController = new LiquidationController(108e16); 
        router = new CreditRouter(address(0), address(oracle), address(liquidationController), address(0));
        manager = new CreditManager(address(router), address(oracle));

        vm.prank(address(this));
        router.setCreditManager(address(manager));

        vm.deal(user, 10 ether);

        vm.prank(address(router));
        manager.setCollateralValue(user, 50_000e6);

        vm.prank(address(router));
        manager.setDelegatedCredit(user, 20_000e6);
    }

    function testBorrowWithinCreditLimit() public {
        vm.startPrank(user);

        router.borrowFromAave(
            address(adapter),
            ArbitrumAddresses.USDC,
            10_000e6
        );

        vm.stopPrank();

        assertEq(manager.totalDebt(user), 10_000e6);
    }

    function testBorrowFailsWhenOracleUnhealthy() public {
        oracle.setHealthy(false);

        vm.startPrank(user);
        vm.expectRevert();
        router.borrowFromAave(
            address(adapter),
            ArbitrumAddresses.USDC,
            1_000e6
        );
        vm.stopPrank();
    }
}
