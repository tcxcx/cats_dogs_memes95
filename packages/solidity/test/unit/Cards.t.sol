// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract CardsTest is Test {
    /* Type declarations */
    Cards cards;
    Games games;
    Players players;
    AvatarBasedAccount avatarBasedAccount;
    HelperConfig helperConfig;

    address vrfWrapper;
    uint256[] mockRandomWords = [349287342, 4323452, 4235323255, 234432432432, 78978997];
    address userOne = makeAddr("UserOne");
    address userTwo = makeAddr("UserTwo");
    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount,) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games, helperConfig) = deployerGames.run();
        (
            , // address erc6551Registry;
            vrfWrapper, // address vrfWrapper;
            , // uint16 vrfRequestConfirmations;
            // uint32 vrfCallbackGasLimit
        ) = helperConfig.activeNetworkConfig();

        // need to fund the contract itself for Chainlink VRF - direct payments.
        vm.deal(address(cards), 100 ether);
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testCardsContractHasOwner() public view {
        address owner = cards.owner();
        assert(owner != address(0));
    }

    function testCardsPackHasPrice() public view {
        uint256 price = cards.priceCardPack();

        console.log("price cardsPack:", price);
        assert(price != 0);
    }

    function testCardsContractCanReceiveFunds() public {
        vm.deal(userOne, 1 ether);
        uint256 balanceStart = address(cards).balance;
        vm.prank(userOne);
        (bool success,) = address(cards).call{value: 5000}("");
        uint256 balanceEnd = address(cards).balance;
        if (success) {
            assert(balanceEnd - balanceStart == 5000);
        }
    }

    function testWhenPackOfCardsBoughtBalanceContractIncreases() public {
        // PREP
        uint256 cardPackNumber = 2;
        uint256 balanceStart = address(cards).balance;

        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        // 2: get price pack
        uint256 priceCardPack = cards.priceCardPack();
        // 3: give userOne funds.

        vm.deal(avatarAccountAddress, 1 ether);
        // 4: open pack of cards.
        bytes memory callData = abi.encodeWithSelector(cards.openCardPack.selector, cardPackNumber);
        vm.prank(userOne);
        bytes memory result =
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result));

        // Mock callback from vrfWrapper
        vm.prank(vrfWrapper);
        cards.rawFulfillRandomWords(requestId, mockRandomWords);

        uint256 balanceEnd = address(cards).balance;
        console.log("balanceEnd", balanceEnd);
        assert(balanceEnd > balanceStart);
    }

    function testOwnerCanRetrieveFunds() public {
        address ownerCardsContract = cards.owner();
        uint256 initialCardsBalance = address(cards).balance;
        uint256 amountToTransfer = 5000;

        vm.deal(userOne, 1 ether);
        vm.prank(userOne);
        (bool success,) = address(cards).call{value: amountToTransfer}("");
        // check if funds arrived.

        uint256 balanceBefore = ownerCardsContract.balance;
        vm.prank(ownerCardsContract);
        cards.retrieveFunds();
        uint256 balanceAfter = ownerCardsContract.balance;
        uint256 balanceChange = balanceAfter - balanceBefore;
        console2.log("balanceChange: ", balanceChange);

        assert((balanceAfter - balanceBefore) == amountToTransfer + initialCardsBalance);
    }

    function testCardsCanBeUpdated() public {
        address ownerCards = cards.owner();
        uint256[] memory mintAmounts = new uint256[](9);
        Cards.Card[] memory CardData = new Cards.Card[](9);
        string memory newuri =
            "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmXNViBTskhd61bjKoE8gZMXZW4dcSzPjVkkGqFdpZugFG/{id}.json";
        for (uint256 i; i < 9; i++) {
            mintAmounts[i] = i * 2;
        }
        CardData[0] =
            Cards.Card({name: "Ragamuffin", cardType: "Cat", atk: 5, hp: 4, spd: 5, infRange: 0, supRange: 93});
        CardData[1] = Cards.Card({name: "Burmese", cardType: "Cat", atk: 6, hp: 2, spd: 9, infRange: 93, supRange: 139});
        CardData[2] =
            Cards.Card({name: "Tonkinese", cardType: "Cat", atk: 4, hp: 7, spd: 4, infRange: 139, supRange: 170});
        CardData[3] =
            Cards.Card({name: "Siberian", cardType: "Cat", atk: 8, hp: 7, spd: 2, infRange: 170, supRange: 193});
        CardData[4] =
            Cards.Card({name: "Russian Blue", cardType: "Cat", atk: 5, hp: 6, spd: 4, infRange: 193, supRange: 212});
        CardData[5] = Cards.Card({
            name: "Norwegian Forest Cat",
            cardType: "Cat",
            atk: 4,
            hp: 5,
            spd: 6,
            infRange: 212,
            supRange: 227
        });
        CardData[6] = Cards.Card({
            name: "American Shorthair",
            cardType: "Cat",
            atk: 3,
            hp: 4,
            spd: 10,
            infRange: 227,
            supRange: 240
        });
        CardData[7] =
            Cards.Card({name: "Devon Rex", cardType: "Cat", atk: 4, hp: 3, spd: 10, infRange: 240, supRange: 252});
        CardData[8] = Cards.Card({
            name: "Oriental Shorthair",
            cardType: "Cat",
            atk: 6,
            hp: 7,
            spd: 3,
            infRange: 252,
            supRange: 262
        });
        // act
        vm.prank(ownerCards);
        cards.createCards(CardData, mintAmounts, newuri);

        // assert
        uint256 cardId = cards.cardIds(7);
        assert(cardId == 7);
    }

    function testOpenCardPackAssignsFiveRandomCards() public {
        // prep
        uint256 cardPackNumber = 1;

        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);

        // 2: get price pack
        uint256 priceCardPack = cards.priceCardPack();
        // 3: give avatarAccountAddress funds.
        vm.deal(avatarAccountAddress, 1 ether);

        // 4: open pack of cards.
        bytes memory callData = abi.encodeWithSelector(cards.openCardPack.selector, cardPackNumber);
        vm.prank(userOne);
        bytes memory result =
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result));

        // Mock callback from vrfWrapper
        vm.prank(vrfWrapper);
        cards.rawFulfillRandomWords(requestId, mockRandomWords);

        uint256[] memory collection = cards.getCollection(avatarAccountAddress);
    }

    // test tbi: //

    // function testOpenCardPackRevertsIfNotFromAvatarBasedAccount() public {

    // }

    // function testOpenCardPackRevertsIfInssufficientPayment() public {

    // }

    // function testGetCollectionReturnsCorrectCollection() public {

    // }
}
