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
    bytes32 SALT = 0x7ceda52a00000000000000000000000000000000000000000000000000000002; 

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    function run() external returns (Players, AvatarBasedAccount, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig(); 
        (address registry, , , ) = helperConfig.activeNetworkConfig(); 
        uint256 version = 1;

        // AvatarBasedAccount account = new AvatarBasedAccount(); // £ NB: HERE IS THE BUG! 
        // uint256 codelength = address(account).code.length; 

        vm.startBroadcast();
            // £note: deterministic deployment created problems. So now, with each deployment ALSO new Avatar Based Account deployed.
            AvatarBasedAccount erc6551account = new AvatarBasedAccount{salt: SALT}();
        vm.stopBroadcast();
        
        require(address(erc6551account) != address(0), "error with deployment Avatar Based Account"); 

        vm.startBroadcast();
        players = new Players{salt: SALT}(
                version,
                address(erc6551account),  // on ethSepolia deployed @ 0x27027C7F5B357aE339f25A421A7F159A58394cE0 -- use config? £bug Had to hard code because deterministic deployment in foundry is not determinsitic. 
                address(registry), 
                address(0)
            );
        vm.stopBroadcast();

        return (players, erc6551account, helperConfig); 
    }
}