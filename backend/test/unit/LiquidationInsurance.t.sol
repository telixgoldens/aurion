// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseTest} from "../BaseTest.sol";
import {Errors} from "../../contracts/libraries/Errors.sol";

contract LiquidationInsuranceTest is BaseTest {
    function setUp() public override {
        super.setUp();

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

        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 50e6);

        // sanity (avoid “mystery 20e6”)
        assertEq(creditManager.totalDebt(alice), 100e6);
        assertEq(router.closeFactorBps(), 5000);
    }

    function test_liquidate_uses_insurance_bonus() public {
        _makeAliceUnhealthy();

        uint256 reservesBefore = insurancePool.totalReserves();
        uint256 debtBefore = creditManager.totalDebt(alice);

        uint256 requested = 80e6;

        // Router caps repay by close factor
        uint256 maxRepay = (debtBefore * router.closeFactorBps()) / 10_000;
        uint256 repayApplied = requested > maxRepay ? maxRepay : requested;

        // Insurance bonus: your LiquidationController was constructed with 108e16 (1.08)
        // bonusPaid = repayApplied * (1.08 - 1.00) = repayApplied * 0.08
        // In 1e18 fixed point: bonus = repayApplied * (BONUS - 1e18) / 1e18
        uint256 BONUS = 108e16; // 1.08e18
        uint256 expectedBonus = (repayApplied * (BONUS - 1e18)) / 1e18;

        usdc.mint(bob, 1_000_000e6);
        vm.startPrank(bob);
        usdc.approve(address(router), type(uint256).max);

        router.liquidate(alice, requested, address(usdc));

        vm.stopPrank();

        // Debt reduced by repayApplied (not hardcoded 50e6)
        assertEq(creditManager.totalDebt(alice), debtBefore - repayApplied);
        assertTrue(creditManager.frozen(alice));

        // Insurance reserves decreased by expected bonus
        uint256 reservesAfter = insurancePool.totalReserves();
        assertEq(reservesBefore - reservesAfter, expectedBonus);
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

    function test_liquidate_reverts_wrong_asset() public {
        _makeAliceUnhealthy();

        vm.startPrank(bob);
        vm.expectRevert(Errors.InvalidAsset.selector);
        router.liquidate(alice, 1e6, address(0x1234));
        vm.stopPrank();
    }
}
