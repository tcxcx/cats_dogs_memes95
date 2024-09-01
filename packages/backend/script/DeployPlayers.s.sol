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
    function run() external returns (Players, AvatarBasedAccount) {
        HelperConfig helperConfig = new HelperConfig(); 
        (address account, address registry, , , ) = helperConfig.activeNetworkConfig(); 
        string memory version = "alpha.1";
   
        vm.startBroadcast();
            players = new Players(
                version,
                address(account), 
                address(registry)
            );
        vm.stopBroadcast();

        AvatarBasedAccount avatarBasedAccount = AvatarBasedAccount(payable(account)); 

        return (players, avatarBasedAccount); 
    }
}
