// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Manages tournaments, games and rankings of players.
 *
 * The owner of the contract can start a tournament.
 * Chainlink's time-based automation will stop the tournament after a certain amount of time. 
 * If a tournament is active, Avatar Based Accounts can:
 *    - initialise a game with a deck of ten cards. Setting the game's status to 'Pending'.
 *    - join a 'pending' game with a deck of ten cards. This will set the game's status to active.
 *    - exit an 'active' game they were a player in, vouching who won.
 *        - If they are the first one to do so, this will set the game's status to 'pause'.
 *        - If they are the second one to do so, this will set the game's status to 'completed', and calculate score:
 *            - winner => 3 points
 *            - loser => 1 points
 *            - no agreement on winner? => both 0 points.
 * When the owner stops a tournament, rankings are returned as a return value.
 *
 * The 'getRankings' functions allows to get a list of players, their scores and ranks at any time during an active tournament.
 *
 * Detailed natspecs are in the contract below. 
 *
 * Authors: Argos, CriptoPoeta, 7cedars
 *
 * address of the automation upkeep: https://automation.chain.link/sepolia/45169386249656034327347769669730716545228673563306895534577404978448411438051
 * 
 */
import {Cards} from "./Cards.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol";

import {AutomationCompatibleInterface} from "../../lib/chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";  

