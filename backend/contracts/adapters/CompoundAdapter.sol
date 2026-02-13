// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICompound } from "../interfaces/ICompound.sol";

contract CompoundAdapter {
    ICompound public immutable C_TOKEN;

    constructor(address _cToken) {
        C_TOKEN = ICompound(_cToken);
    }

    function borrow(uint256 amount) external {
        require(C_TOKEN.borrow(amount) == 0, "COMPOUND_BORROW_FAIL");
    }
}
