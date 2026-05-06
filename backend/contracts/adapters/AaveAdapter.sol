// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAave} from "../interfaces/IAave.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AaveAdapter {
    using SafeERC20 for IERC20;

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
    ) external onlyRouter {
        AAVE.borrow(asset, amount, 2, 0, onBehalfOf);
    }

    /// @notice Repay a variable-rate borrow on behalf of a user.
    ///         The router transfers tokens to this adapter before calling.
    function repay(
        address asset,
        uint256 amount,
        address onBehalfOf
    ) external onlyRouter {
        IERC20(asset).forceApprove(address(AAVE), amount);
        AAVE.repay(asset, amount, 2, onBehalfOf);
    }
}
