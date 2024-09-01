// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// Manages create of games, setting up players (and their decks) against each other. etc. 
// NOTE: the detailed functioning of this contract will be developed later. 
// in early stages, the only thing that this contract should do is to initiate a game when two players and their decks have entered. 


import {Cards} from "./Cards.sol"; 
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol"; 

contract Games {
    /* errors */
    error Games__OnlyAvatarBasedAccount(); 
    error Games__OnlyOwner(); 
    error Games__OnlyDuringActiveSeason(); 
    error Games__SeasonStillActiveOrPending(); 
    error Games__PlayerAlreadyEnteredSeason();
    error Games__GameNotRecognised(); 
    error Games__PlayerNotRegistered(); 
    error Games__PlayerNotIdle(); 
    error Games__PlayerNotPending();
    error Games__PlayerNotActive(); 
    error Games__GameNotPending(); 
    error Games__GameNotActiveOrPaused(); 
    error Games__MsgSenderNotInGame(); 

    /* Type declarations */  
    enum Status {
        Idle,
        Pending,
        Active,
        Paused, 
        Cancelled,
        Completed
    }
    struct Game {
        address playerOne;
        address playerTwo;
        Status status; 
        uint256 winner;
        uint256 nonce;  
    }
    struct Player {
        uint256[10] cardDeck; // note: only one cardDeck per player. This is correct, right? 
        uint256 season; 
        uint256 score; 
        Status status; 
    }
    
    /* State variables */
    uint256 public s_nonce = 1; // used set render games unique. 0 used as 'undefined'. 
    address public immutable i_owner; 
    address public immutable i_cards; 
    mapping(bytes32 => Game) public s_games; // £note: you need to know the address of your opponent to enter in a game with them.  
    mapping(address => Player) public s_players; // £note: you cannot save a mapping in a struct. Hence the mapping needs to 
    address[] s_PlayersInSeason; 
    uint256 s_seasonsCounter;
    Status seasonStatus;
    uint256[3] s_prices; 

    /* Events */
    event DeployedSeasonsContract(address indexed owner); 
    event StartedNewSeason(uint256 indexed season); 
    event EndedSeason(uint256 indexed season, address indexed winner, address second, address third); 
    event InitialisedGame(address indexed playerOne, uint256 indexed nonce); 
    event JoinedGame(address indexed playerTwo, bytes32 indexed gameHash);  
    event CancelledPendingGame(address indexed playerOne, bytes32 indexed gameHash); 
    event PlayerEnteredSeason(address indexed playerAccount); 
    
    /* Modifiers */
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert Games__OnlyOwner();
        }
        _;
    }

    modifier onlyDuringActiveSeason() {
        if (seasonStatus != Status.Active) { 
            revert Games__OnlyDuringActiveSeason(); 
        }
        _;
    }

    modifier onlyRegisteredPlayer() {
        if (s_players[msg.sender].season != s_seasonsCounter) {
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
    constructor(address cardsContract) {
        i_owner = msg.sender; 
        i_cards = cardsContract; 
        emit DeployedSeasonsContract(msg.sender);
    }

    /* public */
    function startSeason(uint256 firstPrice, uint256 secondPrice, uint256 thirdPrice) public onlyOwner {
        if (
            seasonStatus != Status.Idle || 
            seasonStatus != Status.Completed
            ) {
            revert Games__SeasonStillActiveOrPending(); 
        }
        
        // delete array of players active in season. 
        while (s_PlayersInSeason.length > 0) {
            s_PlayersInSeason.pop(); 
        }
        s_seasonsCounter++;
        s_prices[0] = firstPrice;  
        s_prices[1] = secondPrice; 
        s_prices[2] = thirdPrice; 

        seasonStatus = Status.Active; 

        emit StartedNewSeason(s_seasonsCounter); 
    }

    function stopSeason() public onlyOwner {
        seasonStatus = Status.Completed; 
        (address[] memory avatarAccount, , uint256[] memory rankings) = getRankings(); 
        address winner; 
        address second; 
        address third;

        // Note I do not check if call are succesful. possibly adapt later on. 
        for (uint256 i; i < rankings.length; i++) {
            if (rankings[i] == 1) { 
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[0], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                winner = avatarAccount[i]; 
            }
            if (rankings[i] == 2) { 
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[1], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                second = avatarAccount[i]; 
            }
            if (rankings[i] == 3) { 
                bytes memory functionCall = abi.encodeWithSelector(Cards.addToCoinAllowance.selector, s_prices[2], avatarAccount[i]);
                i_cards.call{value: 0}(functionCall); 
                third = avatarAccount[i]; 
            }
        }

        emit EndedSeason(s_seasonsCounter, winner, second, third); 
    }

    function enterPlayerInSeason(uint256[10] memory cardDeck) public onlyDuringActiveSeason {
        if (!ERC165Checker.supportsInterface(msg.sender, type(IAvatarExecutable).interfaceId)) {
            revert Games__OnlyAvatarBasedAccount();
        }
        if (s_players[msg.sender].season == s_seasonsCounter) {
            revert Games__PlayerAlreadyEnteredSeason(); 
        }

        Player memory player = Player({
            cardDeck: cardDeck,
            season: s_seasonsCounter, 
            score: 0, 
            status: Status.Idle
        }); 

        s_players[msg.sender] = player; 
        s_PlayersInSeason.push(msg.sender); 

        emit PlayerEnteredSeason(msg.sender); 
    }

    // Not a crucial funcion, do later. £TODO
    // function updateCardDeck(uint256[10] memory cardDeck) public onlyAvatarBasedAccount(msg.sender) onlyDuringActiveSeason {
    //      uint256 season = s_seasons.length - 1; 
    //     if (s_seasons[season].players[msg.sender] == Player({})) { // I have to check how this initiates! 
    //         revert Games__PlayerNotRegistered(); 
    //     }
    // }

    function initialiseGame() public onlyRegisteredPlayer onlyDuringActiveSeason onlyIdlePlayer {
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

    function joinGame(uint256 nonce, address opponent) public onlyRegisteredPlayer onlyDuringActiveSeason onlyIdlePlayer {
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

    function cancelPendingGame(uint256 nonce) public onlyRegisteredPlayer onlyDuringActiveSeason {
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

    function exitGame(uint256 nonce, address playerOne, uint256 winner) public onlyDuringActiveSeason {
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
    
        uint256 numberPlayers = s_PlayersInSeason.length; 
        scores = new uint256[](numberPlayers);
        rankings = new uint256[](numberPlayers);

        for (uint256 i; i < numberPlayers; i++) {
            scores[i] = s_players[s_PlayersInSeason[i]].score;
            rankings[i] = 1;  
            for (uint256 j; j < numberPlayers; j++) {
                if (scores[i] > scores[j]){ rankings[i]++; } 
            }
        }
        return (s_PlayersInSeason, scores, rankings); 
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
