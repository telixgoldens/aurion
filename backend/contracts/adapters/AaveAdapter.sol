// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IAave } from "../interfaces/IAave.sol";

contract AaveAdapter {
    IAave public immutable AAVE;
    address public immutable ROUTER;

    error NotRouter();

    constructor(address _aave, address _router) {
        AAVE = IAave(_aave);
        ROUTER = _router;
    }

    modifier onlyRouter() {
        if (msg.sender != ROUTER) revert NotRouter();
        _;
    }

    function borrow(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external onlyRouter{
        AAVE.borrow(asset, amount, 2, 0, onBehalfOf);
    }
}
