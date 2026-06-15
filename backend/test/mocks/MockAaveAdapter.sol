// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MockAavePool} from "./MockAavePool.sol";

contract MockAaveAdapter {
    MockAavePool public immutable POOL;

    constructor(address pool) {
        POOL = MockAavePool(pool);
    }
    
    function borrow(address asset, uint256 amount, address user) external {
        POOL.borrow(asset, amount, 2, 0, user); 
    }
}
