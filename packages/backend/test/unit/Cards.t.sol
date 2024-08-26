// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "lib/forge-std/src/Test.sol"; // remappings do not work correctly in my vscode. 
import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployCards} from "../../script/DeployCards.s.sol"; 
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployRegistry} from "lib/reference/script/DeployRegistry.s.sol";  

contract CardsTest is Test {
    /* Type declarations */
    Cards cards;
    Players players;  
    AvatarBasedAccount avatarBasedAccount;

    address userOne = makeAddr("UserOne"); 
    address userTwo = makeAddr("UserTwo"); 
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";


    /////////////////////////////////////////////// 
    ///                 Modifiers               ///
    ///////////////////////////////////////////////

    modifier createCards() {
        address ownerCards = cards.s_owner(); 
        uint256[] memory mintAmounts = new uint256[](9); 
        Cards.Card[] memory CardData = new Cards.Card[](9); 
        string memory newuri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmXNViBTskhd61bjKoE8gZMXZW4dcSzPjVkkGqFdpZugFG/{id}.json"; 
        for (uint256 i; i < 9; i++) { 
          mintAmounts[i] = i * 2; 
        }  
        CardData[0] = Cards.Card({name: "Abyssinian", cardType: 'Cat', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307}); 
        CardData[1] = Cards.Card({name: "American Shorthair", cardType: 'Cat', atk: 3, hp: 4, spd: 10, volumeThreshold: -5, areaThreshold: 14, perimeterThreshold: 8, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[2] = Cards.Card({name: "Bengal", cardType: 'Cat', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[3] = Cards.Card({name: "Australian Shepherd", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[4] = Cards.Card({name: "Beagle", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[5] = Cards.Card({name: "Boxer", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[6] = Cards.Card({name: "Baby Doge Coin", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[7] = Cards.Card({name: "Bonk", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[8] = Cards.Card({name: "Book Of Meme", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});

        // act 
        vm.prank(ownerCards); 
        cards.createCards(CardData, mintAmounts, newuri);

      _;
    }

  
    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // deploying the ERC-6551 registry... 
        DeployRegistry deployerRegistry = new DeployRegistry(); 
        deployerRegistry.run(); 

        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount) = deployerPlayers.run();

        DeployCards deployerCards = new DeployCards();
        cards = deployerCards.run();
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testCardsContractHasOwner() public { 
      address owner = cards.s_owner(); 
      assert(owner != address(0));  
    }

    function testCardsPackHasPrice() public { 
      uint256 price = cards.s_priceCardPack(); 
      
      console.log("price cardsPack:" , price);
      assert(price != 0);
    }

    function testCardsContractCanReceiveFunds() public {
      // £TODO test emit event + balance increase. 
    }

    function testOwnerCanRetrieveFunds() public {
      //  £TODO  test emit event + balance increase. 
    }

    function testCardsCanBeCreated() public {
        address ownerCards = cards.s_owner(); 
        uint256[] memory mintAmounts = new uint256[](9); 
        Cards.Card[] memory CardData = new Cards.Card[](9); 
        string memory newuri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmXNViBTskhd61bjKoE8gZMXZW4dcSzPjVkkGqFdpZugFG/{id}.json"; 
        for (uint256 i; i < 9; i++) { 
          mintAmounts[i] = i * 2; 
        }  
        CardData[0] = Cards.Card({name: "Abyssinian", cardType: 'Cat', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307}); 
        CardData[1] = Cards.Card({name: "American Shorthair", cardType: 'Cat', atk: 3, hp: 4, spd: 10, volumeThreshold: -5, areaThreshold: 14, perimeterThreshold: 8, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[2] = Cards.Card({name: "Bengal", cardType: 'Cat', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[3] = Cards.Card({name: "Australian Shepherd", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[4] = Cards.Card({name: "Beagle", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[5] = Cards.Card({name: "Boxer", cardType: 'Dog', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[6] = Cards.Card({name: "Baby Doge Coin", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[7] = Cards.Card({name: "Bonk", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});
        CardData[8] = Cards.Card({name: "Book Of Meme", cardType: 'Meme', atk: 7, hp: 10, spd: 2, volumeThreshold: 15, areaThreshold: 58, perimeterThreshold: 16, ProbPull: 6, InfRange: 301, SupRange: 307});

        // act 
        vm.prank(ownerCards); 
        cards.createCards(CardData, mintAmounts, newuri);

        // assert
        uint256 cardId = cards.s_cardIds(7); 
        assert(cardId == 7); 
    }

    function testOpenCardPackAssignsFiveRandomCards() public createCards {
        // prep
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(avatarUri);
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();  
        // 3: give userOne funds. 
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);  

        vm.prank(userOne);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);

        uint256[] memory collection = cards.getCollection(avatarAccountAddress); 
      
    }

    function testOpenCardPackRevertsIfNotFromAvatarBasedAccount() public {

    }

    function testOpenCardPackRevertsIfInssufficientPayment() public {
      
    }

    function testGetCollectionReturnsCorrectCollection() public {
      
    }

}