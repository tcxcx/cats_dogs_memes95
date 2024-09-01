// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployGames} from "../../script/DeployGames.s.sol"; 
// import {DeployRegistry} from "@reference/script/DeployRegistry.s.sol";  

contract AvatarBasedAccountTest is Test {
    /* Type declarations */
    Cards cards;
    Games games;
    Players players;  
    AvatarBasedAccount avatarBasedAccount;

    address userOne = makeAddr("UserOne"); 
    address userTwo = makeAddr("UserTwo"); 
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";
  
    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // deploying the ERC-6551 registry... 
        // DeployRegistry deployerRegistry = new DeployRegistry(); 
        // deployerRegistry.run(); 

        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games) = deployerGames.run();
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////
    function testAvatarBasedAccountCanExecuteFunction() public {
        // setup:  
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(avatarUri);
        
        bytes memory callData = abi.encodeWithSelector(Cards.getCollection.selector, userOne);

        vm.prank(userOne);
        bytes memory result = AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), 0, callData, 0);

        // better to request cards -- implement in a bit. 
    }

    function testAvatarBasedAccountRevertsIfNotOwned() public {
              // setup:  
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(avatarUri);
        
        bytes memory callData = abi.encodeWithSelector(Cards.getCollection.selector, userOne);

        vm.prank(userTwo);
        vm.expectRevert('Invalid signer'); 
        bytes memory result = AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), 0, callData, 0);

        // console.log("return value:", collection[0]);
    }



}
