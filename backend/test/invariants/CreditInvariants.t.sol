// test/invariants/CreditInvariants.t.sol
pragma solidity ^0.8.20;

import "../BaseTest.sol";

contract CreditInvariants is BaseTest {

    function invariant_no_debt_exceeds_credit() public {
        uint256 credit =
            creditManager.collateralValue(alice) +
            creditManager.delegatedCredit(alice);

        assertLe(
            creditManager.totalDebtValue(alice),
            credit
        );
    }

    function invariant_conservation_of_credit() public {
        assertLe(
            creditPool.totalDelegated(),
            creditPool.totalDeposits()
        );
    }
}
