// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockAavePool} from "./MockAavePool.sol";

contract MockAaveAdapter {
    MockAavePool public immutable POOL;

    constructor(address pool) {
        POOL = MockAavePool(pool);
    }

    // matches your router expectations: borrow(asset, amount, user)
    function borrow(address asset, uint256 amount, address user) external {
        // call the Aave pool with correct params
        POOL.borrow(asset, amount, 2, 0, user); // 2 = variable rate (typical), referral=0
    }
}
