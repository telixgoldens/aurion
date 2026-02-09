// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IAave } from "../interfaces/IAave.sol";
import { Errors } from "../libraries/Errors.sol";

contract AaveAdapter {
    IAave public immutable aave;

    constructor(address _aave) {
        aave = IAave(_aave);
    }

    function borrow(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external {
        aave.borrow(asset, amount, 2, 0, onBehalfOf);
    }
}
