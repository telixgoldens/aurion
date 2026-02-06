// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICreditManager {
    function validateBorrow(
        address user,
        uint256 amount
    ) external view returns (bool);

    function onBorrow(address user, uint256 amount) external;

    function totalDebt(address user) external view returns (uint256);

    function creditLimit(address user) external view returns (uint256);

    function frozen(address user) external view returns (bool);
}
