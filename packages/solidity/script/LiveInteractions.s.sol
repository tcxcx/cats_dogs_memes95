// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {Players} from "../src/Players.sol";
import {Cards} from "../src/Cards.sol";
import {Games} from "../src/Games.sol";
import {AvatarBasedAccount} from "../src/AvatarBasedAccount.sol";
import {HelperConfig} from "./HelperConfig.s.sol"; 
import {DeployedContracts} from "../src/lib/DeployedContracts.sol"; 

// Deployment contract for players contract. 
// I think it should pretty much be chain agnostic. But can always create a dynamic config script if needed.  
contract LiveInteractions is Script {
    DeployedContracts deployedContracts = new DeployedContracts(); 
    AvatarBasedAccount avatarBasedAccount = AvatarBasedAccount(payable(deployedContracts.avatarBasedAccounts())); 
    Players players = Players(deployedContracts.players());
    Cards cards = Cards(payable(deployedContracts.cards()));
    Games games = Games(deployedContracts.games());
    
    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    // £note1: see for a convenient overview of addresses: https://tokenbound-v3-deployer.vercel.app/ 
    // £note1: for somekind of reason the deterministic address on my Anvil chain is not the correct (...6551...) one. Hence the quick conditional setup here. 
    // function run() external {

    //     vm.startBroadcast();
    //     players.createPlayer(0);
    //     vm.stopBroadcast();

    // }

    uint256 cardPackNumber = 5; 
    uint256 priceCardPack = (1 ether / 1000) + 100; 
    bytes callData = abi.encodeWithSelector(cards.openCardPack.selector, cardPackNumber);
    address avatarAddress = 0x40aCE4e246C61707219aE16eC4771C4D67bF23BC;
    AvatarBasedAccount avatarAccount = AvatarBasedAccount(payable(avatarAddress)); 

    function run() external {
        vm.startBroadcast();
        bytes memory result = avatarAccount.execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result)); 
        console2.log("requestID:", requestId); 
        vm.stopBroadcast();
    } 
}