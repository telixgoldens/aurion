// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ICompound } from "../interfaces/ICompound.sol";

contract CompoundAdapter {
    ICompound public immutable cToken;

    constructor(address _cToken) {
        cToken = ICompound(_cToken);
    }

    function borrow(uint256 amount) external {
        require(cToken.borrow(amount) == 0, "COMPOUND_BORROW_FAIL");
    }
}
