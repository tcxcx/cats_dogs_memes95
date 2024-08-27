// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Basic ERC-20 contract.
// but minting tokens happens on basis of cards (or packs of cards) owned.

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol"; 
import {Cards} from "./Cards.sol"; 

/** 
* A simple ERC-20 contract that lets players mint a (decreasing) share of tokens through the function 'mintCoinShare'.
* It is only possible to call this function when its parent contract allows. 
* This makes it possible to only allow minting of coins when a pack of cards is bought. 
*
* authors: Argos, CriptoPoeta, 7cedars
*/
contract Coins is ERC20 {
    /* errors */
    error Coins__IncorrectInterface(address playerAccount); 
    error Coins__MintNotAllowed(); 
    
    /* state vars */
    uint256 public constant MAX_FOREVER_SUPPLY = 42 * (10 ** 18); 
    uint256 public constant PERCENT_MINT = 5;
    uint256 public constant DECIMALS = 100;
    address public immutable i_cardsAddress; 

    /* Events */
    event DeployedCoinsContract(address indexed parentContract); 

    /* FUNCTIONS: */
    /* constructor */
    constructor() ERC20("Cats Dogs and Memes Coin", "CDM") {
        i_cardsAddress = msg.sender; 

        emit DeployedCoinsContract(msg.sender);
    }

    /* public */
    function mintCoinShare(address recipient) public {
        uint256 totalMinted = totalSupply(); 
        uint256 totalToMint = (MAX_FOREVER_SUPPLY - totalMinted) / DECIMALS * PERCENT_MINT; 

        if (!Cards(payable(i_cardsAddress)).s_mintCoinsAllowed()) {
            revert Coins__MintNotAllowed(); 
        }

        _mint(recipient, totalToMint);
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
