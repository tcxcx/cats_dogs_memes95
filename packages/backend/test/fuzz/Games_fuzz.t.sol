// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";
// import {DeployRegistry} from "@reference/script/DeployRegistry.s.sol";  

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Coins} from "../../src/Coins.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  


contract GamesTest is Test {
    /* State vars */
    Cards cards;
    Games games;
    Coins coins; 
    Players players;  

    address ownerGames;
    address ownerCards;
    address avatarBasedAddressA;
    address avatarBasedAddressB;
    AvatarBasedAccount avatarBasedAccountA;
    AvatarBasedAccount avatarBasedAccountB;
    address[2] winnerAddress; 
    uint256 nonce = 1;
    
    address[] users; 
    string[] userNames = ["alice", "bob", "claire", "doug", "7cedars", "test"]; 
    mapping(address => address) avatarBasedAccounts;
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ"; 
    
    uint256 CardPackPrice = 50_000; 
    uint256[] packThresholds = [5, 15, 30, 100]; // £todo what happens after 1000 packs sold? CHECK! 
    uint256[] packCoinAmounts = [500, 100, 25, 1];  
    mapping(address => uint256) loggedScores;

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
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // deploying other necessary contracts 
        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, , ) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games, ) = deployerGames.run();
        
        coins = Coins(cards.i_coins());
        ownerGames = games.i_owner(); 
        ownerCards = cards.owner(); 

        // start a tournament
        vm.prank(ownerGames); 
        games.startTournament();

        // create Avatar Based Accounts
        uint256 priceCardPack = cards.s_priceCardPack();  
        uint256 numberOfPacks = 5;

        for (uint256 i; i < userNames.length; i++) {
          vm.warp(block.timestamp + 50);
          vm.roll(block.number + 5); 

          // ... 1: create an address and AvatarBasedAccount 
          users.push(makeAddr(userNames[i]));
          vm.prank(users[i]);
          (, address avatarAccountAddress) = players.createPlayer(avatarUri);  

          // ... 2: save the AvatarBasedAccountAddress in an array and provide it with funds. 
          avatarBasedAccounts[users[i]] = avatarAccountAddress; 
          vm.deal(avatarBasedAccounts[users[i]], 1 ether);

          // ... 3: open a number of cardPacks to give cards to the Avatar Based Account. 
          bytes memory callDataOpenPack = abi.encodeWithSelector(Cards.openCardPack.selector, 1);
          vm.startPrank(users[i]);
            for (uint256 j; j < numberOfPacks; j++) {
              AvatarBasedAccount(payable(avatarBasedAccounts[users[i]])).execute(address(cards), priceCardPack, callDataOpenPack, 0);
            }
          vm.stopPrank();
        }
    }

    ///////////////////////////////////////////////
    ///                 Fuzz Test               ///
    ///////////////////////////////////////////////
    function testFuzz_GamesResultInCorrectRewardPayouts(uint256 randomNumber, uint256 numberOfGames) public {
      numberOfGames = bound(numberOfGames, 5, 15);
      uint256 numberOfPlayers = users.length; 
    
      for (uint256 i; i < numberOfGames; i++) {
        uint256 index = uint256((randomNumber + i) % numberOfPlayers);   // note that >> this sign moves the byte along a position, and hence change the resulting number. 
        // uint256 index2 = unchecked 
        console2.log("index:", index);  
        address playerA = users[index];
        address playerB = index == (numberOfPlayers - 1) ? users[index - 1] : users[index + 1];   
        console2.log("playerA: ", playerA);
        console2.log("playerB: ", playerB);
    
        uint256 winnerA = uint256(randomNumber >> (i + 3)) % 2;  // 0 or 1 
        uint256 winnerB = winnerA; // always agree on winner. 
        console2.log("winnerA: ", winnerA);
        console2.log("winnerB: ", winnerB);

        _runGame(playerA, playerB, winnerA, winnerB);

      }

      (address[] memory avatars, 
       uint256[] memory scores, 
       uint256[] memory rankings) = games.getRankings();

      // and stop tournament.
      vm.prank(ownerCards); 
      games.stopTournament(); 

      // do asserts later. 

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

    function _runGame(address playerA, address playerB, uint256 winnerA, uint256 winnerB) internal returns (address winner) { 
      // Create an active game
      // prep 
      avatarBasedAddressA = avatarBasedAccounts[playerA]; 
      avatarBasedAddressB = avatarBasedAccounts[playerB]; 
      console2.log("avatarBasedAddressA: ", avatarBasedAddressA); 
      console2.log("avatarBasedAddressB: ", avatarBasedAddressB); 
      winnerAddress[0] = avatarBasedAddressA; 
      winnerAddress[1] = avatarBasedAddressB; 

      nonce = games.s_nonce(); 
      bytes32 gameHash = keccak256(abi.encode(avatarBasedAddressA, nonce)); 
      avatarBasedAccountA = AvatarBasedAccount(payable(avatarBasedAddressA)); 
      avatarBasedAccountB = AvatarBasedAccount(payable(avatarBasedAddressB)); 
      
      // PlayerA initialises a game
      uint256[] memory cardDeckA = _createCardDeckFromCollection(
        cards.getCollection(avatarBasedAddressA)
        );
      bytes memory callDataA = abi.encodeWithSelector(Games.initialiseGame.selector, cardDeckA);
      
      vm.prank(playerA); 
      avatarBasedAccountA.execute(address(games), 0, callDataA, 0);

      // (, , , , Games.Status status0 ) = games.s_games(gameHash);  
      // assert(status0 == Games.Status.Pending);
      // console2.log("status game: ", uint256(status0)); 
      
      // PlayerB joins the pending game
      uint256[] memory cardDeckB = _createCardDeckFromCollection(
        cards.getCollection(avatarBasedAddressB)
        ); 
      bytes memory callDataB = abi.encodeWithSelector(Games.joinGame.selector, avatarBasedAddressA, nonce, cardDeckB);
      
      vm.prank(playerB); 
      avatarBasedAccountB.execute(address(games), 0, callDataB, 0);

      // (, , , , Games.Status status1 ) = games.s_games(gameHash);  
      // assert(status1 == Games.Status.Active);
     
      // PlayerA completes the game
      bytes memory callData = abi.encodeWithSelector(Games.completeGame.selector, nonce, avatarBasedAddressA, winnerAddress[winnerA]);
      vm.prank(playerA); 
      avatarBasedAccountA.execute(address(games), 0, callData, 0);

      // (, , , , Games.Status status2 ) = games.s_games(gameHash);  
      // assert(status2 == Games.Status.Paused);

      // player B calls the completeGame function. 
      bytes memory callData2 = abi.encodeWithSelector(Games.completeGame.selector, nonce, avatarBasedAddressA, winnerAddress[winnerB]); // note: different winner than at userOne
      vm.prank(playerB); 
      avatarBasedAccountB.execute(address(games), 0, callData2, 0);

      // (, , , , Games.Status status3 ) = games.s_games(gameHash);  
      // assert(status3 == Games.Status.Completed);

      // retrieve the winner & return. 
      // ( ,  , winner, , ) = games.s_games(gameHash); 
    }
}