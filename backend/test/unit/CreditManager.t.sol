// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";

contract CreditManagerTest is BaseTest {

    function test_validateBorrow_pass() public {
        creditManager.setCollateralValue(alice, 1000e6);
        creditManager.setDelegatedCredit(alice, 500e6);

        bool ok = creditManager.validateBorrow(alice, 200e6);
        assertTrue(ok);
    }

    function test_validateBorrow_fail_insufficient() public {
        creditManager.setCollateralValue(alice, 100e6);

        bool ok = creditManager.validateBorrow(alice, 200e6);
        assertFalse(ok);
    }

    function test_freeze_account_blocks_borrow() public {
        creditManager.freeze(alice);

        bool ok = creditManager.validateBorrow(alice, 1e6);
        assertFalse(ok);
    }
}
