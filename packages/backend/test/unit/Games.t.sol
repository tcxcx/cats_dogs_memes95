// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Coins} from "../../src/Coins.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {VRFV2PlusWrapper_Optimism} from "../../lib/chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapper_Optimism.sol";
import {ExposedVRFCoordinatorV2_5_Optimism} from "../../lib/chainlink/contracts/src/v0.8/vrf/dev/testhelpers/ExposedVRFCoordinatorV2_5_Optimism.sol";
import {IVRFCoordinatorV2Plus} from "../../lib/chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

import {DeployGames} from "../../script/DeployGames.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract GamesTest is Test {
    /* State vars */
    Cards cards;
    Games games;
    Coins coins; 
    HelperConfig helperConfig; 
    Players players;  

    address ownerGames;
    address ownerCards;
 
    uint256 numberOfCardsPerPlayer = 25; 
    uint256[] cardPackIds = [0, 3, 4, 5, 7, 9, 12, 45, 51, 52]; 
    uint256[] cardPackValues = [1, 2, 1, 2, 2, 1, 3, 4, 5, 1]; 

    address[] users; 
    string[] userNames = ["alice", "bob", "claire", "doug", "7cedars", "test"]; 
    mapping(address => address) avatarBasedAccounts;
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    address player0; // avatar based address of users[0] 
    address player1; // avatar based address of users[1] 
    AvatarBasedAccount accountPlayer0; // avatar based account of users[0] 
    AvatarBasedAccount accountPlayer1; // avatar based account of users[1]

    /* Events */
    event DeployedGamesContract(address indexed owner);
    event PlayerEnteredTournament(address indexed playerAccount); 
    event StartedNewTournament(uint256 indexed tournament); 
    event EndedTournament(uint256 indexed tournament); 
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
      for (uint256 i; i < userNames.length; i++) {
          // ... 1: create an address and AvatarBasedAccount 
          users.push(makeAddr(userNames[i]));
          vm.prank(users[i]);
          (, address avatarAccountAddress) = players.createPlayer(avatarUri);  

          vm.prank(ownerGames); 
          cards.transferCards(avatarAccountAddress, cardPackIds, cardPackValues);

          // ... 2: save the AvatarBasedAccountAddress in an array and provide it with funds. 
          avatarBasedAccounts[users[i]] = avatarAccountAddress; 
          vm.deal(avatarBasedAccounts[users[i]], 1 ether);
        }
        
        // ...3: for readability, create object for player and accounts used through this contract.
        player0 = avatarBasedAccounts[users[0]];
        player1 = avatarBasedAccounts[users[1]];
        accountPlayer0 = AvatarBasedAccount(payable(player0)); 
        accountPlayer1 = AvatarBasedAccount(payable(player1)); 

      _; 
    }

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, , ) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games, helperConfig) = deployerGames.run();
        
        coins = Coins(cards.i_coins());
        ownerGames = games.i_owner(); 
        ownerCards = cards.owner(); 

        // need to fund the contract itself for Chainlink VRF - direct payments.  
        vm.deal(address(cards), 100 ether);
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
      address[] memory emptyArray = new address[](0);

      vm.prank(ownerGames); 
      games.startTournament();
      // check if correctly deployed. 
      assert(games.s_statusTournament() == Games.Status.Active); 

      (address[] memory winners, uint256[] memory scores, uint256[] memory rankings ) = games.getRankings();

      // ACT: stop tournament. 
      vm.prank(ownerGames); 
      vm.expectEmit(true, false, false, false);
      emit EndedTournament(expectedTournamentCounter);
      games.stopTournament();
    }

    function testInitialiseGameNotPossibleIfTournamentNotActive() public setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection); 

      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.prank(users[0]);
      vm.expectRevert(); 
      accountPlayer0.execute(address(games), 0, callData, 0);
    }

    function testPlayerCannotInitaliseGameIfDoesNotOwnACardInTheirDeck() public startActiveTournament setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(player0); 
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
      
      vm.prank(users[0]);
      vm.expectRevert(); 
      accountPlayer0.execute(address(games), 0, callData, 0);
    }

    function testInitialiseGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      uint256 nonce = 1; 
      bytes32 gameHash = keccak256(abi.encode(player0, nonce));  
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);

      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.expectEmit(true, false, false, false);
      emit InitialisedGame(player0, nonce);
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // I can assert more state vars, but this should be sufficient. 
      (address playerOne, , , ,) = games.s_games(gameHash); 
      (, , Games.Status status) = games.s_players(player0); 

      assert(playerOne == player0);
      assert(status == Games.Status.Pending);
    }

    function testInitialiseGameNotPossibleByPendingPlayer() public startActiveTournament setupAvatarBasedAccounts {
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);

      //  initialises a game and their status turns to pending... 
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // when they try to initialise a game again, it should revert. 
      vm.prank(users[0]); 
      vm.expectRevert(); 
      accountPlayer0.execute(address(games), 0, callData, 0);
    }

    function testJoinGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 

      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(player0, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // User two joins the game using the nonce and opponent address. 
      collection = cards.getCollection(player1); 
      cardDeck = _createCardDeckFromCollection(collection);
      callData = abi.encodeWithSelector(Games.joinGame.selector, player0, nonce, cardDeck);
      vm.expectEmit(true, false, false, false);
      emit JoinedGame(player1, gameHash);
      vm.prank(users[1]); 
      accountPlayer1.execute(address(games), 0, callData, 0);

      // I can assert more state vars, but this should be sufficient. 
      (address playerOne, address playerTwo, , ,) = games.s_games(gameHash); 
      (, , Games.Status statusOne) = games.s_players(player0); 
      (, , Games.Status statusTwo) = games.s_players(player1); 

      assert(playerOne == player0);
      assert(playerTwo == player1);
      assert(statusOne == Games.Status.Active);
      assert(statusTwo == Games.Status.Active);
    }

    function testCancelGameChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up a game by user one.
      uint256 nonce = 1; 
      
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(player0, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      vm.expectEmit(true, false, false, false);
      emit InitialisedGame(player0, nonce); // to check if it really does get initialised. 
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // and now  cancels the pending game. 
      callData = abi.encodeWithSelector(Games.cancelPendingGame.selector, 1);
      vm.expectEmit(true, false, false, false);
      emit CancelledPendingGame(player0, gameHash); // to check if it really does get initialised. 
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);
      
      // asserting state changes.. 
      (, , , , Games.Status statusGame) = games.s_games(gameHash); 
      (, , Games.Status statusPlayer) = games.s_players(player0); 
      
      assert(statusGame == Games.Status.Cancelled);
      assert(statusPlayer == Games.Status.Idle);
    }

    function testCancelGameOnlyPossibleIfPending() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up an active game by two users.
      uint256 nonce = 1; 

      // first avatar based account joins game.. 
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
      bytes32 gameHash = keccak256(abi.encode(player0, nonce));  
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // second avatar based account joins game.. 
      collection = cards.getCollection(player1); 
      cardDeck = _createCardDeckFromCollection(collection);
      callData = abi.encodeWithSelector(Games.joinGame.selector, player0, nonce, cardDeck);
      vm.expectEmit(true, false, false, false);
      emit JoinedGame(player1, gameHash); // check if really an active game is deployed. 
      vm.prank(users[1]); 
      accountPlayer1.execute(address(games), 0, callData, 0);

      // and now  tries to cancel an active game. 
      callData = abi.encodeWithSelector(Games.cancelPendingGame.selector, 1);
      vm.expectRevert();
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);
    }

    function testPlayerCannotJoinGameIfDoesNotOwnACardInTheirDeck() public startActiveTournament setupAvatarBasedAccounts {
      // Prep: setting up an active game by player one.
      uint256 nonce = 1; 
      uint256[] memory collection = cards.getCollection(player0); 
      uint256[] memory cardDeck = _createCardDeckFromCollection(collection);
 
      bytes memory callData = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeck);
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

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

      callData = abi.encodeWithSelector(Games.joinGame.selector, player0, nonce, mockCardDeck);
      vm.expectRevert();
      vm.prank(users[1]); 
      accountPlayer1.execute(address(games), 0, callData, 0);
    }

    function testCompleteGamewithConsensusWinnerChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      ( , uint256 scoreOneBefore, ) = games.s_players(player0); 
      ( , uint256 scoreTwoBefore, ) = games.s_players(player1);
      
      bytes32 gameHash = _createActiveGame(player0, player1); 

      bytes memory callData = abi.encodeWithSelector(Games.completeGame.selector, 1, player0, player0);
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      // player two calls the completeGame function with the exact same data. 
      vm.expectEmit(true, false, false, false);
      emit CompletedGame(player0, gameHash); // check if really an active game is deployed. 
      vm.prank(users[1]); 
      accountPlayer1.execute(address(games), 0, callData, 0);

      ( ,  , address winner, , Games.Status status) = games.s_games(gameHash);
      ( , uint256 scoreOneAfter, Games.Status statusPlayerOne) = games.s_players(player0); 
      ( , uint256 scoreTwoAfter, Games.Status statusPlayerTwo) = games.s_players(player1);

      assert(status == Games.Status.Completed);
      assert(statusPlayerOne == Games.Status.Completed);
      assert(statusPlayerTwo == Games.Status.Completed);
      assert(scoreOneAfter - scoreOneBefore == 3);
      assert(scoreTwoAfter - scoreTwoBefore == 1);
      assert(winner == player0);
    }

    function testCompleteGamewith_non_ConsensusWinnerChangesStateVarsCorrectly() public startActiveTournament setupAvatarBasedAccounts {
      ( , uint256 scoreOneBefore, ) = games.s_players(player0); 
      ( , uint256 scoreTwoBefore, ) = games.s_players(player1);
      
      bytes32 gameHash = _createActiveGame(player0, player1); 

      bytes memory callData = abi.encodeWithSelector(Games.completeGame.selector, 1, player0, player0);
      vm.prank(users[0]); 
      accountPlayer0.execute(address(games), 0, callData, 0);

      ( ,  , , , Games.Status statusPaused) = games.s_games(gameHash);
      assert(statusPaused == Games.Status.Paused);

      // player two calls the completeGame function with the exact same data. 
      bytes memory callData2 = abi.encodeWithSelector(Games.completeGame.selector, 1, player0, player1); // note: different winner than at 
      vm.expectEmit(true, false, false, false);
      emit CompletedGame(address(1), gameHash); // check if really an active game is deployed. 
      vm.prank(users[1]); 
      accountPlayer1.execute(address(games), 0, callData2, 0);

      ( ,  , address winner, , Games.Status status) = games.s_games(gameHash);
      ( , uint256 scoreOneAfter, Games.Status statusPlayerOne) = games.s_players(player0); 
      ( , uint256 scoreTwoAfter, Games.Status statusPlayerTwo) = games.s_players(player1);

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
      
      vm.prank(users[0]); 
      avatarBasedAccountA.execute(address(games), 0, callDataA, 0);
      
      // PlayerB joins the pending game
      uint256[] memory cardDeckB = _createCardDeckFromCollection(
        cards.getCollection(playerB)
        ); 
      bytes memory callDataB = abi.encodeWithSelector(Games.joinGame.selector, player0, nonce, cardDeckB);
      
      vm.prank(users[1]); 
      avatarBasedAccountB.execute(address(games), 0, callDataB, 0);
    
    }
}