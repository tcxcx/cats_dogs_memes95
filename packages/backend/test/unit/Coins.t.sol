// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Coins} from "../../src/Coins.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployRegistry} from "@erc6551/script/DeployRegistry.s.sol";  

contract CoinsTest is Test {
    uint256 CardPackPrice = 50_000; 
    uint256[] packThresholds = [5, 15, 30, 100]; // £todo what happens after 1000 packs sold? CHECK! 
    uint256[] packCoinAmounts = [500, 100, 25, 1]; 

     /* Type declarations */
    Cards cards;
    Games games;
    Coins coins; 
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
        coins = cards.s_coins();
    }

    function testCoinAllowanceIsGivenWhenOpeningPackOfCards() public {
        // prep
        uint256 cardPackNumber = 1;
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
        uint256 observedAllowance = cards.s_coinAllowance(avatarAccountAddress); 
        vm.assertEq(packCoinAmounts[0], observedAllowance);     
    }

    function testCoinsCanBeMintedByAvatarAccount() public {
        // PREP
        uint256 cardPackNumber = 2;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  
        // 4: open pack of cards. 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        // 5: check if account received allowance. 
        uint256 coinAllowance = cards.s_coinAllowance(avatarAccountAddress); 
        vm.assertEq(packCoinAmounts[0], coinAllowance); 

        // ACT: 
        // 1: mint coins by avatar
        uint256 amountCoinsToMint = 300;  
        // 2: create call data
        bytes memory callData2 = abi.encodeWithSelector(Coins.mintCoins.selector, amountCoinsToMint);
        vm.prank(userOne);
        // 3: call execute at Avatar Based Account. 
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(coins), 0, callData2, 0);
        // 4: check remaining allowance
        uint256 remainingAllowance = coins.getRemainingAllowance(avatarAccountAddress);   

        // ASSERT 
        assert((coinAllowance - amountCoinsToMint) == remainingAllowance); 
    }

    function testCoinsCannotBeMintedByUserAccount() public {
        uint256 amountCoinsToMint = 300;  

        vm.expectRevert(abi.encodeWithSelector(Coins.Coins__OnlyAvatarBasedAccount.selector, userOne)); 
        vm.prank(userOne); 
        coins.mintCoins(amountCoinsToMint);
    }

    function testAccessAllowanceOfCoinsCannotBeMinted() public {
        // PREP
        uint256 cardPackNumber = 2;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  
        // 4: open pack of cards. 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        // 5: check if account received allowance. 
        uint256 coinAllowance = cards.s_coinAllowance(avatarAccountAddress); 
        vm.assertEq(packCoinAmounts[0], coinAllowance); 

        // ACT: 
        // 1: mint coins by avatar
        uint256 amountCoinsToMint = 3000;  
        // 2: create call data
        bytes memory callData2 = abi.encodeWithSelector(Coins.mintCoins.selector, amountCoinsToMint);
        
        vm.prank(userOne);
        // 3: call execute at Avatar Based Account. 
        vm.expectRevert(Coins.Coins__MintExceedsAllowance.selector); 
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(coins), 0, callData2, 0);
    }

    function testCoinAllowanceDecrease() public { 
        // prep
        uint256 cardPackNumber = 1;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        // vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  

        // act: opening pack of cards
        uint256 numberOfPacksToOpen = 125;
        uint256[] memory increasesAllowance = new uint256[](numberOfPacksToOpen); 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        for (uint256 i; i < numberOfPacksToOpen; i++) {
            uint256 allowanceBefore = cards.s_coinAllowance(avatarAccountAddress); 
            vm.prank(userOne);
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
            increasesAllowance[i] = cards.s_coinAllowance(avatarAccountAddress) - allowanceBefore; 
        }

        for (uint256 i; i < numberOfPacksToOpen; i++) {
            console2.log("increase", i, ":", increasesAllowance[i]); 
        }
    }

}