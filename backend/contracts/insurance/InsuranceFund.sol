// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";

contract InsuranceFund {
    address public controller;
    uint256 public totalBalance;

    constructor(address _controller) {
        controller = _controller;
    }

   modifier onlyController() {
    _onlyController();
    _;
}

function _onlyController() internal view{
    if (msg.sender != controller) revert Errors.NotAuthorized();
}


    receive() external payable {
        totalBalance += msg.value;
    }

    function payOut(address to, uint256 amount) external onlyController {
        if (amount > totalBalance) amount = totalBalance;
        totalBalance -= amount;
        payable(to).transfer(amount);
    }
}
