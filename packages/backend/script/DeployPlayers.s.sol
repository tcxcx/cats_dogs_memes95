// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {Players} from "../src/Players.sol";
import {AvatarBasedAccount} from "../src/AvatarBasedAccount.sol";

// Deployment contract for players contract. 
// I think it should pretty much be chain agnostic. But can always create a dynamic config script if needed.  
contract DeployPlayers is Script {
    Players players;
    AvatarBasedAccount avatarBasedAccount; 
    bytes32 SALT = bytes32(hex'7ceda5'); 

    // calculating on what address avatarBasedAccount should have been deployed. 
    AvatarBasedAccount account = new AvatarBasedAccount{salt: SALT}(); 

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    function run() external returns (Players, AvatarBasedAccount) {
        string memory version = "alpha.1";
        address registry; 
        if (block.chainid == 31337) {
            registry = 0x9914875e25092EB2A50ABF3aCD3295c7ab65c846;  
        } else { 
            registry = 0x000000006551c19487814612e58FE06813775758;  
        }

        vm.startBroadcast();
            uint256 codeLength = address(account).code.length; // checking if a contract has been deployed on the calculated address. 
            console2.log("account codeLength: ", codeLength); 
            if (codeLength == 0) { 
                avatarBasedAccount = new AvatarBasedAccount{salt: SALT}(); 
                console2.log("AvatarBasedAccount address: ", address(avatarBasedAccount));
            } 
            
            players = new Players(
                version,
                address(account), 
                address(registry)
            );
        vm.stopBroadcast();

        return (players, account); 
    }
}
