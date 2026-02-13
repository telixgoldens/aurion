// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseTest} from "../BaseTest.sol";

contract CreditInvariants is BaseTest {

    function invariant_no_debt_exceeds_credit() public view {
        uint256 credit =
            creditManager.collateralValue(alice) +
            creditManager.delegatedCredit(alice);

        assertLe(
            creditManager.totalDebt(alice),
            credit
        );
    }

    function invariant_conservation_of_credit() public view {
        assertLe(
            creditPool.totalDelegated(),
            creditPool.totalDeposits()
        );
    }

    function invariant_no_healthy_liquidations() public{
    uint256 hf = creditManager.healthFactor(alice);
    if (hf >= 1e18) {
        usdc.mint(address(this), 10e6);
        usdc.approve(address(router), type(uint256).max);

        vm.expectRevert();
        router.liquidate(alice, 1e6, address(usdc));
    }
}

}
