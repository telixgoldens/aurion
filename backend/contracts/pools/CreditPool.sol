// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Errors } from "../libraries/Errors.sol";
import { ICreditManager } from "../interfaces/ICreditManager.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CreditPool {
    IERC20 public immutable usdc;
    ICreditManager public immutable creditManager;

    uint256 private _totalDeposits;
    uint256 private _totalDelegated;

    constructor(address _usdc, address _creditManager) {
        usdc = IERC20(_usdc);
        creditManager = ICreditManager(_creditManager);
    }

    /*//////////////////////////////////////////////////////////////
                                VIEWS
    //////////////////////////////////////////////////////////////*/

    function totalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    function totalDelegated() external view returns (uint256) {
        return _totalDelegated;
    }

    function availableLiquidity() public view returns (uint256) {
        return _totalDeposits - _totalDelegated;
    }

    /*//////////////////////////////////////////////////////////////
                                ACTIONS
    //////////////////////////////////////////////////////////////*/

    function deposit(uint256 amount) external {
        usdc.transferFrom(msg.sender, address(this), amount);
        _totalDeposits += amount;
    }

    function delegateCredit(address user, uint256 amount) external {
        if (amount > availableLiquidity()) {
            revert Errors.InsufficientCredit();
        }

        _totalDelegated += amount;
        creditManager.setDelegatedCredit(user, amount);
    }
}
