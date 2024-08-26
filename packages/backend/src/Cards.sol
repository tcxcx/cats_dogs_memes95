// SPDX-License-Identifier: MIT
// Basic ERC-721 or ERC-1155 contract. 
// Manages cards, buying packs of cards. 
// Buying packs of cards. use chainlink VRF for randomisation.    
// Cards content + characteristics created by Itu. 

pragma solidity ^0.8.0;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol"; 

contract Cards is ERC1155 {
    /* errors */
    error Cards__ArraysNotSameLength(uint256 cardsLength, uint256 mintAmountLength);
    error Cards__IncorrectInterface(address playerAccount); 
    error Cards__FundRetrievalUnsuccessful(); 
    error Cards__InsufficientPayment(); 
    error Cards__OnlyOwner(); 
    error Cards__NoCardsExist(); 
    
    /* Type declarations */
    enum CardType { 
        Cat, 
        Dog, 
        Meme
    } 

    // struct has been taken from overview Itu: https://docs.google.com/spreadsheets/d/1aNNvr-jrMtzJW7glVkGedl47kQESOx0Vs02NA0MqMfs/edit?gid=0#gid=0
    struct Card {
        string name;
        string cardType; 
        uint16 atk; 
        uint16 hp; 
        uint16 spd; 
        int16 volumeThreshold; 
        int16 areaThreshold; 
        int16 perimeterThreshold; 
        uint16 ProbPull; // NB! in solidity nothing behing the comma. So we have to deal with this as full integeres
        uint16 InfRange; // NB! in solidity nothing behing the comma. So we have to deal with this as full integeres
        uint16 SupRange; // NB! in solidity nothing behing the comma. So we have to deal with this as full integeres
    }
    

    /* State variables */
    uint256[] public s_cardIds;
    mapping(uint256 cardId => Card card) public s_cards; // maps cardId to its characteristics. 
    address public s_owner;
    uint256 public s_priceCardPack; 
    
    /* Events */
    event Log(string func, uint256 gas);
    event ChangedCardPackPrice(uint256 newPrice, uint256 oldPrice);  

    /* modifiers */
    modifier onlyOwner() {
        if (msg.sender != s_owner) {
            revert Cards__OnlyOwner();
        }
        _;
    }

    modifier onlyAvatarBasedAccount(address playerAccount) {
        if (!ERC165Checker.supportsInterface(playerAccount, type(IAvatarExecutable).interfaceId)) {
            revert Cards__IncorrectInterface(playerAccount);
        }
        _;
    }

    /* FUNCTIONS: */
    /* constructor */
    /**
     * Note Sets up the base cards contract. 
     * 
     * dev: It does NOT upload any cards yet, this is done later through the 'createCards' function. 
     *
     */
    constructor(
        uint256 priceCardPack
        ) ERC1155("https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmXNViBTskhd61bjKoE8gZMXZW4dcSzPjVkkGqFdpZugFG/{id}.json") {
            s_owner = msg.sender;
            s_priceCardPack = priceCardPack; 
    }

    /* receive & fallback */ 
    /**
     * Note Necessary because this is a payable contract. Avoids unpredictable behaviour / errors. 
     *
     * copied from https://solidity-by-example.org/fallback/
     */
    fallback() external payable {
        emit Log("fallback", gasleft());
    }

    receive() external payable {
        emit Log("receive", gasleft());
    }

    /* public */
    /**
    * Note function to save cards to the contract storage. 
    * 
    * @param cards an array of Card structs holding the characteristics of cards. 
    * @param mintAmounts an array of uint256s. The amount of cards that needs to be minted.  
    * @param newuri a uri string to the folder that holds the uri to the image of the card. See the ERC-1155 explanation at openzeppeling for more info: https://docs.openzeppelin.com/contracts/4.x/erc1155 
    *
    * note: the cards and mintAmounts arrays need to be of the same length. 
    * note: the folder of uri data needs to have the same amount of items as the length of cards and mintAmount arrays. 
    * note: cards are owned by this contract. Not the owner of the contract. 
    *
    * emits a transferBatch event. 
    */
    function createCards(Card[] memory cards, uint256[] memory mintAmounts, string memory newuri) public onlyOwner  {
        // check if data provided is correct
        if (cards.length != mintAmounts.length) {
            revert Cards__ArraysNotSameLength(cards.length, mintAmounts.length); 
        }
        // delete the array of cardIds; 
        if (s_cardIds.length > 0) {
            for (uint256 i; i < s_cardIds.length; i++) {
                s_cardIds.pop(); 
            }
        }
        // save cards to storage. 
        for (uint256 i; i < cards.length; i++) {
            s_cardIds.push(i); // this creates an array with the ids of our cards: [0, 1, 2, 3, ...]
            s_cards[i] = cards[i]; // mapping the cardId to card characteristics.  
        }
        // set the uri; 
        _setURI(newuri);

        // mint cards
        _mintBatch(address(this), s_cardIds, mintAmounts, ''); 
    } 

    /**
     * note function buy a pack of five random cards.
     * 
     * note: the function does not have any params, but DOES take a value in native currency of the chain. 
     * 
     * 
     * note: the chance of a card appearing in a pack is defined by the amount of avaialble cards. In other words, rare cards are selected fewer times.
     * There is a (tiny) chance that a card that has been minted less than five times will be selected more than it exists. 
     * This can be fixed later.  
     *
     * emits a TransferBatch event. 
     * 
     * dev For now, payment occurs in native currency. Should this be in a ERC-20 coin instead? 
     */
    function openCardPack() public payable onlyAvatarBasedAccount(msg.sender) {
        uint256[] memory selectedCards = new uint256[](5); 
        uint256[] memory cardsValues = new uint256[](5); 
        uint256[] memory cardIds = s_cardIds; 

        // checks   
        if (msg.value < s_priceCardPack) {
            revert Cards__InsufficientPayment(); 
        }

        if (s_cardIds.length == 0) {
            revert Cards__NoCardsExist(); 
        }

        // step 1: get current balance owner of all existing cards. 
        address[] memory addressArray = new address[](s_cardIds.length); 
        for (uint256 i; i < s_cardIds.length; i++) {
            addressArray[i] = address(this); 
        }
        uint256[] memory balances = balanceOfBatch(addressArray, s_cardIds); 
        
        // step 2: create an _incremented_ array of all these balances 
        uint256[] memory incrementedArray = _incrementArray(balances);  // Note that the TOTAL amount of cards is the last value in this array. 

        // step 3: for each of the five cards, we retrieve a value between 0 and total amount of cards. This is used to select the cardId and add it to the CardPack object.
        for (uint256 i; i < 5; i++) {
            uint256 pseudoRandomNumber = _pseudoRandomiser(i) % incrementedArray[incrementedArray.length - 1]; 
            uint256 cardId; 
            while (incrementedArray[cardId] < pseudoRandomNumber) {
                cardId++;
            }
            selectedCards[i] = cardId; 
            cardsValues[i] = 1; 
        }

        // step 4: transfer selected Cards to Avatar.
        _safeBatchTransferFrom(
            address(this), // address from,
            msg.sender, // address to,
            selectedCards, // uint256[] memory ids,
            cardsValues, // uint256[] memory values,
            '' // bytes memory data
        );
        
    } 

    function setPriceCardPack(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = s_priceCardPack; 

        s_priceCardPack = newPrice; 

        emit ChangedCardPackPrice(newPrice, oldPrice); 
    } 

    function retrieveFunds() public onlyOwner {
        uint256 fullBalance = address(this).balance;  
        (bool success, ) = address(this).call{value: fullBalance}(''); 
        if (!success) {
            revert Cards__FundRetrievalUnsuccessful(); 
        }
    } 

    /* internal */
    /**
    * Note: placeholder 'randomiser' function. Will be replaced with chainlink_VRF.
    * It will probably be best to call for a random number from chainlink once, and use it to return an array with five values. 
    */
    function _pseudoRandomiser(uint256 salt) internal returns (uint256 pseudoRandomNumber) {
        pseudoRandomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            msg.sender, 
            blockhash(block.number), 
            salt
        )));
        
        return pseudoRandomNumber; 
    } 

    // turns a normal array of values into an array that increments. 
    function _incrementArray(uint256[] memory array) public view returns (uint256[] memory incrementArray) {
        uint256[] memory incrementArray = new uint256[](array.length);  
        
        for (uint256 i; i < array.length; i++) {
            if (i == 0) {
                incrementArray[i] = array[i]; 
            } else {
                incrementArray[i] = incrementArray[i - 1] + array[i];
            }
        }
        return incrementArray;
    }

    function _setURI(string memory newuri) internal override {
        super._setURI(newuri);
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override {
        super._safeBatchTransferFrom(
            from, to, ids, amounts, data
        ); 
    }

    /* getter functions */
    /**
     * notice: retrieves the collection of Cards of an Avatar Based Account. 
     *
     * dev: it returns an array with the length of all available cards. The values in this array represent the number of cards the account has of each card at that position of the array. 
     */
    function getCollection(address AvatarBasedAccount) public view returns (uint256[] memory cardCollection) {
        uint256[] memory cardIds = s_cardIds; 
        address[] memory addressArray = new address[](cardIds.length); 
        
        for (uint256 i; i < cardIds.length; i++) {
            addressArray[i] = AvatarBasedAccount; // this creates an array with the address of the Avatar based Account. 
        }

        uint256[] memory cardCollection = balanceOfBatch(addressArray, s_cardIds);  
        return cardCollection; 
    }

    /**
     * @dev needed to receive ERC 1155 tokens
     */
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
     * @dev needed to receive ERC 1155 tokens
     */
    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory)
        public
        virtual
        returns (bytes4)
    {
        return this.onERC1155BatchReceived.selector;
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