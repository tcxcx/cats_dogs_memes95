// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {Players} from "../src/Players.sol";
import {AvatarBasedAccount} from "../src/AvatarBasedAccount.sol";
import {HelperConfig} from "./HelperConfig.s.sol"; 

// Deployment contract for players contract. 
// I think it should pretty much be chain agnostic. But can always create a dynamic config script if needed.  
contract DeployPlayers is Script {
    Players players;
    AvatarBasedAccount avatarBasedAccount; 

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    function run() external returns (Players, AvatarBasedAccount, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig(); 
        (address registry, , , ) = helperConfig.activeNetworkConfig(); 
        uint256 version = 1;

        AvatarBasedAccount account = new AvatarBasedAccount(); 
        uint256 codelength = address(account).code.length; 


        vm.startBroadcast();
            // £note: deterministic deployment created problems. So now, with each deployment ALSO new Avatar Based Account deployed.
            if (codelength == 0) {AvatarBasedAccount account = new AvatarBasedAccount();}
            players = new Players(
                version,
                address(account), 
                address(registry)
            );
        vm.stopBroadcast();

        return (players, avatarBasedAccount, helperConfig); 
    }
}