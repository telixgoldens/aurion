// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseTest} from "../BaseTest.sol";

contract CreditManagerTest is BaseTest {

    function test_validateBorrow_pass() public {
        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 1000e6);

        vm.prank(address(router));
        creditManager.setDelegatedCredit(alice, 500e6);

        bool ok = creditManager.validateBorrow(alice, 200e6);
        assertTrue(ok);
    }

    function test_validateBorrow_fail_insufficient() public {
        vm.prank(address(router));
        creditManager.setCollateralValue(alice, 100e6);

        bool ok = creditManager.validateBorrow(alice, 200e6);
        assertFalse(ok);
    }

    function test_freeze_account_blocks_borrow() public {
        vm.prank(address(router));
        creditManager.freeze(alice);

        bool ok = creditManager.validateBorrow(alice, 1e6);
        assertFalse(ok);
    }
}
