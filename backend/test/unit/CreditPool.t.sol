// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseTest} from "../BaseTest.sol";

contract CreditPoolTest is BaseTest {
    function test_deposit_and_delegate() public {
        vm.startPrank(bob);
        usdc.approve(address(creditPool), 1000e6);
        creditPool.deposit(1000e6);
        vm.stopPrank();

        vm.prank(address(router));
        creditPool.delegateCredit(alice, 500e6);

        assertEq(creditManager.delegatedCredit(alice), 500e6);
    }

    function test_delegate_overflow_reverts() public {
        vm.expectRevert();
        vm.prank(address(router));
        creditPool.delegateCredit(alice, 1e6);
    }
}
