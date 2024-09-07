// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {PlayersL2} from "../src/PlayersL2.sol";
import {AbaOptimismToMainnet} from "../src/AbaOptimismToMainnet.sol";
import {HelperConfig} from "./HelperConfig.s.sol"; 

// Deployment contract for playersL2 contract. 
// I think it should pretty much be chain agnostic. But can always create a dynamic config script if needed.  
contract DeployPlayersL2 is Script {
    PlayersL2 playersL2;
    AbaOptimismToMainnet abaOptimismToMainnet; 

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    function run() external returns (PlayersL2, AbaOptimismToMainnet, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig(); 
        (address registry, , , ) = helperConfig.activeNetworkConfig(); 
        uint256 version = 1;

        // Note £bug the separate broadcasts - otherwise a foundry bug will reset nonce to 0.  
        vm.startBroadcast();
            abaOptimismToMainnet = new AbaOptimismToMainnet();
        vm.stopBroadcast();

        vm.startBroadcast();
            playersL2 = new PlayersL2(
                version,
                address(address(abaOptimismToMainnet)),  // £bug Had to hard code because deterministic deployment in foundry is not determinsitic. 
                address(registry)
            );
        vm.stopBroadcast();

        return (playersL2, abaOptimismToMainnet, helperConfig); 
    }
}