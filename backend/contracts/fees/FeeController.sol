// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";
import { InsuranceFund } from "../insurance/InsuranceFund.sol";

contract FeeController {
    address public treasury;
    InsuranceFund public insurance;

    uint256 public constant CP_SHARE = 70;
    uint256 public constant TREASURY_SHARE = 20;
    uint256 public constant INSURANCE_SHARE = 10;

    constructor(address _treasury, address _insurance) {
        treasury = _treasury;
        insurance = InsuranceFund(_insurance);
    }

    receive() external payable {}

    function distribute(address creditPool) external {
        uint256 amount = address(this).balance;
        if (amount == 0) return;

        uint256 cpAmount = (amount * CP_SHARE) / 100;
        uint256 treasuryAmount = (amount * TREASURY_SHARE) / 100;
        uint256 insuranceAmount = amount - cpAmount - treasuryAmount;

        payable(creditPool).transfer(cpAmount);
        payable(treasury).transfer(treasuryAmount);
        payable(address(insurance)).transfer(insuranceAmount);
    }
}
