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
    error Coins__OnlyAvatarBasedAccount(address playerAccount); 
    error Coins__MintExceedsAllowance(); 
    
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
    constructor() ERC20("Cats Dogs and Memes Coin", "CDM") {
        i_cardsAddress = msg.sender; 

        emit DeployedCoinsContract(msg.sender);
    }

    /* public */
    function mintCoins(uint256 coinsToMint) public onlyAvatarBasedAccount(msg.sender) {
        uint256 allowance = Cards(payable(i_cardsAddress)).s_coinAllowance(msg.sender);  

        if (coinsToMint + s_coinsMinted[msg.sender] > allowance) {
            revert Coins__MintExceedsAllowance(); 
        }
        s_coinsMinted[msg.sender] = s_coinsMinted[msg.sender] + coinsToMint; 
        _mint(msg.sender, coinsToMint);
    }

    /* getters */ 
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
