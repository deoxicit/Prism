// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/Prism.sol";

contract DeployPrism is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address someAddress = address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4);
        Prism prism = new Prism(someAddress);

        console.log("PostManager deployed to:", address(prism));

        vm.stopBroadcast();
    }
}