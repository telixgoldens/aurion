// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import {CreditManager} from "../contracts/core/CreditManager.sol";
import {CreditRouter} from "../contracts/core/CreditRouter.sol";
import {CreditPool} from "../contracts/pools/CreditPool.sol";

import {MockAavePool} from "./mocks/MockAavePool.sol";
import {MockCompound} from "./mocks/MockCompound.sol";
import {MockOracle} from "./mocks/MockOracle.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

abstract contract BaseTest is Test {
    address internal alice = address(0xA11CE);
    address internal bob   = address(0xB0B);
    address internal admin = address(this);

    CreditManager internal creditManager;
    CreditRouter internal router;
    CreditPool internal creditPool;

    MockAavePool internal aave;
    MockCompound internal compound;
    MockOracle internal oracle;
    MockERC20 internal usdc;

    function setUp() public virtual {
    usdc = new MockERC20("USDC", "USDC", 6);
    oracle = new MockOracle();
    aave = new MockAavePool();
    compound = new MockCompound();

    // 1️⃣ deploy router WITHOUT manager
    router = new CreditRouter(
        address(0),
        address(oracle)
    );

    // 2️⃣ deploy manager
    creditManager = new CreditManager(
        address(router),
        address(oracle)
    );

    // 3️⃣ wire manager into router
    router.setCreditManager(address(creditManager));

    // 4️⃣ deploy pool (needs manager)
    creditPool = new CreditPool(
        address(usdc),
        address(creditManager)
    );

    oracle.setPrice(address(usdc), 1e6);

    usdc.mint(alice, 1_000_000e6);
    usdc.mint(bob,   1_000_000e6);
}

}
