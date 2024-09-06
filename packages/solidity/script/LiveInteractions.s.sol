// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {Players} from "../src/Players.sol";
import {AvatarBasedAccount} from "../src/AvatarBasedAccount.sol";
import {HelperConfig} from "./HelperConfig.s.sol"; 
import {DeployedContracts} from "../src/lib/DeployedContracts.sol"; 
// /home/teijehidde/Documents/7CedarsGit/projects/cats_dogs_memes95/packages/solidity/src/lib/DeployedContracts.sol

// Deployment contract for players contract. 
// I think it should pretty much be chain agnostic. But can always create a dynamic config script if needed.  
contract LiveInteractions is Script {
    DeployedContracts deployedContracts = new DeployedContracts(); 
    Players players = Players(deployedContracts.players());
    AvatarBasedAccount avatarBasedAccount = AvatarBasedAccount(payable(deployedContracts.avatarBasedAccounts())); 

    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    function run() external {

        vm.startBroadcast();
        players.createPlayer(avatarUri);
        vm.stopBroadcast();

    }
}