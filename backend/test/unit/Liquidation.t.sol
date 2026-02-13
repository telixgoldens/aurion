// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseTest} from "../BaseTest.sol";
import {Errors} from "../../contracts/libraries/Errors.sol";

contract LiquidationTest is BaseTest {
    function setUp() public override {
        super.setUp();

        // Fund insurance pool so liquidation bonus can be paid
        usdc.mint(address(this), 1_000_000e6);
        usdc.approve(address(insurancePool), type(uint256).max);
        insurancePool.deposit(200_000e6);
    }

    function _makeAliceUnhealthy() internal {
        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 100e6);

        vm.prank(address(router));
        creditManager.setDelegatedCredit(alice, 0);

        vm.prank(address(router));
        creditManager.onBorrow(alice, 100e6);

        // Reduce credit => HF < 1
        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 50e6);

        // sanity
        assertEq(creditManager.totalDebt(alice), 100e6);
        assertEq(router.closeFactorBps(), 5000);
    }

    function test_liquidate_reverts_when_healthy() public {
        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 1_000e6);

        vm.prank(address(router));
        creditManager.onBorrow(alice, 100e6);

        usdc.mint(bob, 10e6);
        vm.startPrank(bob);
        usdc.approve(address(router), type(uint256).max);

        vm.expectRevert(Errors.NotLiquidatable.selector);
        router.liquidate(alice, 1e6, address(usdc));

        vm.stopPrank();
    }

    function test_liquidate_reverts_on_zero_amount() public {
        vm.expectRevert(Errors.InvalidAmount.selector);
        router.liquidate(alice, 0, address(usdc));
    }

    function test_liquidate_caps_repay_instead_of_reverting() public {
    _makeAliceUnhealthy();

    usdc.mint(bob, 1_000_000e6);
    vm.startPrank(bob);
    usdc.approve(address(router), type(uint256).max);
    vm.stopPrank();

    // allow 100% close
    router.setCloseFactorBps(10_000);

    uint256 debtBefore = creditManager.totalDebt(alice);

    vm.startPrank(bob);
    router.liquidate(alice, 200e6, address(usdc)); // request > debt
    vm.stopPrank();

    // should be fully repaid (capped to debt)
    assertEq(creditManager.totalDebt(alice), 0);
    assertTrue(creditManager.frozen(alice));
    assertEq(debtBefore, 100e6);
}


    function test_liquidate_reduces_debt_and_freezes_respects_close_factor() public {
        _makeAliceUnhealthy();

        uint256 debtBefore = creditManager.totalDebt(alice);
        uint256 requested = 80e6;

        // Router should cap to close factor
        uint256 maxRepay = (debtBefore * router.closeFactorBps()) / 10_000;
        uint256 expectedRepay = requested > maxRepay ? maxRepay : requested;

        usdc.mint(bob, 1_000_000e6);
        vm.startPrank(bob);
        usdc.approve(address(router), type(uint256).max);

        router.liquidate(alice, requested, address(usdc));

        vm.stopPrank();

        uint256 debtAfter = creditManager.totalDebt(alice);
        assertEq(debtAfter, debtBefore - expectedRepay);
        assertTrue(creditManager.frozen(alice));
    }

    function testFuzz_liquidate_caps_repay(uint96 repay) public {
        _makeAliceUnhealthy();

        uint256 debt = creditManager.totalDebt(alice);

        // non-zero requested repay to avoid InvalidAmount()
        uint256 requested = (uint256(repay) % debt) + 1;

        // cap per close factor
        uint256 maxRepay = (debt * router.closeFactorBps()) / 10_000;
        uint256 expectedRepay = requested > maxRepay ? maxRepay : requested;

        usdc.mint(bob, debt + 200_000e6);
        vm.startPrank(bob);
        usdc.approve(address(router), type(uint256).max);

        router.liquidate(alice, requested, address(usdc));

        vm.stopPrank();

        assertEq(creditManager.totalDebt(alice), debt - expectedRepay);
    }
}
