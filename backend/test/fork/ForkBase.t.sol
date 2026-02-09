// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

abstract contract ForkBase is Test {
    uint256 arbFork;

    function setUpFork() internal {
        arbFork = vm.createFork(vm.rpcUrl("arbitrum"));
        vm.selectFork(arbFork);
    }
}
