// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import { CreditManager } from "../../contracts/core/CreditManager.sol";

contract ForkInvariant is Test {
    CreditManager manager;
    address user = address(0xCAFE);

    function invariant_debt_leq_credit() public {
        uint256 debt = manager.totalDebt(user);
        uint256 limit = manager.creditLimit(user);
        assertLe(debt, limit);
    }
}
