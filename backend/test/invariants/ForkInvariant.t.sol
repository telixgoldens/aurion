// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StdInvariant} from "forge-std/StdInvariant.sol";
import {BaseTest} from "../BaseTest.sol";

contract ForkInvariant is StdInvariant, BaseTest {
    function setUp() public override {
        super.setUp();
        targetContract(address(router));
    }

    function invariant_debt_leq_credit() public view {
        uint256 credit =
            creditManager.collateralValue(alice) +
            creditManager.delegatedCredit(alice);

        assertLe(creditManager.totalDebt(alice), credit);
    }
}
