// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** 
* Manages tournaments, games and rankings of players.
* 
* The owner of the contract can start and stop a tournament. 
* If a tournament is active, Avatar Based Accounts can:  
*    - initialise a game with a deck of ten cards. Setting the game's status to 'Pending'.   
*    - join a 'pending' game with a deck of ten cards. This will set the game's status to active.
*    - exit an 'active' game they were a player in, vouching who won. 
*        - If they are the first one to do so, this will set the game's status to 'pause'.
*        - If they are the second one to do so, this will set the game's status to 'completed', and calculate score:  
*            - winner => 3 points
*            - loser => 1 points
*            - no agreement on winner? => both 0 points. 
* When the owner stops a tournament, rankings are calculated and winners, runnerUps and thirdPlaces announced (with equal scores multiple players can be winners, runnerups, or hodl third places).   
* 
* The 'getRankings' functions allows to get a list of players, their scores and ranks at any time during an active tournament. 
*
* Authors: Argos, CriptoPoeta, 7cedars
*/
import {Cards} from "./Cards.sol"; 
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol"; 

contract Games {
    /* errors */
    error Games__OnlyAvatarBasedAccount(); 
    error Games__OnlyOwner(); 
    error Games__OnlyDuringActiveTournament(); 

    error Games__TournamentNotIdleOrCompleted(); 
    
    error Games__PlayerAlreadyEnteredTournament();
    error Games__PlayerNotIdle(); 
    error Games__PlayerNotPending();
    error Games__PlayerIsPending();
    error Games__PlayerNotActive(); 
    error Games__CardNotInPlayerCollection(); 
    error Games__SenderNotPlayerInGame(); 
    
    error Games__GameNotRecognised(); 
    error Games__GameNotPending(); 
    error Games__GameNotActiveOrPaused(); 

    /* Type declarations */  
    enum Status { // The Status enum manages the state of Player, Game and Tournament. 
        Idle,
        Pending,
        Active,
        Paused, 
        Cancelled,
        Completed
    }

    struct Game { // The Game struct stores the two Players that challenges each other and their cardecks, store the state of the game, its winner and a unique nonce.   
        address playerOne; 
        address playerTwo;
        uint256[] cardDeckOne; 
        uint256[] cardDeckTwo; 
        address winner;
        uint256 nonce;  
        Status status; 
    }

    struct Player { // The Player struct stores the cardDeck to the player, the tournament their playing in, accumulated score and state. 
        uint256 tournament; 
        uint256 score; 
        Status status; 
    }
    
    /* State variables */
    uint256 public s_nonce = 1; // used set render games unique. Starts at 1, so that 0 can be used as 'undefined'. 
    address public immutable i_owner; // owner of contract. 
    address public immutable i_cards; // address of cards contract. 
    mapping(bytes32 => Game) public s_games; // £note: you need to know the address of your opponent to enter in a game with them.  
    mapping(address => Player) public s_players; // £note: you cannot save a mapping in a struct. Hence the 'Game' struct only store the address. This mapping is used to store the actucal 'Player' struct. It is independent from tournament. 
    // mapping(address => uint256[]) public s_cardDecks; 
    address[] public s_playersInTournament; // an array of player participating in the current tournament. Acts as counter and used to calculate rankings. 
    address[] public s_winners; 
    address[] public s_runnerUps; 
    address[] public s_thirdPlace; 
    uint256 public s_tournamentCounter; // The tournament number, keeps each tournament (sequentially) unique. NOTE: It is impossible to hold two tournaments at the same time within one 'Games.sol' contract. 
    Status public s_statusTournament; // the status of the tournament.

    /* Events */
    event DeployedGamesContract(address indexed owner);
    event PlayerRegisteredInTournament(address indexed playerAccount); 
    event StartedNewTournament(uint256 indexed tournament); 
    event EndedTournament(uint256 indexed tournament, address[] winner, address[] runnerUp, address[] thirdPlace); 
    event InitialisedGame(address indexed playerOne, uint256 indexed nonce); 
    event JoinedGame(address indexed playerTwo, bytes32 indexed gameHash);  
    event CancelledPendingGame(address indexed playerOne, bytes32 indexed gameHash); 
    event CompletedGame(address indexed winner, bytes32 indexed gameHash);  
    
    /* Modifiers */
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert Games__OnlyOwner();
        }
        _;
    }

    modifier onlyDuringActiveTournament() {
        if (s_statusTournament != Status.Active) { 
            revert Games__OnlyDuringActiveTournament(); 
        }
        _;
    }

    modifier onlyAvatarBasedAccount() {
        if (!ERC165Checker.supportsInterface(msg.sender, type(IAvatarExecutable).interfaceId)) {
            revert Games__OnlyAvatarBasedAccount();
        }
        _;
    }

    /* FUNCTIONS: */
    /* constructor */
    /**
     * Note Sets up the Games contract. 
     *
     * @param cardsContract the cards contract to be used in the contract. 
     * 
     * dev: It does NOT upload any cards yet, this is done later through the 'createCards' function. 
     *
     */
    constructor(address cardsContract) {
        i_owner = msg.sender; 
        i_cards = cardsContract; 
        s_statusTournament = Status.Idle;
        
        emit DeployedGamesContract(msg.sender);
    }

    /* public */
    // note: prices are set at the start of each tournament. 
    function startTournament() public onlyOwner {
        if (
            s_statusTournament != Status.Idle && 
            s_statusTournament != Status.Completed
            ) {
            revert Games__TournamentNotIdleOrCompleted(); 
        }
        
        // delete array of players active in tournament -- used to calculate rankings in tournament. 
        while (s_playersInTournament.length > 0) {
            s_playersInTournament.pop(); 
        }
        // reset arrays of winners, seconds, thirds 
        while (s_winners.length > 0) {
            s_winners.pop(); 
        }
        while (s_runnerUps.length > 0) {
            s_runnerUps.pop(); 
        }
        while (s_thirdPlace.length > 0) {
            s_thirdPlace.pop(); 
        }
        s_tournamentCounter++;
        s_statusTournament = Status.Active; 

        emit StartedNewTournament(s_tournamentCounter); 
    }

    function stopTournament() public onlyOwner {
        (address[] memory avatarAccount, , uint256[] memory rankings) = getRankings(); 
        s_statusTournament = Status.Completed; 

        // NB TODO: Change logic: mint coins to this contract; then transfer coins to winners. 
        // Note: prices are now in coins. Can also be in native currency. Pretty much any logic / thing is possible. 
        // NB! If people have same rank this approach does not work!! 
        for (uint256 i; i < rankings.length; i++) {
            if (rankings[i] == 1 && avatarAccount[i] != address(0)) { // if there is no winner, address remains at address(0) - and no price will be transferred.
                s_winners.push(avatarAccount[i]); 
            }
            if (rankings[i] == 2 && avatarAccount[i] != address(0)) { // same as above. 
                s_runnerUps.push(avatarAccount[i]);
            }
            if (rankings[i] == 3 && avatarAccount[i] != address(0)) { // same as above. 
                s_thirdPlace.push(avatarAccount[i]);
            }
        }

        emit EndedTournament(s_tournamentCounter, s_winners, s_runnerUps, s_thirdPlace); 
    }

    function initialiseGame(uint256[] memory cardDeck) public onlyDuringActiveTournament onlyAvatarBasedAccount {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, s_nonce)); 
        uint256[] memory cardDeckTwo = new uint256[](10);
        (bool success) = _checkDeckAgainstCollection(msg.sender, cardDeck);

        if (!success) {
            revert Games__CardNotInPlayerCollection(); 
        }
        if (s_players[msg.sender].status == Status.Pending) {
            revert Games__PlayerIsPending();
        }
        if (s_players[msg.sender].tournament != s_tournamentCounter) {
            _registerPlayerInTournament(msg.sender);
        } 

        s_games[gameHash] = Game({
            playerOne: msg.sender, 
            playerTwo: address(0), 
            cardDeckOne: cardDeck, 
            cardDeckTwo: cardDeckTwo, 
            winner: address(0), 
            status: Status.Pending, 
            nonce: s_nonce
        });
        s_players[msg.sender].status = Status.Pending; 
        s_nonce++; 

        emit InitialisedGame(msg.sender, s_games[gameHash].nonce);
    } 

    function cancelPendingGame(uint256 nonce) public onlyDuringActiveTournament {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, nonce)); // note that only the player themselves is able to cancel the game.
        if (s_players[msg.sender].status != Status.Pending) {
            revert Games__PlayerNotPending(); 
        }
        if (s_games[gameHash].status != Status.Pending) {
            revert Games__GameNotPending(); 
        }
        s_games[gameHash].status = Status.Cancelled; 
        s_players[msg.sender].status = Status.Idle; 
        
        emit CancelledPendingGame(msg.sender, gameHash);  
    }

    // 
    function joinGame(address opponent, uint256 nonce, uint256[] memory cardDeck) public onlyDuringActiveTournament onlyAvatarBasedAccount {
        bytes32 gameHash = keccak256(abi.encode(opponent, nonce));  
        if (s_games[gameHash].nonce == 0) {
            revert Games__GameNotRecognised(); 
        }
        if (s_games[gameHash].status != Status.Pending) {
            revert Games__GameNotPending(); 
        }
        (bool success) = _checkDeckAgainstCollection(msg.sender, cardDeck);
        if (!success) {
            revert Games__CardNotInPlayerCollection(); 
        }
        if (s_players[msg.sender].tournament != s_tournamentCounter) {
            _registerPlayerInTournament(msg.sender);
        } 

        s_games[gameHash].playerTwo = msg.sender;
        s_games[gameHash].status = Status.Active;
        s_games[gameHash].cardDeckTwo = cardDeck;
        s_players[msg.sender].status = Status.Active; 
        s_players[opponent].status = Status.Active; 

        emit JoinedGame(msg.sender, gameHash);
    }

    function completeGame(uint256 nonce, address playerOne, address winner) public onlyDuringActiveTournament onlyAvatarBasedAccount {
        bytes32 gameHash = keccak256(abi.encode(playerOne, nonce));  
        if (
            s_games[gameHash].status != Status.Active &&
            s_games[gameHash].status != Status.Paused
            ) {
            revert Games__GameNotActiveOrPaused(); 
        }
        if  (
            msg.sender != s_games[gameHash].playerOne &&
            msg.sender != s_games[gameHash].playerTwo
            ) {
                revert Games__SenderNotPlayerInGame(); 
            }
        if  (
            s_players[msg.sender].status != Status.Active
            ) {
                revert Games__PlayerNotActive(); 
            }
        address playerTwo = s_games[gameHash].playerTwo; 
        // address loggedWinner = s_games[gameHash].winner; 
        
        // this is the first player to add a winner. Pause the game, set status player to completed, store the winner. 
        if (s_games[gameHash].winner == address(0)) {
                s_games[gameHash].status = Status.Paused; 
                s_games[gameHash].winner = winner; 
                s_players[msg.sender].status = Status.Completed; 
                emit CompletedGame(address(2), gameHash);
            } else {
            // this is the second player to add a winner. Complete the game, set player to completed, compare winner, distribute score.
            s_games[gameHash].status = Status.Completed;
            s_players[msg.sender].status = Status.Completed; 
            if (s_games[gameHash].winner == winner) {
                // if both players agree on winner. 
                if (winner == playerOne) { 
                    s_players[playerOne].score += 3;
                    s_players[playerTwo].score += 1;
                } else {
                    s_players[playerTwo].score += 3;
                    s_players[playerOne].score += 1;
                }
                }
            if (s_games[gameHash].winner != winner) {
                    s_games[gameHash].winner = address(1); // note address 1 as signal that there was no consensus on winner. 
                }
            // Note: when players do NOT agree in winner, neither of them get any points. 
            emit CompletedGame(s_games[gameHash].winner, gameHash);
        }
    }

    /* internal */ 
    function _checkDeckAgainstCollection(address player, uint256[] memory cardDeck) internal view returns (bool success) {
        uint256[] memory playerCollection = Cards(payable(i_cards)).getCollection(player);

        for (uint256 i; i < 10; i++) {
            if (playerCollection[cardDeck[i]] == 0) {
                revert Games__CardNotInPlayerCollection(); 
            }
        }
        
        return true; 
    }

    function _registerPlayerInTournament(address avatarBasedAccount) internal {
        if (!ERC165Checker.supportsInterface(avatarBasedAccount, type(IAvatarExecutable).interfaceId)) {
            revert Games__OnlyAvatarBasedAccount();
        }
        if (s_players[avatarBasedAccount].tournament == s_tournamentCounter) {
            revert Games__PlayerAlreadyEnteredTournament(); 
        }

        Player memory player = Player({
            tournament: s_tournamentCounter, 
            score: 0, 
            status: Status.Idle
        }); 

        s_players[avatarBasedAccount] = player; 
        s_playersInTournament.push(avatarBasedAccount); 

        emit PlayerRegisteredInTournament(avatarBasedAccount); 
    }

    /* getters */
    function getRankings() public view onlyDuringActiveTournament returns (
            address[] memory avatars, 
            uint256[] memory scores, 
            uint256[] memory rankings
        ) { 
    
        uint256 numberPlayers = s_playersInTournament.length; 
        scores = new uint256[](numberPlayers);
        rankings = new uint256[](numberPlayers);

        for (uint256 i; i < numberPlayers; i++) {
            scores[i] = s_players[s_playersInTournament[i]].score;
        }
        for (uint256 i; i < numberPlayers; i++) {
            rankings[i] = 1;  
            for (uint256 j; j < numberPlayers; j++) {
                if (scores[i] < scores[j]){ rankings[i]++; }  
            }
        }
        return (s_playersInTournament, scores, rankings); 
    }
}


// £Notes to self  
// When reviewing this code, check: https://github.com/transmissions11/solcurity
// see also: https://github.com/nascentxyz/simple-security-toolkit

// Structure contract // -- from Patrick Collins. 
/* version */
/* imports */
/* errors */
/* interfaces, libraries, contracts */
/* Type declarations */
/* State variables */
/* Events */
/* Modifiers */

/* FUNCTIONS: */
/* constructor */
/* receive function (if exists) */
/* fallback function (if exists) */
/* external */
/* public */
/* internal */
/* private */
/* internal & private view & pure functions */
/* external & public view & pure functions */
