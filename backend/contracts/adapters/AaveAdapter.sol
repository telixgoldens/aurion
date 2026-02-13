// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IAave } from "../interfaces/IAave.sol";

contract AaveAdapter {
    IAave public immutable AAVE;

    constructor(address _aave) {
        AAVE = IAave(_aave);
    }

    function borrow(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external {
        AAVE.borrow(asset, amount, 2, 0, onBehalfOf);
    }
}
