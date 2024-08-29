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
    /* State vars */
    Cards cards;
    Games games;
    Coins coins; 
    Players players;  
    AvatarBasedAccount avatarBasedAccountOne;
    AvatarBasedAccount avatarBasedAccountTwo;
    AvatarBasedAccount avatarBasedAccountThree;
    address avatarAccountAddressOne;
    address avatarAccountAddressTwo;
    address avatarAccountAddressThree;

    address ownerGames;
    address ownerCards;

    uint256 CardPackPrice = 50_000; 
    uint256[] packThresholds = [5, 15, 30, 100]; // £todo what happens after 1000 packs sold? CHECK! 
    uint256[] packCoinAmounts = [500, 100, 25, 1];  

    address userOne = makeAddr("UserOne"); 
    address userTwo = makeAddr("UserTwo"); 
    address userThree = makeAddr("UserThree"); 
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    /* Events */
    event DeployedGamesContract(address indexed owner);
    event PlayerEnteredTournament(address indexed playerAccount); 
    event StartedNewTournament(uint256 indexed tournament); 
    event EndedTournament(uint256 indexed tournament, address indexed winner, address second, address third); 
    event InitialisedGame(address indexed playerOne, uint256 indexed nonce); 
    event JoinedGame(address indexed playerTwo, bytes32 indexed gameHash);  
    event CancelledPendingGame(address indexed playerOne, bytes32 indexed gameHash); 

    ///////////////////////////////////////////////
    ///                Modifiers                ///
    ///////////////////////////////////////////////
    modifier startActiveTournament() {
      uint256 firstPrice =  5000; 
      uint256 secondPrice = 2500; 
      uint256 thirdPrice =  1000; 
      
      vm.prank(ownerGames); 
      games.startTournament(firstPrice, secondPrice, thirdPrice);
      
      _; 
    }

    modifier setupAvatarBasedAccountOne() {
        uint256 numberOfPacks = 5; 
        uint256 priceCardPack = cards.s_priceCardPack();  

        vm.startPrank(userOne);
        (, avatarAccountAddressOne) = players.createPlayer(avatarUri); 
        vm.deal(avatarAccountAddressOne, 1 ether);

        avatarBasedAccountOne = AvatarBasedAccount(payable(avatarAccountAddressOne)); 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
        
        for (uint256 i; i < numberOfPacks; i++) {
          avatarBasedAccountOne.execute(address(cards), priceCardPack, callData, 0);
        }
        vm.stopPrank();
      _; 
    }

    modifier setupAvatarBasedAccountTwo() {
        vm.warp(block.timestamp + 50);
        vm.roll(block.number + 5); 

        uint256 numberOfPacks = 5; 
        uint256 priceCardPack = cards.s_priceCardPack();  

        vm.startPrank(userTwo);
        (, avatarAccountAddressTwo) = players.createPlayer(avatarUri); 
        vm.deal(avatarAccountAddressTwo, 1 ether);

        avatarBasedAccountTwo = AvatarBasedAccount(payable(avatarAccountAddressTwo)); 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
        
        for (uint256 i; i < numberOfPacks; i++) {
          avatarBasedAccountTwo.execute(address(cards), priceCardPack, callData, 0);
        }
        vm.stopPrank();
      _; 
    }

    modifier setupAvatarBasedAccountThree() {
        vm.warp(block.timestamp + 50);
        vm.roll(block.number + 5); 

        uint256 numberOfPacks = 5; 
        uint256 priceCardPack = cards.s_priceCardPack();

        vm.startPrank(userThree);
        (, avatarAccountAddressThree) = players.createPlayer(avatarUri); 
        vm.deal(avatarAccountAddressThree, 1 ether);

        avatarBasedAccountThree = AvatarBasedAccount(payable(avatarAccountAddressThree)); 
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
        
        for (uint256 i; i < numberOfPacks; i++) {
          avatarBasedAccountThree.execute(address(cards), priceCardPack, callData, 0);
        }
        vm.stopPrank();
      _; 
    }

  
    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // deploying the ERC-6551 registry... 
        DeployRegistry deployerRegistry = new DeployRegistry(); 
        deployerRegistry.run(); 

        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccountOne) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games) = deployerGames.run();
        
        coins = Coins(cards.i_coins());
        ownerGames = games.i_owner(); 
        ownerCards = cards.i_owner(); 
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////
    function testGamesContractDeploysCorrectly() public view {
      address owner = games.i_owner();
      address cardsAddress = games.i_cards();

      assert(owner != address(0));
      assert(cardsAddress == address(cards)); 
    }

    function testStartTournamentSetPricesAndStatusCorrectly() public {
      uint256 firstPrice =  5000; 
      uint256 secondPrice = 2500; 
      uint256 thirdPrice =  1000; 
      uint256 expectedTournamentCounter = 1; 

      // checking if event is correctly emitted. 
      vm.expectEmit(true, false, false, false);
      emit StartedNewTournament(expectedTournamentCounter);

      vm.prank(ownerGames); 
      games.startTournament(firstPrice, secondPrice, thirdPrice);

      // checking if state vars are correctly set. 
      assert(games.s_prices(0) == firstPrice); 
      assert(games.s_prices(1) == secondPrice);
      assert(games.s_prices(2) == thirdPrice); 
      assert(games.s_statusTournament() == Games.Status.Active); 
    }

    function testStopTournamentWithoutGamesIsPossible() public {
      uint256 firstPrice =  5000; 
      uint256 secondPrice = 2500; 
      uint256 thirdPrice =  1000; 
      uint256 expectedTournamentCounter = 1; 

      vm.prank(ownerGames); 
      games.startTournament(firstPrice, secondPrice, thirdPrice);
      // check if correctly deployed. 
      assert(games.s_statusTournament() == Games.Status.Active); 

      // ACT: stop tournament. 
      vm.expectEmit(true, false, false, false);
      emit EndedTournament(expectedTournamentCounter, address(0), address(0), address(0));
      vm.prank(ownerGames); 
      games.stopTournament();
    }

    function testEnterPlayerInTournamentSavesCardDeck() public startActiveTournament setupAvatarBasedAccountOne {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[10] memory cardDeck = _createCardDeckFromCollection(collection); 

      bytes memory callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      (uint256 tournament, uint256 score, Games.Status status) = games.s_players(avatarAccountAddressOne); 

      assert(games.s_PlayersInTournament(0) == avatarAccountAddressOne); 
      assert(tournament == 1); 
      assert(score == 0);
      assert(status == Games.Status.Idle);
    }

    function testEnterPlayerInTournamentNotPossibleIfTournamentNotActive() public setupAvatarBasedAccountOne {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[10] memory cardDeck = _createCardDeckFromCollection(collection); 

      bytes memory callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);
      
      vm.prank(userOne);
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testInitialiseGameChangesStateVarsCorrectly() public {
      // £todo. 
      // assert s_games, s_players & s_nonce, test emit. 
    }

    function testInitialiseGameNotPossibleByNonRegisteredPlayer() public {
      // £todo. 
    }

    function testInitialiseGameNotPossibleByIdleRegisteredPlayer() public {
      // £todo. 
    }

    function testJoinGameChangesStateVarsCorrectly() public {
      // £todo. 
      // assert s_games, s_players & test emit. 
    }

    function testCancelGameChangesStateVarsCorrectly() public {
      // £todo. 
      // assert s_games, s_players & test emit. 
    }

    function testCancelGameOnlyPossibleIfPending() public {
      // £todo. 
      // assert s_games, s_players & test emit. 
    }

    function testExitGamewithConsensusWinnerChangesStateVarsCorrectly() public {
    //   // £todo. 
    //   // assert... a whole bunch. 
    }

    function testExitGamewith_non_ConsensusWinnerChangesStateVarsCorrectly() public {
    //   // £todo. 
    //   // assert... a whole bunch. 
    }

    function testStopTournamentWithMultipleGamesAndPlayersChagesStateVarsCorrectly() public {
      // £todo
    }

    function testStopTournamentWithOnlyTwoPlayersIsPossible() public {
      // £todo
    }

    ///////////////////////////////////////////////
    ///           Helper Function               ///
    ///////////////////////////////////////////////
    function _createCardDeckFromCollection(uint256[] memory collection) internal pure returns (uint256[10] memory cardDeck) {   
      // picks 1 of each of the first ten cards owned to create a deck. 
      // if there are not enough types of cards in the deck, it reverts. 
      uint256 index; 

      for (uint256 i; i < collection.length; i++) {
        if (collection[i] > 1) { 
          cardDeck[index] = i; 
          index++;  
        }
      }

      return cardDeck; 
    }


}