// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    address public owner;
    mapping(address => bool) public minters;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event MinterSet(address indexed minter, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "ONLY_MINTER");
        _;
    }

    constructor() ERC20("Test USDC", "USDC") {
        owner = msg.sender;
        emit OwnerChanged(address(0), msg.sender);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function setMinter(address minter, bool allowed) external onlyOwner {
        minters[minter] = allowed;
        emit MinterSet(minter, allowed);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
