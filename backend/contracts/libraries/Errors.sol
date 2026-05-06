// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    error NotAuthorized();
    error FrozenAccount();
    error InsufficientCredit();
    error InvalidAmount();
    error OracleUnhealthy();
    error PoolNotFound();
    error AdapterFailure();
    error NotLiquidatable();
    error InvalidLiquidationBonus();
    error RepayExceedsDebt();
    error InvalidAsset();
    error NotOwner();
    error ZeroAddress();
    error AlreadySet();
    error AlreadyInitialized();
    error AccountFrozen();
    error StalePriceFeed();
    error LiquidationFailed();
    error InsufficientLiquidity();
    error WithdrawExceedsBalance();
}


