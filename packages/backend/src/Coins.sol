// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
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
*/
contract Coins is ERC20 {
    /* errors */
    error Coins__OnlyAvatarBasedAccount(address playerAccount); 
    error Coins__MintExceedsAllowance(); 
    error Coins__constructorCanOnlyBeCalledByCardsConrtact(address caller); 
    
    /* state vars */
    address public immutable i_cardsAddress; 
    mapping(address avatarBasedAccount => uint256 coinsMinted) public s_coinsMinted;

    /* Events */
    event DeployedCoinsContract(address indexed parentContract); 

    /* Modifiers */
    modifier onlyAvatarBasedAccount(address playerAccount) {
        if (!ERC165Checker.supportsInterface(playerAccount, type(IAvatarExecutable).interfaceId)) { 
            revert Coins__OnlyAvatarBasedAccount(playerAccount);
        }
        _;
    }

    /* FUNCTIONS: */
    /* constructor */
    /**
     * Note Sets up the coins contract. 
     *
     * Does not take any params. Name and Symbol is hard coded into the contract. 
     * 
     * dev: it sets msg.sender as the i_cardAddress. This has to be a card address. The check for this is currently commented out. 
     * When a non-Cards.sol contract is used to create this contract, it will not function.   
     *
     */
    constructor() ERC20("Cats Dogs and Memes Coin", "CDM") {
        // £TODO: the interface of ICards proves hard to setup. Not quite clear why - yet. Come back to this later.  
        // if (!ERC165Checker.supportsInterface(msg.sender, type(ICards).interfaceId)) {
        //     revert Coins__constructorCanOnlyBeCalledByCardsConrtact(msg.sender);
        // }
        i_cardsAddress = msg.sender; 

        emit DeployedCoinsContract(msg.sender);
    }

    /* public */
    /**
     * Note lets Avatar Based Accounts mint their coin allowance. 
     *
     * @param coinsToMint The amount of coins to be minted. This can be any amount below or equal to their allowance. 
     *
     * dev: it logs the amount of coins minted in this contract at 's_coinsMinted'
     * Before minting, it retrieves the full allowance of the AvatarBasedAccount from Cards.sol and substracts the value at 's_coinsMinted'.
     * This is the amount allowed to be minted.  
     * 
     */
    function mintCoins(uint256 coinsToMint) public onlyAvatarBasedAccount(msg.sender) {
        uint256 allowance = Cards(payable(i_cardsAddress)).s_coinAllowance(msg.sender);  

        if (coinsToMint + s_coinsMinted[msg.sender] > allowance) {
            revert Coins__MintExceedsAllowance(); 
        }
        s_coinsMinted[msg.sender] = s_coinsMinted[msg.sender] + coinsToMint; 
        _mint(msg.sender, coinsToMint);
    }

    /* getters */ 
    /**
     * Note a simple getter function to calculate the remaining allowance 
     *
     * @param playerAccount The avatar based account that has an allowance. 
     *
     * dev: The function has no access restrictions what so ever. Anyone can request the allowance of any player. 
     * 
     */
    function getRemainingAllowance(address playerAccount) external view returns (uint256 remainingAllowance) {
        uint256 allowance = Cards(payable(i_cardsAddress)).s_coinAllowance(playerAccount);

        return (allowance - s_coinsMinted[playerAccount]); 
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
