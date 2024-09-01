// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {IAvatarExecutable} from "./AvatarBasedAccount.sol"; 
import {Coins} from "./Coins.sol"; 

// chainlink VRF imports. see the docs here: https://docs.chain.link/vrf/v2-5/direct-funding/get-a-random-number
import {ConfirmedOwner} from "../lib/chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {LinkTokenInterface} from "../lib/chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {VRFV2PlusWrapperConsumerBase} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "../lib/chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/** 
* ERC-1155 based contract that stores cards structs and manages their distribution through the sell of card packs. 
* It integrates a Coins.sol contract to distributed coins on every sell of a card pack. 
* 
* Integretation with chainlink VRF for randomisation is tbi.  
*
* authors: Argos, CriptoPoeta, 7cedars
*/ 
contract Cards is ERC1155, VRFV2PlusWrapperConsumerBase, ConfirmedOwner {
    /* errors */
    error Cards__ArraysNotSameLength(uint256 lengthOne, uint256 lengthTwo);
    error Cards__OnlyAvatarBasedAccount(address playerAccount); 
    error Cards__FundRetrievalUnsuccessful(); 
    error Cards__InsufficientPayment(); 
    error Cards__OnlyOwner(address sender); 
    error Cards__NoCardsExist(); 
    
    /* Type declarations */
    struct Card {
        string name;
        string cardType; 
        uint16 atk; 
        uint16 hp; 
        uint16 spd; 
        uint16 infRange; // NB! in solidity nothing behing the comma. So we have to deal with this as full integers
        uint16 supRange; // NB! in solidity nothing behing the comma. So we have to deal with this as full integers
    }

    /* State variables */
    uint256[] public s_cardIds;
    mapping(uint256 cardId => Card card) public s_cards; // maps cardId to its characteristics. 
    uint256 public s_cardPackCounter; // tracks how many card packs have been bought. 
    uint256 public s_priceCardPack; // is the price for each pack. 
    uint256[] public s_packThresholds; // an array that holds the thresholds for decreasing amount of coins to be distributed on sell of card pack.  
    uint256[] public s_packCoinAmounts; // an array that holds the amount of coins to be distributed per threshold on sell of card pack.
    uint256 s_cardPackNumber; 
    mapping(address avatarBasedAccount => uint256 allowance) public s_coinAllowance;
    uint32 public constant NUMBER_CARDS_IN_PACK = 5; 
    address public immutable i_coins; // This allows the Coins.sol address to be read through the functions 'i_coins()'. 
    
    // chainlink VRF state vars //  
    struct VRFRequestStatus {
        uint256 paid; // amount paid in link
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256[] randomWords;
    }
    mapping(uint256 => VRFRequestStatus) public s_requests; /* requestId --> requestStatus */
    uint256[] public requestIds;  // past requests Id.
    uint256 public lastRequestId;
    uint32 public callbackGasLimit; 
    uint16 public requestConfirmations; // The default is 3, but you can set this higher.

    /* Events */
    event Log(string func, uint256 gas);
    event DeployedCardsContract(address indexed owner, address indexed coinsContract, uint256 indexed priceCardPack);  
    event ChangedCardPackPrice(uint256 newPrice, uint256 oldPrice);  
    // chainlink VRF events //  
    event RequestSent(uint256 requestId, uint32 NUMBER_CARDS_IN_PACK);
    event RequestFulfilled(
        uint256 requestId,
        uint256[] randomWords,
        uint256 payment
    );

    /* modifiers */
    modifier onlyAvatarBasedAccount(address playerAccount) {
        if (!ERC165Checker.supportsInterface(playerAccount, type(IAvatarExecutable).interfaceId)) {
            revert Cards__OnlyAvatarBasedAccount(playerAccount);
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
        uint256 priceCardPack,
        uint32 _callbackGasLimit, 
        uint16 _requestConfirmations, 
        address _wrapperAddress, 
        uint256[] memory packThresholds, // needs to be an incrementing array. 
        uint256[] memory packCoinAmounts
        ) 
            ERC1155("https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmXNViBTskhd61bjKoE8gZMXZW4dcSzPjVkkGqFdpZugFG/{id}.json") 
            ConfirmedOwner(msg.sender)
            VRFV2PlusWrapperConsumerBase(_wrapperAddress)
            {
                if (packThresholds.length != packCoinAmounts.length) {
                    revert Cards__ArraysNotSameLength(packThresholds.length, packCoinAmounts.length);
                }
                i_coins = address(new Coins());  

                s_priceCardPack = priceCardPack; 
                s_packThresholds = packThresholds; 
                s_packCoinAmounts = packCoinAmounts; 

                // Chainlink VRF
                callbackGasLimit = _callbackGasLimit;
                requestConfirmations = _requestConfirmations;  

                emit DeployedCardsContract(msg.sender, i_coins, s_priceCardPack); 
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
        while (s_cardIds.length > 0) {
            s_cardIds.pop(); 
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
     * note function to buy a pack of five random cards.
     * 
     * @param cardPackNumber The sequence number of the cardPack the player choose. It is used as salt in picking a random set of cards.   
     * 
     * note: the chance of a card appearing in a pack is defined by the amount of avaialble cards. In other words, rare cards are selected fewer times.
     * There is a (tiny) chance that a card that has been minted less than five times will be selected more than it exists. 
     * This can be fixed later.  
     *
     * emits a TransferBatch event. 
     *
     * @dev On every sale a coin allowance is given to the buyer. This amount is taken by reading 's_packThresholds' and 's_packCoinAmounts'. 
     * If a player has an allowance, they can mint coins using 'Coins.sol::mintCoins'. 
     * 
     * @dev For now, payment occurs in native currency. Should this be in a ERC-20 coin instead? 
     */
    function openCardPack(uint256 cardPackNumber) public payable onlyAvatarBasedAccount(msg.sender) returns (uint256 requestId) {
        if (msg.value < s_priceCardPack) {
            revert Cards__InsufficientPayment(); 
        }
        if (s_cardIds.length == 0) {
            revert Cards__NoCardsExist(); 
        }

        s_cardPackNumber = cardPackNumber; 
        requestId = _requestRandomWords();

        // See the rest of the function at the function 'fulfillRandomWords'. 
    } 

    /**
     * note resetsPrice of a card pack. 
     * 
     * @param newPrice The new price of a card pack.     
     *
     * emits a ChangedCardPackPrice event. 
     */
    function setPriceCardPack(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = s_priceCardPack; 

        s_priceCardPack = newPrice; 

        emit ChangedCardPackPrice(newPrice, oldPrice); 
    } 

    /**
     * note retrieves all accumulated funds from the contract.   
     *  
     */
    function retrieveFunds() public onlyOwner {
        uint256 fullBalance = address(this).balance;  
        (bool success, ) = msg.sender.call{value: fullBalance}(''); 
        if (!success) {
            revert Cards__FundRetrievalUnsuccessful(); 
        }
    }

    /**
     * note Chainlink VRF function. 
     * 
     * Natspecs TBD      
     *
     */
    function _requestRandomWords() internal returns (uint256) {
        bytes memory extraArgs = VRFV2PlusClient._argsToBytes(
            VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
        ); 
        (uint256 requestId, uint256 reqPrice) = requestRandomnessPayInNative(
            callbackGasLimit,
            requestConfirmations,
            NUMBER_CARDS_IN_PACK,
            extraArgs
        );
        s_requests[requestId] = VRFRequestStatus({
            paid: reqPrice,
            randomWords: new uint256[](0),
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, NUMBER_CARDS_IN_PACK);
        return requestId;
    }


    /**
     * note Chainlink VRF function. 
     * 
     * Natspecs TBD      
     *
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256[] memory selectedCards = new uint256[](5); 
        uint256[] memory cardsValues = new uint256[](5); 
        uint256[] memory cardIds = s_cardIds; 

        require(s_requests[_requestId].paid > 0, "request not found");
        s_requests[_requestId].fulfilled = true;

        address[] memory addressArray = new address[](cardIds.length); 
        for (uint256 i; i < s_cardIds.length; i++) {
            addressArray[i] = address(this); 
        }
        uint256[] memory balances = balanceOfBatch(addressArray, cardIds); 
        
        // step 2: create an _incremented_ array of all these balances 
        uint256[] memory incrementedArray = _incrementArray(balances);  // Note that the TOTAL amount of cards is the last value in this array. 

        for (uint256 i; i < NUMBER_CARDS_IN_PACK; i++) {
            
        uint256 pseudoRandomNumber = uint256(keccak256(abi.encode(_randomWords[i] + s_cardPackNumber))) % incrementedArray[incrementedArray.length - 1]; 
        uint256 cardId; 
        while (incrementedArray[cardId] < pseudoRandomNumber) {
            cardId++;
            }
            selectedCards[i] = cardId; 
            cardsValues[i] = 1; 
        }
        // Before execution, increase the s_cardPackCounter: cardPack is being bought.  
        s_cardPackCounter++; 

        // step 4: transfer selected Cards to Avatar.
        _safeBatchTransferFrom(
            address(this), // address from,
            msg.sender, // address to,
            selectedCards, // uint256[] memory ids,
            cardsValues, // uint256[] memory values,
            '' // bytes memory data
        );
        
        // if above did not revert: 
        // step 5, add coin allowance to the avatar based account.
        // 
        uint256 allowanceIndex;
        // step 1: read the index of the 's_cardPackCounter' (= number of sold packs) at 's_packThresholds'. 
        if (s_cardPackCounter < s_packThresholds[s_packThresholds.length - 1]) {
            while (s_packThresholds[allowanceIndex] < s_cardPackCounter) {
                allowanceIndex++;
            }
            // step 2: add the matched allowance at index to the avatar based account. 
            s_coinAllowance[msg.sender] = s_coinAllowance[msg.sender] + s_packCoinAmounts[allowanceIndex]; 
        } else {
            // step 3: if 's_cardPackCounter' was higher than the highest amount in 's_packThresholds', add 1 to the allowance. 
            s_coinAllowance[msg.sender]++; 
        }


    }

    /* internal */
    /**
    * Note: placeholder 'randomiser' function. Will be replaced with chainlink_VRF.
    * It will probably be best to call for a random number from chainlink once, and use it to return an array with five values. 
    */
    function _pseudoRandomiser(uint256 salt) internal view returns (uint256 pseudoRandomNumber) {
        pseudoRandomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            msg.sender, 
            blockhash(block.number), 
            salt
        )));
        
        return pseudoRandomNumber; 
    } 

    // turns a normal array of values into an array that increments. 
    function _incrementArray(uint256[] memory array) internal pure returns (uint256[] memory incrementArray) {
        incrementArray = new uint256[](array.length);  
        
        for (uint256 i; i < array.length; i++) {
            if (i == 0) {
                incrementArray[i] = array[i]; 
            } else {
                incrementArray[i] = incrementArray[i - 1] + array[i];
            }
        }
        return incrementArray;
    }

    /* getter functions */
    /**
     * Note: retrieves the collection of Cards of an Avatar Based Account. 
     *
     * dev: it returns an array with the length of all available cards. The values in this array represent the number of cards the account has of each card at that position of the array. 
     */
    function getCollection(address AvatarBasedAccount) public view returns (uint256[] memory cardCollection) {
        uint256[] memory cardIds = s_cardIds; 
        address[] memory addressArray = new address[](cardIds.length); 
        
        for (uint256 i; i < cardIds.length; i++) {
            addressArray[i] = AvatarBasedAccount; // this creates an array with the address of the Avatar based Account. 
        }

        cardCollection = balanceOfBatch(addressArray, s_cardIds);  
        return cardCollection; 
    }

    /**
     * Note: retrieves the collection of Cards of an Avatar Based Account. 
     *
     * dev: it returns an array with the length of all available cards. The values in this array represent the number of cards the account has of each card at that position of the array. 
     */
    function getRandomWordsRequestStatus(
        uint256 _requestId
    )
        external
        view
        returns (uint256 paid, bool fulfilled, uint256[] memory randomWords)
    {
        require(s_requests[_requestId].paid > 0, "request not found");
        VRFRequestStatus memory request = s_requests[_requestId];
        return (request.paid, request.fulfilled, request.randomWords);
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

// Code Style and Structure:
// Write concise and technical Solidity code with clear examples and precise logic.
// Prefer modularization and reuse over code duplication; use libraries and inheritance where applicable.
// Use descriptive variable names with clear intent (e.g., isCompleted, hasBalance).
// Follow the structure: main contract, libraries, modifiers, functions, events, and state variables.
// Naming Conventions:
// Use CamelCase for contract names (e.g., TokenSale).
// Use lowerCamelCase for function, variable, and modifier names (e.g., transferTokens, totalSupply).
// Prefix private or internal variables with an underscore (e.g., _owner).
// Use ALL_CAPS with underscores for constants (e.g., MAX_SUPPLY).
// Solidity Usage:
// Use Solidity version pragmas carefully; avoid floating pragmas (^) to ensure consistency across environments.
// Favor interfaces over abstract contracts when possible for interoperability.
// Use require for validation and guard clauses to fail early with meaningful error messages.
// Leverage modifiers for repetitive checks (e.g., access control).
// Syntax and Formatting:
// Use 4 spaces per indentation level; avoid tabs.
// Place the most important logic first in functions, followed by validations and finally state updates.
// Organize contracts with a clear separation between functions that read state (view/pure) and those that modify state.
// Avoid long functions; break down complex logic into smaller, reusable functions.
// Error Handling and Validation:
// Prioritize error handling with require, assert, and revert; provide clear and informative error messages.
// Use custom error types with Solidity 0.8.x for gas efficiency and clarity (e.g., error InsufficientFunds(uint256 available, uint256 required);).
// Handle edge cases explicitly and ensure proper checks are in place for input validation.
// Security Best Practices:
// Follow the Checks-Effects-Interactions pattern to avoid reentrancy attacks.
// Use OpenZeppelin libraries where applicable to prevent common vulnerabilities.
// Implement proper access control using Ownable or AccessControl patterns.
// Avoid using tx.origin for authorization; use msg.sender instead.
// Test for integer overflows/underflows and favor Solidity 0.8.x's built-in overflow protections.
// Gas Optimization:
// Minimize storage writes by using memory variables where applicable.
// Pack storage variables to reduce gas costs.
// Favor uint256 types over smaller uints for efficient gas usage.
// Use external visibility for functions that don't modify the state but are called from outside the contract.
// Batch operations where possible to reduce transaction overhead.
// Contract Structure and Design:
// Use a clear and logical inheritance structure; avoid deep inheritance trees.
// Separate contract logic from data storage when appropriate (e.g., use Proxy patterns).
// Design contracts to be upgradable if needed, but ensure rigorous testing.
// Document your code with NatSpec comments for functions, events, and complex logic.
// NatSpec Documentation:
// Use NatSpec format for all public and external functions, events, and complex logic to provide clarity and facilitate automatic documentation.
// Add a summary tag (@notice) to describe the purpose and high-level function of the contract, function, or event.
// Use the @dev tag for more detailed explanations of the logic, especially for complex or non-obvious code.
// Document all function parameters with @param, specifying the name and purpose of each parameter.
// Use the @return tag to describe return values for functions.
// Apply the @inheritdoc tag when overriding or implementing functions from a base contract or interface to inherit the documentation.
// Include custom error documentation with @custom:error, describing when and why the error is used.
// Annotate custom modifiers with the @custom:modifier tag, providing a brief explanation of their purpose.
// Use @title and @author tags at the top of each contract file to indicate the contract's name and author(s).
// Example NatSpec Usage:
// solidity
// Copiar código
// /**
//  * @title TokenSale
//  * @notice This contract handles the sale of tokens to investors.
//  * @dev Implements a simple ERC20 token sale with a fixed price.
//  */
// contract TokenSale {

//     /**
//      * @notice Buys tokens for the sender, based on the amount of Ether sent.
//      * @dev Requires that the sale is active and the amount sent is non-zero.
//      * @param beneficiary The address that will receive the purchased tokens.
//      */
//     function buyTokens(address beneficiary) external payable {
//         // Function logic
//     }

//     /**
//      * @notice Returns the remaining tokens available for sale.
//      * @dev Uses a view function to avoid altering state.
//      * @return The number of tokens left for sale.
//      */
//     function remainingTokens() external view returns (uint256) {
//         return _remainingTokens;
//     }

//     /**
//      * @custom:error InsufficientFunds
//      * @notice Thrown when the sender does not have enough balance to complete the transaction.
//      */
//     error InsufficientFunds(uint256 available, uint256 required);
// }
// Testing and Deployment:
// Write extensive unit tests using Foundry's forge test to cover all edge cases and scenarios.
// Use invariant testing and fuzzing to ensure the robustness of your contracts.
// Deploy contracts with proper initial settings; consider using a deployment script for consistency.
// Key Conventions:
// Use SPDX-License-Identifier at the top of each Solidity file to declare the license type.
// Follow the Ethereum Smart Contract Best Practices for security and design guidelines.
// Limit contract size to avoid exceeding the block gas limit, which can result in deployment issues.
// This rule set now includes guidelines for NatSpec documentation, which is essential for providing clarity and ensuring that smart contracts are well-documented and easier to understand, maintain, and audit.