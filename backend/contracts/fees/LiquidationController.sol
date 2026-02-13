// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";

contract LiquidationController {
    uint256 public constant LIQUIDATION_THRESHOLD = 1e18;
    uint256 public immutable LIQUIDATION_BONUS;

    constructor(uint256 bonus) {
        if (bonus < 105e16 || bonus > 11e17) {
            revert Errors.InvalidLiquidationBonus();
        }
        LIQUIDATION_BONUS = bonus;
    }

    function isLiquidatable(uint256 healthFactor)
        external
        pure
        returns (bool)
    {
        return healthFactor < LIQUIDATION_THRESHOLD;
    }

    function seizeAmount(uint256 repayAmount)
        external
        view
        returns (uint256)
    {
        return (repayAmount * LIQUIDATION_BONUS) / 1e18;
    }
}
