// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ForkBase} from "./ForkBase.t.sol";
import {ArbitrumAddresses} from "../utils/ArbitrumAddresses.sol";
import { CreditManager } from "../../contracts/core/CreditManager.sol";
import { CreditRouter } from "../../contracts/core/CreditRouter.sol";
import { CreditOracle } from "../../contracts/oracle/CreditOracle.sol";
import { CompoundAdapter } from "../../contracts/adapters/CompoundAdapter.sol";
import { LiquidationController } from "../../contracts/fees/LiquidationController.sol";

contract CompoundBorrowForkTest is ForkBase {
    CreditManager manager;
    CreditRouter router;
    CreditOracle oracle;
    CompoundAdapter adapter;
    LiquidationController internal liquidationController;

    address user = address(0xBEEF);

    function setUp() public {
        setUpFork();

        oracle = new CreditOracle();
        adapter = new CompoundAdapter(ArbitrumAddresses.CUSDC);
        liquidationController = new LiquidationController(108e16); 
        router = new CreditRouter(address(0), address(oracle), address(liquidationController), address(0));
        manager = new CreditManager(address(router), address(oracle));
        router.setCreditManager(address(manager));

        vm.prank(address(router));
        manager.setCollateralValue(user, 30_000e6);

        vm.prank(address(router));
        manager.setDelegatedCredit(user, 10_000e6);
    }

    function testCompoundBorrow() public {
        vm.startPrank(user);

        router.borrowFromCompound(
            address(adapter),
            5_000e6
        );

        vm.stopPrank();

        assertEq(manager.totalDebt(user), 5_000e6);
    }
}
