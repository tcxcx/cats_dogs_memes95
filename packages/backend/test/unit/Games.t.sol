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

contract GamesTest is Test {
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

    modifier setupAvatarBasedAccounts() {
      uint256 numberOfPacks = 5; 
      uint256 priceCardPack = cards.s_priceCardPack();  

      // avatar account one 
      vm.startPrank(userOne);
      (, avatarAccountAddressOne) = players.createPlayer(avatarUri); 
      vm.deal(avatarAccountAddressOne, 1 ether);

      avatarBasedAccountOne = AvatarBasedAccount(payable(avatarAccountAddressOne)); 
      bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
      
      for (uint256 i; i < numberOfPacks; i++) {
        avatarBasedAccountOne.execute(address(cards), priceCardPack, callData, 0);
      }
      vm.stopPrank();

      // avatar account two 
      vm.warp(block.timestamp + 50);
      vm.roll(block.number + 5); 


      vm.startPrank(userTwo);
      (, avatarAccountAddressTwo) = players.createPlayer(avatarUri); 
      vm.deal(avatarAccountAddressTwo, 1 ether);

      avatarBasedAccountTwo = AvatarBasedAccount(payable(avatarAccountAddressTwo)); 
      callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
      
      for (uint256 i; i < numberOfPacks; i++) {
        avatarBasedAccountTwo.execute(address(cards), priceCardPack, callData, 0);
      }
      vm.stopPrank();

      // avatar account three
      vm.warp(block.timestamp + 50);
      vm.roll(block.number + 5); 

      vm.startPrank(userThree);
      (, avatarAccountAddressThree) = players.createPlayer(avatarUri); 
      vm.deal(avatarAccountAddressThree, 1 ether);

      avatarBasedAccountThree = AvatarBasedAccount(payable(avatarAccountAddressThree)); 
      callData = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
      
      for (uint256 i; i < numberOfPacks; i++) {
        avatarBasedAccountThree.execute(address(cards), priceCardPack, callData, 0);
      }
      vm.stopPrank();

      _; 
    }

    modifier enterPlayersIntoTournament() {
      // player one 
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[10] memory cardDeck = _createCardDeckFromCollection(collection); 
      bytes memory callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);

      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // player two 
      collection = cards.getCollection(avatarAccountAddressTwo); 
      cardDeck = _createCardDeckFromCollection(collection); 
      callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);

      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData, 0);

      // player three 
      collection = cards.getCollection(avatarAccountAddressThree); 
      cardDeck = _createCardDeckFromCollection(collection); 
      callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);

      vm.prank(userThree); 
      avatarBasedAccountThree.execute(address(games), 0, callData, 0);

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

    function testEnterPlayerInTournamentSavesCardDeck() public startActiveTournament setupAvatarBasedAccounts {
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

    function testEnterPlayerInTournamentNotPossibleIfTournamentNotActive() public setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[10] memory cardDeck = _createCardDeckFromCollection(collection); 

      bytes memory callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);
      
      vm.prank(userOne);
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testPlayerCannotEnterTournamentIfDoesNotOwnACardInTheirDeck() public startActiveTournament setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = new uint256[](10); 
      for (uint256 i; i < collection.length; i++) {
        if (collection[i] == 0) {
          cardDeck[0] = i;
          cardDeck[1] = i;
          cardDeck[2] = i;
          cardDeck[3] = i;
          cardDeck[4] = i;
          cardDeck[5] = i;
          cardDeck[6] = i;
          cardDeck[7] = i;
          cardDeck[8] = i;
          cardDeck[9] = i;
          break; 
        } 
      }
      bytes memory callData = abi.encodeWithSelector(Games.enterPlayerInTournament.selector, cardDeck);
      
      vm.prank(userOne);
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testInitialiseGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
      uint256 nonceTemp = 1; 
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonceTemp));  

      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector);
      
      vm.expectEmit(true, false, false, false);
      emit InitialisedGame(avatarAccountAddressOne, nonceTemp);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // I can assert more state vars, but this should be sufficient. 
      (address playerOne, , , ,) = games.s_games(gameHash); 
      (, , Games.Status status) = games.s_players(avatarAccountAddressOne); 

      assert(playerOne == avatarAccountAddressOne);
      assert(status == Games.Status.Pending);
    }

    function testInitialiseGameNotPossibleByNonRegisteredPlayer() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
        vm.prank(userOne);
        vm.expectRevert();
        games.initialiseGame();
    }

    function testInitialiseGameNotPossibleByPendingPlayer() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector);

      // userOne initialises a game and their status turns to pending... 
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // when they try to initialise a game again, it should revert. 
      vm.prank(userOne); 
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testJoinGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // User two joins the game using the nonce and opponent address. 
      callData = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce);
      vm.expectEmit(true, false, false, false);
      emit JoinedGame(avatarAccountAddressTwo, gameHash);
      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData, 0);

      // I can assert more state vars, but this should be sufficient. 
      (address playerOne, address playerTwo, , ,) = games.s_games(gameHash); 
      (, , Games.Status statusOne) = games.s_players(avatarAccountAddressOne); 
      (, , Games.Status statusTwo) = games.s_players(avatarAccountAddressTwo); 

      assert(playerOne == avatarAccountAddressOne);
      assert(playerTwo == avatarAccountAddressTwo);
      assert(statusOne == Games.Status.Active);
      assert(statusTwo == Games.Status.Active);
    }

    function testCancelGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector);
      vm.expectEmit(true, false, false, false);
      emit InitialisedGame(avatarAccountAddressOne, nonce); // to check if it really does get initialised. 
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // and now userOne cancels the pending game. 
      callData = abi.encodeWithSelector(Games.cancelPendingGame.selector, 1);
      vm.expectEmit(true, false, false, false);
      emit CancelledPendingGame(avatarAccountAddressOne, gameHash); // to check if it really does get initialised. 
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
      
      // asserting state changes.. 
      (, , , , Games.Status statusGame) = games.s_games(gameHash); 
      (, , Games.Status statusPlayer) = games.s_players(avatarAccountAddressOne); 
      
      assert(statusGame == Games.Status.Cancelled);
      assert(statusPlayer == Games.Status.Idle);
    }

    function testCancelGameOnlyPossibleIfPending() public startActiveTournament setupAvatarBasedAccounts enterPlayersIntoTournament {
      // Prep: setting up an active game by two users.
      uint256 nonce = 1; 
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      callData = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce);
      vm.expectEmit(true, false, false, false);
      emit JoinedGame(avatarAccountAddressTwo, gameHash); // check if really an active game is deployed. 
      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData, 0);

      // and now userOne tries to cancel an active game. 
      callData = abi.encodeWithSelector(Games.cancelPendingGame.selector, 1);
      vm.expectRevert();
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
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
        if (collection[i] > 0 && index < 10) { 
          cardDeck[index] = i; 
          index++;  
        }
      }

      return cardDeck; 
    }


}