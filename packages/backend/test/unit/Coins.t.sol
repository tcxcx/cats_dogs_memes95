// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol"; 
import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Coins} from "../../src/Coins.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployCards} from "../../script/DeployCards.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployRegistry} from "@erc6551/script/DeployRegistry.s.sol";  

contract CoinsTest is Test {
    Cards cards;
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

        DeployCards deployerCards = new DeployCards();
        cards = deployerCards.run();
    }

    function testCoinsAreMintedToAvatarWhenOpeningPackOfCards() public {
        // prep
        uint256 cardPackNumber = 1;
        uint256 MAX_FOREVER_SUPPLY = 42 * (10 ** 18); 
        uint256 PERCENT_MINT = 5;
        uint256 DECIMALS = 100;
        uint256 expectedCoinsToMint = MAX_FOREVER_SUPPLY / DECIMALS * PERCENT_MINT;
        Coins coinsContract = cards.s_coins(); 

        console2.log("expectedCoinsToMint", expectedCoinsToMint); 
        
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  

        // act: opening pack of cards
        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);

        // assert
        uint256 observedMintedCoins = coinsContract.balanceOf(avatarAccountAddress); 
        vm.assertEq(expectedCoinsToMint, observedMintedCoins);     
    }

    function testCoinsCannotBeMintedIfNotOpenignPackOfCards() public {
      Coins coinsContract = cards.s_coins(); 

      vm.prank(userOne);
      vm.expectRevert(Coins.Coins__MintNotAllowed.selector); 
      coinsContract.mintCoinShare(userOne); 
    }

    function testCoinsMintedDecreasesWithEveryMint() public { 
        // prep
        uint256 cardPackNumber = 1;
        Coins coinsContract = cards.s_coins(); 
        
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  

        // act: opening pack of cards
        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 increase1 = coinsContract.balanceOf(avatarAccountAddress); 
        
        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 increase2 = coinsContract.balanceOf(avatarAccountAddress) - increase1; 

        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 increase3 = coinsContract.balanceOf(avatarAccountAddress) - (increase1 + increase2); 

        console2.log("increase1:", increase1); 
        console2.log("increase2:", increase2); 
        console2.log("increase3:", increase3); 
        
        assert(increase1 > increase2);
        assert(increase2 > increase3); 
    }

}