// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../PrismUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UpgradePrism is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        PrismUpgradeable newImplementation = new PrismUpgradeable();

        // Get proxy instance
        PrismUpgradeable proxy = PrismUpgradeable(proxyAddress);

        // Upgrade to new implementation
        proxy.upgradeToAndCall(address(newImplementation), "");

        console.log("New implementation deployed to:", address(newImplementation));
        console.log("Proxy upgraded at:", proxyAddress);

        vm.stopBroadcast();
    }
}