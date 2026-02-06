// test/integration/AaveIntegration.t.sol
pragma solidity ^0.8.20;

import "../BaseTest.sol";

contract AaveIntegrationTest is BaseTest {

    function test_borrow_through_router() public {
        creditManager.setCollateralValue(alice, 1000e6);

        vm.prank(alice);
        router.borrowFromAave(address(usdc), 300e6);

        assertEq(
            creditManager.totalDebtValue(alice),
            300e6
        );
        assertEq(
            aave.debt(alice),
            300e6
        );
    }
}
