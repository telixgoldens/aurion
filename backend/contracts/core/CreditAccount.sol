// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditAccount {
    address public immutable OWNER;

    constructor(address _owner) {
        OWNER = _owner;
    }
}
