// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";

contract AaveIntegrationTest is BaseTest {

    function test_borrow_through_router() public {
        creditManager.setCollateralValue(alice, 1000e6);

        vm.prank(alice);
        router.borrowFromAave(
            address(aave),   // adapter
            address(usdc),   // asset
            300e6            // amount
        );

        assertEq(
            creditManager.totalDebt(alice),
            300e6
        );

        assertEq(
            aave.debtOf(alice),
            300e6
        );
    }
}
