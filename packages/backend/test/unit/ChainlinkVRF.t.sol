// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
// import {DeployRegistry} from "@reference/script/DeployRegistry.s.sol";  

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
      uint256 cardPackNumber = 1; 
        // 1: create Avatar Based Account
      vm.prank(userOne);
      (, address avatarAccountAddress) = players.createPlayer(avatarUri);
      // 2: get price pack
      uint256 priceCardPack = cards.s_priceCardPack();  
      // 3: give userOne funds. 

      vm.deal(avatarAccountAddress, 1 ether);  
      // 4: open pack of cards. 
      bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
      vm.prank(userOne);
      AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);

      // vm.prank(cards.i_owner());
      uint256 requestId = cards.lastRequestId(); 
      console2.log("lastrequestId: ", requestId);
      vm.roll(100 + block.number); 

      (uint256 paid, bool fullfilled) = cards.s_requests(requestId); 
      console.log("paid: ", paid);
      console.log("fullfilled: ", fullfilled);
    }


}