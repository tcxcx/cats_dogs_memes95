// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol";
import {Cards} from "./Cards.sol";

/**
 * A simple ERC-20 contract that lets players mint a tokens through the function 'mintCoins'.
 * Only Avatar Based Accounts can call this function, but they can do so ay any time for as many time as they want.
 * An allowance of coins is set at its parent 'Cards.sol' contract.
 * It is not possible to mint more than your allowance.
 *
 * Authors: Argos, CriptoPoeta, 7cedars
 * 
 */
contract Coins is ERC20 {
    /* errors */
    error Coins__OnlyAvatarBasedAccount(address playerAccount);
    error Coins__MintExceedsAllowance();
    error Coins__constructorCanOnlyBeCalledByCardsConrtact(address caller);

    /* state vars */
    address public immutable CARDS_CONTRACT;
    mapping(address avatarBasedAccount => uint256 amount) public coinsMinted;

    /* Events */
    event DeployedCoinsContract(address indexed parentContract);

    /* Modifiers */
    modifier onlyAvatarBasedAccount(address user) {
        if (!ERC165Checker.supportsInterface(user, type(IAvatarExecutable).interfaceId)) {
            revert Coins__OnlyAvatarBasedAccount(user);
        }
        _;
    }

    /* FUNCTIONS: */
    /* constructor */
    /**
     * @notice Sets up the coins contract.
     *
     * Does not take any params. Name and Symbol of the coin is hard coded into the contract.
     *
     * @dev it sets msg.sender as the 'CARDS_CONTRACT'. This has to be a card address. The check for this is currently missing.
     * When a non-Cards.sol contract is used to create this contract, it will not function.
     * 
     * emits a DeployedCoinsContract event 
     */
    constructor() ERC20("Cats Dogs and Memes Coin", "CDM") {
        CARDS_CONTRACT = msg.sender;
        
        emit DeployedCoinsContract(msg.sender);
    }

    /* public */
    /**
     * @notice lets Avatar Based Accounts mint their coin allowance.
     *
     * @param coinsToMint The amount of coins to be minted. This can be any amount below or equal to their allowance.
     *
     * @dev it logs the amount of coins minted in this contract at 'coinsMinted'
     * Before minting, it retrieves the full allowance of the AvatarBasedAccount from Cards.sol and substracts the value at 'coinsMinted'.
     * This is the amount allowed to be minted.
     *
     */
    function mintCoins(uint256 coinsToMint) public onlyAvatarBasedAccount(msg.sender) {
        uint256 allowance = Cards(payable(CARDS_CONTRACT)).s_coinAllowance(msg.sender);

        if (coinsToMint + coinsMinted[msg.sender] > allowance) {
            revert Coins__MintExceedsAllowance();
        }
        coinsMinted[msg.sender] = coinsMinted[msg.sender] + coinsToMint;
        _mint(msg.sender, coinsToMint);
    }

    /* getters */
    /**
     * @notice a simple getter function to calculate the remaining allowance
     *
     * @param playerAccount The avatar based account that has an allowance.
     *
     * @dev The function has no access restrictions what so ever. Anyone can request the allowance of any player.
     *
     */
    function getRemainingAllowance(address playerAccount) external view returns (uint256 remainingAllowance) {
        uint256 allowance = Cards(payable(CARDS_CONTRACT)).s_coinAllowance(playerAccount);

        return (allowance - coinsMinted[playerAccount]);
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
