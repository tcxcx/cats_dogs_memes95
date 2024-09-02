// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";

import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Coins} from "../../src/Coins.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";

import {DeployGames} from "../../script/DeployGames.s.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

contract CoinsTest is Test {
    uint256 CardPackPrice = 50_000;
    uint256[] packThresholds = [5, 15, 30, 100]; // £todo what happens after 1000 packs sold? CHECK!
    uint256[] packCoinAmounts = [500, 100, 25, 1];

    /* Type declarations */
    Cards cards;
    Games games;
    Coins coins;
    Players players;
    HelperConfig helperConfig;
    AvatarBasedAccount avatarBasedAccount;
    address avatarAccountAddress;
    address vrfWrapper;
    uint256[] mockRandomWords = [349287342, 4323452, 4235323255, 234432432432, 78978997];

    address userOne = makeAddr("UserOne");
    address userTwo = makeAddr("UserTwo");
    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    ///////////////////////////////////////////////
    ///                Modifier                 ///
    ///////////////////////////////////////////////

    modifier createUserOneAndOpenCardPack() {
        uint256 cardPackNumber = 1;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, avatarAccountAddress) = players.createPlayer(avatarUri);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();
        // 3: give userOne funds.
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);
        // 4: open pack of cards.
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        vm.prank(userOne);
        bytes memory result =
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result));
        // 5: mock callback from Chainlink VRF:
        vm.prank(vrfWrapper);
        cards.rawFulfillRandomWords(requestId, mockRandomWords);
        _;
    }

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount,) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games, helperConfig) = deployerGames.run();
        (
            , //address erc6551account;
            , // address erc6551Registry;
            vrfWrapper, // address vrfWrapper;
            , // uint16 vrfRequestConfirmations;
            // uint32 vrfCallbackGasLimit
        ) = helperConfig.activeNetworkConfig();
        coins = Coins(cards.i_coins());

        // need to fund the contract itself for Chainlink VRF - direct payments.
        vm.deal(address(cards), 100 ether);
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testCoinAllowanceIsGivenWhenOpeningPackOfCards() public {
        // prep
        uint256 cardPackNumber = 1;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(avatarUri);
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        // 2: get price pack
        uint256 priceCardPack = cards.s_priceCardPack();
        // 3: give userOne funds.
        vm.deal(userOne, 1 ether);
        vm.deal(avatarAccountAddress, 1 ether);

        // act: opening pack of cards
        vm.prank(userOne);
        bytes memory result =
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result));

        vm.prank(vrfWrapper);
        cards.rawFulfillRandomWords(requestId, mockRandomWords);

        // assert
        uint256 observedAllowance = cards.s_coinAllowance(avatarAccountAddress);
        vm.assertEq(packCoinAmounts[0], observedAllowance);
    }

    function testCoinsCanBeMintedByAvatarAccount() public createUserOneAndOpenCardPack {
        // prep: check if account received allowance.
        uint256 coinAllowance = cards.s_coinAllowance(avatarAccountAddress);
        vm.assertEq(packCoinAmounts[0], coinAllowance);

        // ACT:
        // 1: mint coins by avatar
        uint256 amountCoinsToMint = 300;
        // 2: create call data
        bytes memory callData2 = abi.encodeWithSelector(Coins.mintCoins.selector, amountCoinsToMint);
        vm.prank(userOne);
        // 3: call execute at Avatar Based Account.
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(coins), 0, callData2, 0);
        // 4: check remaining allowance
        uint256 remainingAllowance = coins.getRemainingAllowance(avatarAccountAddress);

        // ASSERT
        assert((coinAllowance - amountCoinsToMint) == remainingAllowance);
    }

    function testCoinsCannotBeMintedByUserAccount() public {
        uint256 amountCoinsToMint = 300;

        vm.expectRevert(abi.encodeWithSelector(Coins.Coins__OnlyAvatarBasedAccount.selector, userOne));
        vm.prank(userOne);
        coins.mintCoins(amountCoinsToMint);
    }

    function testAccessAllowanceOfCoinsCannotBeMinted() public createUserOneAndOpenCardPack {
        // Prep: check if account received allowance.
        uint256 coinAllowance = cards.s_coinAllowance(avatarAccountAddress);
        vm.assertEq(packCoinAmounts[0], coinAllowance);

        // ACT:
        // 1: mint coins by avatar
        uint256 amountCoinsToMint = 3000;
        // 2: create call data
        bytes memory callData2 = abi.encodeWithSelector(Coins.mintCoins.selector, amountCoinsToMint);

        vm.prank(userOne);
        // 3: call execute at Avatar Based Account.
        vm.expectRevert(Coins.Coins__MintExceedsAllowance.selector);
        AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(coins), 0, callData2, 0);
    }

    function testCoinAllowanceDecrease() public createUserOneAndOpenCardPack {
        // prep check if user one received allowance for opening pack no 1 (which means account has been succesfully created).
        uint256 coinAllowance = cards.s_coinAllowance(avatarAccountAddress);
        vm.assertEq(packCoinAmounts[0], coinAllowance);

        uint256 cardPackNumber = 1;
        uint256 priceCardPack = cards.s_priceCardPack();

        // act: opening pack of cards
        uint256 numberOfPacksToOpen = 125;
        uint256[] memory increasesAllowance = new uint256[](numberOfPacksToOpen);
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
        for (uint256 i; i < numberOfPacksToOpen; i++) {
            vm.deal(avatarAccountAddress, 1 ether);
            uint256 allowanceBefore = cards.s_coinAllowance(avatarAccountAddress);

            vm.prank(userOne);
            bytes memory result =
                AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
            uint256 requestId = uint256(bytes32(result));
            // 5: mock callback from Chainlink VRF:
            vm.prank(vrfWrapper);
            cards.rawFulfillRandomWords(requestId, mockRandomWords);

            increasesAllowance[i] = cards.s_coinAllowance(avatarAccountAddress) - allowanceBefore;
        }

        for (uint256 i = 1; i < numberOfPacksToOpen; i++) {
            assert(increasesAllowance[i - 1] >= increasesAllowance[i]);
        }
    }
}
