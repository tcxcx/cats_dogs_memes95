// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** 
* Manages creattion of tournaments and games, setting up players (and their decks) against each other.  
* Only Avatar Based Accounts can call this function, but they can do so ay any time for as many time as they want. 
* An allowance of coins is set at its parent 'Cards.sol' contract. 
* It is not possible to mint more than your allowance.  
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
    error Games__PlayerNotRegistered(); 
    error Games__PlayerNotIdle(); 
    error Games__PlayerNotPending();
    error Games__PlayerNotActive(); 
    error Games__MsgSenderNotInGame(); 
    
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

    struct Game { // The Game struct stores the two Players that challenges each other, store the state of the game, its winner and a unique nonce.   
        address playerOne;
        address playerTwo;
        uint256 winner;
        uint256 nonce;  
        Status status; 
    }

    struct Player { // The Player struct stores the cardDeck to the player, the tournament their playing in, accumulated score and state. 
        uint256[10] cardDeck; 
        uint256 tournament; 
        uint256 score; 
        Status status; 
    }
    
    /* State variables */
    uint256 public s_nonce = 1; // used set render games unique. Starts at 1, so that 0 can be used as 'undefined'. 
    address public immutable i_owner; // owner of contract. 
    address public immutable i_cards; // address of cards contract. 
    mapping(bytes32 => Game) public s_games; // £note: you need to know the address of your opponent to enter in a game with them.  
    mapping(address => Player) public s_players; // £note: you cannot save a mapping in a struct. Hence the 'Game' struct only store the address. This mapping is used to store the actucal 'Player' struct. 
    address[] public s_PlayersInTournament; // an array of player participating in the current tournament. Acts as counter and ...  
    uint256 public s_tournamentCounter; // The tournament number, keeps each tournament (sequentially) unique. NOTE: It is impossible to hold two tournaments at the same time within one 'Games.sol' contract. 
    Status public s_statusTournament; // the status of the tournament. 
    uint256[3] public s_prices; // prices for first, second and third place in coins to be distributed to the Avatar Based Account of the player. 
    
    /* Events */
    event DeployedGamesContract(address indexed owner);
    event PlayerEnteredTournament(address indexed playerAccount); 
    event StartedNewTournament(uint256 indexed tournament); 
    event EndedTournament(uint256 indexed tournament, address indexed winner, address second, address third); 
    event InitialisedGame(address indexed playerOne, uint256 indexed nonce); 
    event JoinedGame(address indexed playerTwo, bytes32 indexed gameHash);  
    event CancelledPendingGame(address indexed playerOne, bytes32 indexed gameHash); 
    
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

    modifier onlyRegisteredPlayer() {
        if (s_players[msg.sender].tournament != s_tournamentCounter) {
            revert Games__PlayerNotRegistered(); 
        }
        _;
    }

    modifier onlyIdlePlayer() {
        if (s_players[msg.sender].status != Status.Idle) {
            revert Games__PlayerNotIdle(); 
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
    function startTournament(uint256 firstPrice, uint256 secondPrice, uint256 thirdPrice) public onlyOwner {
        if (
            s_statusTournament != Status.Idle && 
            s_statusTournament != Status.Completed
            ) {
            revert Games__TournamentNotIdleOrCompleted(); 
        }
        
        // delete array of players active in tournament. 
        while (s_PlayersInTournament.length > 0) {
            s_PlayersInTournament.pop(); 
        }
        s_tournamentCounter++;
        s_prices[0] = firstPrice;  
        s_prices[1] = secondPrice; 
        s_prices[2] = thirdPrice; 

        s_statusTournament = Status.Active; 

        emit StartedNewTournament(s_tournamentCounter); 
    }

    function stopTournament() public onlyOwner {
        s_statusTournament = Status.Completed; 
        (address[] memory avatarAccount, , uint256[] memory rankings) = getRankings(); 
        address winner; 
        address second; 
        address third;

        // Note I do not check if calls are succesful. possibly adapt later on. 
        for (uint256 i; i < rankings.length; i++) {
            if (rankings[i] == 1 && avatarAccount[i] != address(0)) { // if there is no winner, address remains at address(0) - and no price will be transferred.
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[0], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                winner = avatarAccount[i]; 
            }
            if (rankings[i] == 2 && avatarAccount[i] != address(0)) { // same as above. 
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[1], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                second = avatarAccount[i]; 
            }
            if (rankings[i] == 3 && avatarAccount[i] != address(0)) { // same as above. 
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[2], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                third = avatarAccount[i]; 
            }
        }

        emit EndedTournament(s_tournamentCounter, winner, second, third); 
    }

    // NB: DOES NOT CHECK IF CARDS ARE ACTUALLY OWNED BY PLAYER.  
    function enterPlayerInTournament(uint256[10] memory cardDeck) public onlyDuringActiveTournament {
        if (!ERC165Checker.supportsInterface(msg.sender, type(IAvatarExecutable).interfaceId)) {
            revert Games__OnlyAvatarBasedAccount();
        }
        if (s_players[msg.sender].tournament == s_tournamentCounter) {
            revert Games__PlayerAlreadyEnteredTournament(); 
        }

        Player memory player = Player({
            cardDeck: cardDeck,
            tournament: s_tournamentCounter, 
            score: 0, 
            status: Status.Idle
        }); 

        s_players[msg.sender] = player; 
        s_PlayersInTournament.push(msg.sender); 

        emit PlayerEnteredTournament(msg.sender); 
    }

    // function updateCardDeck(uint256[10] memory cardDeck) public onlyAvatarBasedAccount(msg.sender) onlyDuringActiveTournament {
    //  Not a crucial funcion, do later. £TODO
    // }

    function initialiseGame() public onlyRegisteredPlayer onlyDuringActiveTournament onlyIdlePlayer {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, s_nonce)); 

        Game memory game = Game({
            playerOne: msg.sender, 
            playerTwo: address(0), 
            winner: 0, 
            status: Status.Pending, 
            nonce: s_nonce
        });

        s_games[gameHash] = game; 
        s_players[msg.sender].status = Status.Pending; 
        s_nonce++; 

        emit InitialisedGame(msg.sender, s_nonce);
    } 

    function joinGame(uint256 nonce, address opponent) public onlyRegisteredPlayer onlyDuringActiveTournament onlyIdlePlayer {
        bytes32 gameHash = keccak256(abi.encode(opponent, nonce));  
        if (s_games[gameHash].nonce == 0) {
            revert Games__GameNotRecognised(); 
        }
        if (s_games[gameHash].status != Status.Pending) {
            revert Games__GameNotPending(); 
        }

        s_games[gameHash].playerTwo = msg.sender; 
        s_games[gameHash].status = Status.Active; 
        s_players[msg.sender].status = Status.Active; 
        s_players[opponent].status = Status.Active; 

        emit JoinedGame(msg.sender, gameHash);        
    }

    function cancelPendingGame(uint256 nonce) public onlyRegisteredPlayer onlyDuringActiveTournament {
        bytes32 gameHash = keccak256(abi.encode(msg.sender, nonce));  
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

    function exitGame(uint256 nonce, address playerOne, uint256 winner) public onlyDuringActiveTournament {
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
                revert Games__MsgSenderNotInGame(); 
            }
        if  (
            s_players[msg.sender].status != Status.Active
            ) {
                revert Games__PlayerNotActive(); 
            }
        address playerTwo = s_games[gameHash].playerTwo; 
        
        // this is the first player to add a winner. Pause the game, set status player to completed, store the winner. 
        if (s_games[gameHash].winner == 0) {
            s_games[gameHash].status = Status.Paused; 
            s_players[msg.sender].status = Status.Completed; 
            s_games[gameHash].winner = winner; 
        } else {
        // this is the second player to add a winner. Complete the game, set player to completed, compare winner, distribute score.
            s_games[gameHash].status = Status.Completed;
            s_players[msg.sender].status = Status.Completed; 
            if (s_games[gameHash].winner == winner) {
                // if both players agree on winner. 
                if (winner == 1) { 
                    s_players[playerOne].score + 3;
                    s_players[playerTwo].score + 1;
                } else {
                    s_players[playerOne].score + 1;
                    s_players[playerTwo].score + 3;
                }
            } 
            // Note: when players do NOT agree in winner, neither of them get any points. 
        }
    }

    /* internal */ 


    /* getters */
    function getRankings() public view returns (
            address[] memory avatars, 
            uint256[] memory scores, 
            uint256[] memory rankings
        ) { 
    
        uint256 numberPlayers = s_PlayersInTournament.length; 
        scores = new uint256[](numberPlayers);
        rankings = new uint256[](numberPlayers);

        for (uint256 i; i < numberPlayers; i++) {
            scores[i] = s_players[s_PlayersInTournament[i]].score;
            rankings[i] = 1;  
            for (uint256 j; j < numberPlayers; j++) {
                if (scores[i] > scores[j]){ rankings[i]++; } 
            }
        }
        return (s_PlayersInTournament, scores, rankings); 
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
