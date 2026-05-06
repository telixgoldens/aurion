// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ICompound} from "../interfaces/ICompound.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CompoundAdapter {
    using SafeERC20 for IERC20;

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

    /// @notice Repay a Compound borrow.
    ///         The router transfers tokens to this adapter before calling.
    function repay(uint256 amount) external onlyRouter {
        address underlying = C_TOKEN.underlying();
        IERC20(underlying).forceApprove(address(C_TOKEN), amount);
        require(C_TOKEN.repayBorrow(amount) == 0, "COMPOUND_REPAY_FAIL");
    }
}
