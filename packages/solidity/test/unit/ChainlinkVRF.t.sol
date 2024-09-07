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

contract ChainLinkVRFTest is Test {
    /* Type declarations */
    Cards cards;
    Games games;
    Coins coins;
    Players players;
    HelperConfig helperConfig;
    AvatarBasedAccount avatarBasedAccount;
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
        coins = Coins(cards.COINS_CONTRACT());

        // need to fund the contract itself for Chainlink VRF - direct payments.
        vm.deal(address(cards), 100 ether);
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testVRFReturnsWithRandomValue() public {
        vm.txGasPrice(1 gwei);
        // _mockGasOraclePriceFeeMethods();

        uint256 cardPackNumber = 1;
        // 1: create Avatar Based Account
        vm.prank(userOne);
        (, address avatarAccountAddress) = players.createPlayer(0);
        vm.deal(avatarAccountAddress, 1 ether);
        // 2: get price pack
        uint256 priceCardPack = cards.PRICE_CARD_PACK();

        // 3: create callData for opening pack of cards.
        bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);

        // act: opening pack of cards
        vm.prank(userOne);
        bytes memory result =
            AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);
        uint256 requestId = uint256(bytes32(result));

        // Mock callback from vrfWrapper
        vm.prank(vrfWrapper);
        cards.rawFulfillRandomWords(requestId, mockRandomWords);

        (uint256 paid, bool fullfilled, address requester) = cards.s_requests(requestId);
        console.log("paid: ", paid);
        console.log("fullfilled: ", fullfilled);
        console.log("requester:", requester);
    }
}
