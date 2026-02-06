// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreditAccount {
    address public immutable owner;

    constructor(address _owner) {
        owner = _owner;
    }
}
