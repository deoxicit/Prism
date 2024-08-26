// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/Prism.sol";

contract DeployPrism is Script {
    function setUp() public {}

    function run() public {
        bytes32 privateKeyBytes = vm.envBytes32("PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyBytes);
        vm.startBroadcast(deployerPrivateKey);

        address someAddress = address(0x2Baffb43dcD57907dD6408E1afB8b7b09548bCcc);
        Prism prism = new Prism(someAddress);

        console.log("Prism deployed to:", address(prism));

        vm.stopBroadcast();
    }
}