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
}
