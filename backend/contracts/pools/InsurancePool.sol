// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Errors } from "../libraries/Errors.sol";

contract InsurancePool {
    using SafeERC20 for IERC20;
    IERC20 public immutable ASSET;
    address public immutable ROUTER;

    uint256 public totalReserves;

    event InsuranceDeposit(address indexed from, uint256 amount);
    event InsuranceCover(address indexed router, uint256 requested, uint256 paid);

    constructor(address asset, address router) {
        ASSET = IERC20(asset);
        ROUTER = router;
    }

    modifier onlyRouter() {
         _onlyRouter();
         _;
     }
 
     function _onlyRouter() internal view{
         if (msg.sender != ROUTER) revert Errors.NotAuthorized();
    }

    function deposit(uint256 amount) external {
        if (amount == 0) revert Errors.InvalidAmount();
        ASSET.safeTransferFrom(msg.sender, address(this), amount);
        totalReserves += amount;
        emit InsuranceDeposit(msg.sender, amount);
    }

    function cover(uint256 amount) external onlyRouter returns (uint256 paid) {
        if (amount == 0) return 0;
        paid = amount > totalReserves ? totalReserves : amount;
        totalReserves -= paid;
        ASSET.safeTransfer(ROUTER, paid);
        emit InsuranceCover(ROUTER, amount, paid);
    }
    

}
