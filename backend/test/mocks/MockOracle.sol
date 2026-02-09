// test/mocks/MockOracle.sol
pragma solidity ^0.8.20;

contract MockOracle {
    mapping(address => uint256) public prices;
    bool public healthy = true;

    function setPrice(address asset, uint256 price) external {
        prices[asset] = price;
    }

    function setHealthy(bool h) external {
        healthy = h;
    }

    function getPrice(address asset) external view returns (uint256) {
        require(healthy, "ORACLE_UNHEALTHY");
        return prices[asset];
    }
}
