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
import {DeployRegistry} from "@reference/script/DeployRegistry.s.sol";  

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
    event CompletedGame(address indexed winner, bytes32 indexed gameHash);  

    ///////////////////////////////////////////////
    ///                Modifiers                ///
    ///////////////////////////////////////////////
    modifier startActiveTournament() {
      vm.prank(ownerGames); 
      games.startTournament();
      
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
      uint256 expectedTournamentCounter = 1; 

      // checking if event is correctly emitted. 
      vm.expectEmit(true, false, false, false);
      emit StartedNewTournament(expectedTournamentCounter);

      vm.prank(ownerGames); 
      games.startTournament();

      // checking if state vars are correctly set.
      assert(games.s_statusTournament() == Games.Status.Active); 
    }

    function testStopTournamentWithoutGamesIsPossible() public {
      uint256 expectedTournamentCounter = 1; 

      vm.prank(ownerGames); 
      games.startTournament();
      // check if correctly deployed. 
      assert(games.s_statusTournament() == Games.Status.Active); 

      // ACT: stop tournament. 
      vm.expectEmit(true, false, false, false);
      emit EndedTournament(expectedTournamentCounter, address(0), address(0), address(0));
      vm.prank(ownerGames); 
      games.stopTournament();
    }

    function testInitialiseGameNotPossibleIfTournamentNotActive() public setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection); 

      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.prank(userOne);
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testPlayerCannotInitaliseGameIfDoesNotOwnACardInTheirDeck() public startActiveTournament setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = new uint256[](10); 
      for (uint256 i; i < collection.length; i++) {
        if (collection[i] == 0) {
          for (uint256 j; j < 10; j++) {
            cardDeck[j] = i;
          }
          break; 
        } 
      }
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.prank(userOne);
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testInitialiseGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      uint256 nonce = 1; 
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);

      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.expectEmit(true, false, false, false);
      emit InitialisedGame(avatarAccountAddressOne, nonce);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // I can assert more state vars, but this should be sufficient. 
      (address playerOne, , , ,) = games.s_games(gameHash); 
      (, , Games.Status status) = games.s_players(avatarAccountAddressOne); 

      assert(playerOne == avatarAccountAddressOne);
      assert(status == Games.Status.Pending);
    }

    function testInitialiseGameNotPossibleByNonRegisteredPlayer() public startActiveTournament setupAvatarBasedAccounts {
        uint256[] memory cardDeck = new uint256[](10); 
        for (uint256 i; i < 10; i++) {
          cardDeck[i] == i; 
        }

        vm.prank(userOne);
        vm.expectRevert();
        games.initialiseGame(cardDeck);
    }

    function testInitialiseGameNotPossibleByPendingPlayer() public startActiveTournament setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);

      // userOne initialises a game and their status turns to pending... 
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // when they try to initialise a game again, it should revert. 
      vm.prank(userOne); 
      vm.expectRevert(); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);
    }

    function testJoinGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 

      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // User two joins the game using the nonce and opponent address. 
      collection = cards.getCollection(avatarAccountAddressTwo); 
      cardDeck = _createCardDeckFromCollection(collection);
      callData = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce, cardDeck);
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

    function testCancelGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 
      
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
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

    function testCancelGameOnlyPossibleIfPending() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up an active game by two users.
      uint256 nonce = 1; 

      // first avatar based account joins game.. 
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(avatarAccountAddressOne, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // second avatar based account joins game.. 
      collection = cards.getCollection(avatarAccountAddressTwo); 
      cardDeck = _createCardDeckFromCollection(collection);
      callData = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce, cardDeck);
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

    function testPlayerCannotJoinGameIfDoesNotOwnACardInTheirDeck() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up an active game by player one.
      uint256 nonce = 1; 
      uint256[] memory collection = cards.getCollection(avatarAccountAddressOne); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
 
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // And here user two calls to join game with cards they don't own. 
      uint256[] memory mockCardDeck = new uint256[](10); 
      for (uint256 i; i < collection.length; i++) {
        if (collection[i] == 0) {
          for (uint256 j; j < 10; j++) {
            mockCardDeck[j] = i;
          }
          break; 
        } 
      }

      callData = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce, mockCardDeck);
      vm.expectRevert();
      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData, 0);
    }

    function testCompleteGamewithConsensusWinnerChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      ( , uint256 scoreOneBefore, ) = games.s_players(avatarAccountAddressOne); 
      ( , uint256 scoreTwoBefore, ) = games.s_players(avatarAccountAddressTwo);
      
      bytes32 gameHash = _createActiveGame(avatarAccountAddressOne, avatarAccountAddressTwo); 

      bytes memory callData = abi.encodeWithSelector(Games.completeGame.selector, 1, avatarAccountAddressOne, avatarAccountAddressOne);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      // player two calls the completeGame function with the exact same data. 
      vm.expectEmit(true, false, false, false);
      emit CompletedGame(avatarAccountAddressOne, gameHash); // check if really an active game is deployed. 
      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData, 0);

      ( ,  , address winner, , Games.Status status) = games.s_games(gameHash);
      ( , uint256 scoreOneAfter, Games.Status statusPlayerOne) = games.s_players(avatarAccountAddressOne); 
      ( , uint256 scoreTwoAfter, Games.Status statusPlayerTwo) = games.s_players(avatarAccountAddressTwo);

      assert(status == Games.Status.Completed);
      assert(statusPlayerOne == Games.Status.Completed);
      assert(statusPlayerTwo == Games.Status.Completed);
      assert(scoreOneAfter - scoreOneBefore == 3);
      assert(scoreTwoAfter - scoreTwoBefore == 1);
      assert(winner == avatarAccountAddressOne);
    }

    function testCompleteGamewith_non_ConsensusWinnerChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      ( , uint256 scoreOneBefore, ) = games.s_players(avatarAccountAddressOne); 
      ( , uint256 scoreTwoBefore, ) = games.s_players(avatarAccountAddressTwo);
      
      bytes32 gameHash = _createActiveGame(avatarAccountAddressOne, avatarAccountAddressTwo); 

      bytes memory callData = abi.encodeWithSelector(Games.completeGame.selector, 1, avatarAccountAddressOne, avatarAccountAddressOne);
      vm.prank(userOne); 
      avatarBasedAccountOne.execute(address(games), 0, callData, 0);

      ( ,  , , , Games.Status statusPaused) = games.s_games(gameHash);
      assert(statusPaused == Games.Status.Paused);

      // player two calls the completeGame function with the exact same data. 
      bytes memory callData2 = abi.encodeWithSelector(Games.completeGame.selector, 1, avatarAccountAddressOne, avatarAccountAddressTwo); // note: different winner than at userOne
      vm.expectEmit(true, false, false, false);
      emit CompletedGame(address(1), gameHash); // check if really an active game is deployed. 
      vm.prank(userTwo); 
      avatarBasedAccountTwo.execute(address(games), 0, callData2, 0);

      ( ,  , address winner, , Games.Status status) = games.s_games(gameHash);
      ( , uint256 scoreOneAfter, Games.Status statusPlayerOne) = games.s_players(avatarAccountAddressOne); 
      ( , uint256 scoreTwoAfter, Games.Status statusPlayerTwo) = games.s_players(avatarAccountAddressTwo);

      assert(status == Games.Status.Completed);
      assert(statusPlayerOne == Games.Status.Completed);
      assert(statusPlayerTwo == Games.Status.Completed);
      assert(scoreOneAfter - scoreOneBefore == 0);
      assert(scoreTwoAfter - scoreTwoBefore == 0);
      assert(winner == address(1));
    }

    ///////////////////////////////////////////////
    ///           Helper Function               ///
    ///////////////////////////////////////////////
    function _createCardDeckFromCollection(uint256[] memory collection) internal pure returns (uint256[] memory cardDeck) {   
      // picks 1 of each of the first ten cards owned to create a deck. 
      // if there are not enough types of cards in the deck, it reverts. 
      uint256 index; 
      uint256[] memory deck = new uint256[](10); 

      for (uint256 i; i < collection.length; i++) {
        if (collection[i] > 0 && index < 10) { 
          deck[index] = i; 
          index++;  
        }
      }

      return deck; 
    }

    function _createActiveGame(address playerA, address playerB) internal returns (bytes32 gameHash) {
      // NB: for now Player has to be accountOne, playerB has to be account B. Will fix later. 
      
      // prep 
      uint256 nonce = 1; 
      gameHash = keccak256(abi.encode(playerA, nonce)); 
      AvatarBasedAccount avatarBasedAccountA = AvatarBasedAccount(payable(playerA)); 
      AvatarBasedAccount avatarBasedAccountB = AvatarBasedAccount(payable(playerB)); 
      
      // PlayerA initialises a game
      uint256[] memory cardDeckA = _createCardDeckFromCollection(
        cards.getCollection(playerA)
        );
      bytes memory callDataA = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeckA);
      
      vm.prank(userOne); 
      avatarBasedAccountA.execute(address(games), 0, callDataA, 0);
      
      // PlayerB joins the pending game
      uint256[] memory cardDeckB = _createCardDeckFromCollection(
        cards.getCollection(playerB)
        ); 
      bytes memory callDataB = abi.encodeWithSelector(Games.joinGame.selector, avatarAccountAddressOne, nonce, cardDeckB);
      
      vm.prank(userTwo); 
      avatarBasedAccountB.execute(address(games), 0, callDataB, 0);
    
    }
}