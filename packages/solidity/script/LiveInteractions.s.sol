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
    Players players = Players(payable(deployedContracts.players()));
    Cards cards = Cards(payable(deployedContracts.cards()));
    Games games = Games(payable(deployedContracts.games()));
    
    // string avatarUri =
    //     "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

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
    address avatarAddress = 0x97C59FaE5ab11B8776550aF48EbaC9D59C9796cD;
    AvatarBasedAccount avatarAccount = AvatarBasedAccount(payable(avatarAddress)); 

    function run() external {
        vm.startBroadcast();
        // players.createPlayer(2);

        // deployedContracts.players().call{value: 1 ether / 10}(""); 
        // deployedContracts.avatarBasedAccounts().call{value: 1 ether / 10}(""); 


        // avatarAddress.call{value: 1 ether / 5}(""); 
        // address(cards).call{value: 1 ether / 5}(""); 
        // players.createPlayer(1);

        bytes memory callData = abi.encodeWithSelector(cards.openCardPack.selector, cardPackNumber);

        avatarAccount.ccipExecute(address(cards), 0, callData, 0);
        vm.stopBroadcast();
    } 
}