contract Games is AutomationCompatibleInterface {
    /* errors */
    error Games__OnlyAvatarBasedAccount();
    error Games__OnlyOwner();
    error Games__OnlyDuringActiveTournament();
    error Games__onlyChainlinkForwarder(); 

    error Games__TournamentNotIdleOrCompleted();

    error Games__PlayerAlreadyEnteredTournament();
    error Games__PlayerNotPending();
    error Games__PlayerNotActive();
    error Games__NoPendingPlayerAllowed();
    error Games__CardNotInPlayerCollection();
    error Games__SenderNotPlayerInGame();

    error Games__GameNotRecognised();
    error Games__GameAgainstSelfNotAllowed(); 
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

    struct Game { // The Game struct stores the state of a game: its players, card decks, winner, unique nonce and status.
        address playerOne;
        address playerTwo;
        uint8[] cardDeckOne;
        uint8[] cardDeckTwo;
        address winner;
        uint256 nonce;
        Status status;
    }

    struct Player { // The Player struct stores the tournament their playing in, accumulated score and state.
        uint256 tournament;
        uint256 score;
        Status status;
    }

    /* State variables */
    address public immutable OWNER; // owner of contract.
    address public immutable CARDS_CONTRACT; // address of cards contract.

    uint256 public gameCounter = 1; // The game counter, keeps each game unique. Used as nonce in the Game struct. Starts at 1, so that 0 can be used as 'undefined'.
    uint256 public tournamentCounter; // The tournament number, keeps each tournament (sequentially) unique. NOTE: It is impossible to hold two tournaments at the same time within one 'Games.sol' contract.
    mapping(bytes32 => Game) public games; // Mapping of all games that have been played in this contract. (Note: if you have the gameHash, you can search back historic games). 
    mapping(address => Player) public players;  // Mapping of all players that have been active in a game in this contract.
    address[] public playersInTournament; // an array of player participating in the current tournament. Acts as counter and used to calculate rankings.
    Status public statusTournament; // the status of the current tournament.

    uint256 public immutable tournamentDuration;
    uint256 public startTournamentTimeStamp;
    address private forwarder; 

    /* Events */
    event DeployedGamesContract(address indexed owner);
    event PlayerRegisteredInTournament(address indexed playerAccount);
    event StartedNewTournament(uint256 indexed tournament);
    event EndedTournament(uint256 indexed tournament);
    event InitialisedGame(address indexed playerOne, uint256 indexed nonce);
    event JoinedGame(address indexed playerTwo, bytes32 indexed gameHash);
    event CancelledPendingGame(address indexed playerOne, bytes32 indexed gameHash);
    event CompletedGame(address indexed winner, bytes32 indexed gameHash);

    /* Modifiers */
    modifier onlyOwner() {
        if (msg.sender != OWNER) {
            revert Games__OnlyOwner();
        }
        _;
    }

    modifier onlyDuringActiveTournament() {
        if (statusTournament != Status.Active) {
            revert Games__OnlyDuringActiveTournament();
        }
        _;
    }

    modifier onlyAvatarBasedAccount() {
        if (
            !ERC165Checker.supportsInterface(msg.sender, type(IAvatarExecutable).interfaceId)
            ) {
            revert Games__OnlyAvatarBasedAccount();
        }
        _;
    }

    /* FUNCTIONS: */
    /* constructor */
    /**
     * @notice Sets up the Games contract.
     *
     * @param cardsContract the cards contract to be used in the contract.
     *
     * @dev The CARDS_CONTRACT does not have to be owned by the same owner as the Games.sol contract.  
     * @dev Currently there are no checks on the address being added. This should be added later.  
     *
     */
    constructor(address cardsContract, uint256 updateTournamentDuration) {
        OWNER = msg.sender;
        CARDS_CONTRACT = cardsContract;
        statusTournament = Status.Idle;
        
        tournamentDuration = updateTournamentDuration;

        emit DeployedGamesContract(msg.sender);
    }

    /* external */ 
    // from:  https://docs.chain.link/chainlink-automation/guides/compatible-contracts
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded = (
            (block.timestamp - startTournamentTimeStamp) > tournamentDuration && 
            statusTournament == Status.Active
        );
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        if (msg.sender != forwarder) {
            revert Games__onlyChainlinkForwarder(); 
        }
        if ((
            block.timestamp - startTournamentTimeStamp) > tournamentDuration && 
            statusTournament == Status.Active
            ) {
            _stopTournament(); 
        }
    }


    /* public */
    /**
     * @notice Starts a tournament.  
     *
     * @dev It sets the statusTournament to active and increases the tournament counter. That is all.
     * Subsequent functions are constrained by both the state and counter of the tournament.  
     *
     * @dev Does not take any params. 
     * @dev Can only be called by the owner of the contract.  
     * @dev It starts the counter for chainlinks time based automation.  
     */
    function startTournament() public onlyOwner {
        if (statusTournament != Status.Idle && statusTournament != Status.Completed) {
            revert Games__TournamentNotIdleOrCompleted();
        }

        tournamentCounter++;
        statusTournament = Status.Active;
        startTournamentTimeStamp = block.timestamp; 

        emit StartedNewTournament(tournamentCounter);
    }

    /**
     * @notice Initialises a game.
     *
     * @param cardDeck An array of the card ids as saved at the ERC-1155 'Cards.sol' contract. Should have a length of 10. 
     *
     * The function unfolds in several steps. 
     * 1 - calculates the gameHash from the Avatar Based Account address and the gameCounter. This gameHash will be used to identify the game in later functions. 
     * 2 - checks if all the cards in the card deck are actually owned by the Avatar Based Account. 
     * 3 - checks if the Avatar Based Account has not already started a game. 
     * 4 - if not already registered, registers the Avatar Based Account as a player in the tournament.  
     * 
     * If all this checks out
     * 5 - stores a game struct, with empty data for playerTwo and their cardDeck, sets the status of the game to 'Pending'. 
     * 6 - sets the status of the player to 'Pending'. 
     * 7 - increases the game counter by one. 
     *  
     * @dev Can only be called when statusTournament is Active.  
     * @dev Can only be called by an Avatar Based Account. 
     *
     * emits an 'InitialisedGame' event. 
     */
    function initialiseGame(uint8[] memory cardDeck) public onlyDuringActiveTournament onlyAvatarBasedAccount {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, gameCounter));
        (bool success) = _checkDeckAgainstCollection(msg.sender, cardDeck);

        if (!success) {
            revert Games__CardNotInPlayerCollection();
        }
        if (players[msg.sender].status == Status.Pending) {
            revert Games__NoPendingPlayerAllowed();
        }
        if (players[msg.sender].tournament != tournamentCounter) {
            _registerPlayerInTournament(msg.sender);
        }
        
        uint8[] memory cardDeckTwo = new uint8[](10);
        games[gameHash] = Game({
            playerOne: msg.sender,
            playerTwo: address(0),
            cardDeckOne: cardDeck,
            cardDeckTwo: cardDeckTwo,
            winner: address(0),
            status: Status.Pending,
            nonce: gameCounter
        });
        players[msg.sender].status = Status.Pending;
        gameCounter++;

        emit InitialisedGame(msg.sender, games[gameHash].nonce);
    }

    /**
     * @notice Allows a pending game to be cancelled by its original creator.  
     * This is important as a player is not allowed to do anything while they are part of a pending game. (To avoid players entering multiple games at once). 
     *
     * @param _nonce the nonce of the game. 
     *
     * The function unfolds in several steps. 
     * 1 - calculates the gameHash from the Avatar Based Account address (msg.sender) and the _nonce. Note this disallows anyone but the original creator to cancel a pending game.  
     * 2 - checks if player and game are indeed pending. 
     * 3 - sets game status to 'Cancelled' and player status to 'Idle'.  
     * 
     * @dev Can only be called when statusTournament is Active. 
     *
     * emits a 'CancelledPendingGame' event. 
     */
    function cancelPendingGame(uint256 _nonce) public onlyDuringActiveTournament {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, _nonce)); // note that only the player themselves is able to cancel the game.
        if (players[msg.sender].status != Status.Pending) {
            revert Games__PlayerNotPending();
        }
        if (games[gameHash].status != Status.Pending) {
            revert Games__GameNotPending();
        }
        games[gameHash].status = Status.Cancelled;
        players[msg.sender].status = Status.Idle;

        emit CancelledPendingGame(msg.sender, gameHash);
    }

    /**
     * @notice Allows an Avatar Based Account to join a 'pending' game, turning it into an 'Active' game.  
     *
     * @param opponent address of the opponent (platerOne) in the game.
     * @param _nonce the unique number of the game. 
     * @param cardDeck  An array of the card ids as saved at the ERC-1155 'Cards.sol' contract. Should have a length of 10. 
     *
     * The function unfolds in several steps. 
     * 1 - calculates the gameHash from the opponent address (playerOne) and the _nonce. Note: this means you can only enter a game of you know playerOne and the nonce. 
     * 2 - checks if the game exists, playerOne is not also playerTwo, that the game is pending.    
     * 3 - check if the cards in the card Deck are actually owned by the Avatar Based Account. 
     * 4 - if not already registered, registers the Avatar Based Account as a player in the tournament.  
     * 
     * If all this checks out
     * 5 - adds msg.sender and their cardDeck as playerTwo and cardDeckTwo in the game struct. 
     * 6 - sets the Game status to 'Active'. 
     * 7 - sets the status of both players to 'Active'. 
     * 
     * @dev Can only be called when statusTournament is Active. 
     * @dev Can only be called by an Avatar Based Account.
     *
     * emits a 'JoinedGame' event. 
     */
    function joinGame(address opponent, uint256 _nonce, uint8[] memory cardDeck)
        public
        onlyDuringActiveTournament
        onlyAvatarBasedAccount
    {
        bytes32 gameHash = keccak256(abi.encode(opponent, _nonce));
        if (games[gameHash].nonce == 0) {
            revert Games__GameNotRecognised();
        }
        if (opponent == msg.sender) {
            revert Games__GameAgainstSelfNotAllowed();
        }
        if (games[gameHash].status != Status.Pending) {
            revert Games__GameNotPending();
        }
        (bool success) = _checkDeckAgainstCollection(msg.sender, cardDeck);
        if (!success) {
            revert Games__CardNotInPlayerCollection();
        }
        if (players[msg.sender].tournament != tournamentCounter) {
            _registerPlayerInTournament(msg.sender);
        }

        games[gameHash].playerTwo = msg.sender;
        games[gameHash].status = Status.Active;
        games[gameHash].cardDeckTwo = cardDeck;
        players[msg.sender].status = Status.Active;
        players[opponent].status = Status.Active;

        emit JoinedGame(msg.sender, gameHash);
    }

    /**
     * @notice Completes an active game.  
     * NB This function will likely change considerably as we integrate the Sign protocol and attestation. 
     *
     * @param playerOne the address of player one.  
     * @param _nonce the unique number of the game. 
     * @param winner The winner of the game (according to msg.sender)  
     *
     * The function unfolds in several steps. 
     * 1 - calculates the gameHash from the opponent address (playerOne) and the _nonce. Note: this means you can only enter a game of you know playerOne and the nonce. 
     * 2 - checks if the game is active, msg.sender is either PlayerOne or PlayerTwo, and that the player is active.    
     * 3 - check if the cards in the card Deck are actually owned by the Avatar Based Account. 
     * 4 - checks if it is the first or second time that 'completeGame' is called on the game.  
     * 
     * If it is called the first time 
     * 5 - sets the Game status to 'Paused'. 
     * 6 - sets the status of the player to 'Completed'. Note this disallows a player to call the function twice. 
     * 7 - sets the winner of the game. 
     *
     * If it is called the second time 
     * 8 - sets the Game status to 'Completed'. 
     * 9 - sets the status of the player to 'Completed'.  
     * 10 - compares the provided 'winner' with the 'winner' stored in the game.
     *       - no agreement on winner? => both 0 points.
     *       - agreement on winner? => winner get 3 points, loser get 1 point.     
     *
     * emits a 'CompletedGame' event. 
     */
    function completeGame(address playerOne, uint256 _nonce, address winner)
        public
        onlyDuringActiveTournament
        onlyAvatarBasedAccount
    {
        bytes32 gameHash = keccak256(abi.encode(playerOne, _nonce));
        if (games[gameHash].status != Status.Active && games[gameHash].status != Status.Paused) {
            revert Games__GameNotActiveOrPaused();
        }
        if (msg.sender != games[gameHash].playerOne && msg.sender != games[gameHash].playerTwo) {
            revert Games__SenderNotPlayerInGame();
        }
        if (players[msg.sender].status != Status.Active) {
            revert Games__PlayerNotActive();
        }
        address playerTwo = games[gameHash].playerTwo;

        // this is the first player to add a winner. Pause the game, set status player to completed, store the winner.
        if (games[gameHash].winner == address(0)) {
            games[gameHash].status = Status.Paused;
            games[gameHash].winner = winner;
            players[msg.sender].status = Status.Completed;
            emit CompletedGame(address(2), gameHash); // note: address 2 as signal that this was the first time that completeGame was called on this game. 
        } else {
            // this is the second player to add a winner. Complete the game, set player to completed, compare winner, distribute score.
            games[gameHash].status = Status.Completed;
            players[msg.sender].status = Status.Completed;
            if (games[gameHash].winner == winner) {
                // if both players agree on winner.
                if (winner == playerOne) {
                    players[playerOne].score += 3;
                    players[playerTwo].score += 1;
                } else {
                    players[playerTwo].score += 3;
                    players[playerOne].score += 1;
                }
            }
            if (games[gameHash].winner != winner) {
                games[gameHash].winner = address(1); // note address 1 as signal that there was no consensus on winner.
            }
            // Note: when players do NOT agree in winner, neither of them get any points.
            emit CompletedGame(games[gameHash].winner, gameHash);
        }
    }

    /**
     *
     *
     *
     */
    function setForwarder(address _forwarder) public onlyOwner {
        forwarder = _forwarder; 
    } 

    /* internal */
    /**
     * @notice Stops a tournament.
     *
     * @dev It sets the statusTournament to completed and returns the ranking of players. 
     *
     * @dev Does not take any params. 
     * @dev Is called via Chainlink timebased automation. 
     *
     * @return rankings - the rankings of players at the moment the tournament was stopped.  
     * 
     * emits an EndedTournament event. 
     *
     */
    function _stopTournament() internal returns (uint256[] memory rankings) {
        (,, rankings) = getRankings();
        statusTournament = Status.Completed;

        emit EndedTournament(tournamentCounter);

        return rankings;
    }

    /**
     * @notice checks if an array of cards are present in a collection of a player. 
     *
     * @param player the address of the player.  
     * @param cardDeck An array of the card ids as saved at the ERC-1155 'Cards.sol' contract. Should have a length of 10. 
     *
     * If a card is found that is not in the collection, the function reverts with a 'Games__CardNotInPlayerCollection' error. 
     *
     * @return success 
     */
    function _checkDeckAgainstCollection(address player, uint8[] memory cardDeck)
        internal
        view
        returns (bool success)
    {
        uint256[] memory playerCollection = Cards(payable(CARDS_CONTRACT)).getCollection(player);

        for (uint256 i; i < cardDeck.length; i++) {
            if (playerCollection[cardDeck[i]] == 0) {
                revert Games__CardNotInPlayerCollection();
            }
        }

        return true;
    }

    /**
     * @notice Registers an Avatar Based Account as a player in a tournament. 
     *
     * @param avatarBasedAccount the address of the Avatar Based Account.
     *
     * Checks if the address is an Avatar Based Account and if it has already been registered. 
     *
     * If all this checks out
     * - creates a player struct and stores it in the 'players' mapping. 
     * - adds the avatarBasedAccount address to the 'playersInTournament' array. 
     *
     */
    function _registerPlayerInTournament(address avatarBasedAccount) internal {
        if (!ERC165Checker.supportsInterface(avatarBasedAccount, type(IAvatarExecutable).interfaceId)) {
            revert Games__OnlyAvatarBasedAccount();
        }
        if (players[avatarBasedAccount].tournament == tournamentCounter) {
            revert Games__PlayerAlreadyEnteredTournament();
        }

        Player memory player = Player({tournament: tournamentCounter, score: 0, status: Status.Idle});

        players[avatarBasedAccount] = player;
        playersInTournament.push(avatarBasedAccount);

        emit PlayerRegisteredInTournament(avatarBasedAccount);
    }

    /* getters */
    /**
     * @notice Gets the rankings of currently registered players in the tournament. 
     *
     * @dev NB can be called at any time when tournament is set to 'Active'. 
     * @dev does not take any params.  
     * @dev for precise function, see comments in the function itself. 
     *
     * @return playerAddresses - an array of the address of players in the tournament.  
     * @return scores - the scores of each of the players. 
     * @return rankings - the rankings of each of players. It takes into account shared (first, second, third) rankings. 
     *
     */
    function getRankings()
        public
        view
        onlyDuringActiveTournament
        returns (address[] memory playerAddresses, uint256[] memory scores, uint256[] memory rankings)
    {
        uint256 numberPlayers = playersInTournament.length; // only read storage once. 

        scores = new uint256[](numberPlayers);
        rankings = new uint256[](numberPlayers);
        // create an array of scores of each player. for example: [10, 6, 9, 12]
        for (uint256 i; i < numberPlayers; i++) {
            scores[i] = players[playersInTournament[i]].score; 
        }
        // create an array 'rankings' of 1 for each player. [1, 1, 1, 1]
        for (uint256 i; i < numberPlayers; i++) {
            rankings[i] = 1;
            // compare score of player with each player in the 'scores' array. 
            // when a score is observed that is larger than that of the player, add 1 to the 'rankings' array. The result: [2, 4, 3, 1] => the rankings of players in the game.  
            for (uint256 j; j < numberPlayers; j++) {
                if (scores[i] < scores[j]) rankings[i]++;
            }
        }
        return (playersInTournament, scores, rankings);
    }
}

// for extensive guidance on best practices see: 
// - https://book.getfoundry.sh/tutorials/best-practices?highlight=lint#general-contract-guidance
// - https://docs.soliditylang.org/en/latest/style-guide.html


// Structure contract // -- From patrick collins, following guidance of the Ethereum foundation at: https://docs.soliditylang.org/en/latest/style-guide.html#order-of-functions
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

// for guidance on security see:   
// - https://github.com/transmissions11/solcurity
// - https://github.com/nascentxyz/simple-security-toolkit