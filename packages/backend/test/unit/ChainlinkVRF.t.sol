// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployRegistry} from "@reference/script/DeployRegistry.s.sol";  

contract ChainLinkVRFTest is Test {
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
        DeployRegistry deployerRegistry = new DeployRegistry(); 
        deployerRegistry.run(); 

        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games) = deployerGames.run();

        // need to fund the contract itself for Chainlink VRF - direct payments.  
        vm.deal(address(cards), 1 ether);
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testVRFReturnsWithRandomValue() public { 

      vm.prank(cards.i_owner());
      (uint256 requestId) = cards.requestRandomWords(true);
      console2.log("requestId: ", requestId); 

      vm.roll(100 + block.number); 

      (uint256 paid, bool fullfilled) = cards.s_requests(requestId); 
      console.log("paid: ", paid);
      console.log("fullfilled: ", fullfilled); 
      uint256 randomWord = cards.s_randomWord();
      console.log("randomWord: ", randomWord); 

    }


}