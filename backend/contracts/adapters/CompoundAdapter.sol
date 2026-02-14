// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICompound } from "../interfaces/ICompound.sol";

contract CompoundAdapter {
    ICompound public immutable C_TOKEN;
    address public immutable ROUTER;

    error NotRouter();

    constructor(address _cToken, address _router) {
        C_TOKEN = ICompound(_cToken);
        ROUTER = _router;
    }

    modifier onlyRouter() {
        if (msg.sender != ROUTER) revert NotRouter();
        _;
    }

    function borrow(uint256 amount) external onlyRouter {
        require(C_TOKEN.borrow(amount) == 0, "COMPOUND_BORROW_FAIL");
    }
}
