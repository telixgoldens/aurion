// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

contract TokenFaucet {
    address public owner;
    address public token;

    uint256 public claimAmount;     // in token smallest units
    uint256 public cooldownSeconds;

    mapping(address => uint256) public lastClaimAt;

    event TokenSet(address indexed token);
    event ParamsSet(uint256 claimAmount, uint256 cooldownSeconds);
    event Claimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(address _token, uint256 _claimAmount, uint256 _cooldownSeconds) {
        owner = msg.sender;
        token = _token;
        claimAmount = _claimAmount;
        cooldownSeconds = _cooldownSeconds;

        emit TokenSet(_token);
        emit ParamsSet(_claimAmount, _cooldownSeconds);
    }

    function setToken(address _token) external onlyOwner {
        token = _token;
        emit TokenSet(_token);
    }

    function setParams(uint256 _claimAmount, uint256 _cooldownSeconds) external onlyOwner {
        claimAmount = _claimAmount;
        cooldownSeconds = _cooldownSeconds;
        emit ParamsSet(_claimAmount, _cooldownSeconds);
    }

    function claim() external {
        uint256 last = lastClaimAt[msg.sender];
        require(block.timestamp >= last + cooldownSeconds, "COOLDOWN");

        lastClaimAt[msg.sender] = block.timestamp;

        IMintableToken(token).mint(msg.sender, claimAmount);
        emit Claimed(msg.sender, claimAmount);
    }

    function tokenDecimals() external view returns (uint8) {
        return IERC20Metadata(token).decimals();
    }

    function tokenSymbol() external view returns (string memory) {
        return IERC20Metadata(token).symbol();
    }
}
