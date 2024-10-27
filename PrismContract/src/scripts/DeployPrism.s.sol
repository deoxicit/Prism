// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../PrismUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployPrism is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Try deploying just the implementation first
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy implementation
        console.log("Deploying implementation...");
        PrismUpgradeable implementation = new PrismUpgradeable();
        console.log("Implementation at:", address(implementation));

        vm.stopBroadcast();
    }
}