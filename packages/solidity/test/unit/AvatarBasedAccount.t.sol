// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {Cards} from "../../src/Cards.sol";
import {Games} from "../../src/Games.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";
import {DeployGames} from "../../script/DeployGames.s.sol";

contract AvatarBasedAccountTest is Test {
    /* Type declarations */
    Cards cards;
    Games games;
    Players players;
    AvatarBasedAccount avatarBasedAccount;
    uint256 ethSepoliaFork;
    
    address userOne = makeAddr("UserOne");
    address userTwo = makeAddr("UserTwo");
    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        string memory SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
        ethSepoliaFork = vm.createSelectFork(SEPOLIA_RPC_URL);

        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount,) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games,) = deployerGames.run();

        // need to fund the contract itself for Chainlink VRF - direct payments.
        vm.deal(address(cards), 100 ether);
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////
    function testAvatarBasedAccountCanExecuteFunction() public {
        // setup:
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(0);

        bytes memory callData = abi.encodeWithSelector(Cards.getCollection.selector, userOne);

        vm.prank(userOne);
        bytes memory result = AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), 0, callData, 0);

        // better to request cards -- implement in a bit.
    }

    function testAvatarBasedAccountRevertsIfNotOwned() public {
        // setup:
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(0);

        bytes memory callData = abi.encodeWithSelector(Cards.getCollection.selector, userOne);

        vm.prank(userTwo);
        vm.expectRevert("Invalid signer");
        bytes memory result = AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), 0, callData, 0);

        // console.log("return value:", collection[0]);
    }
}
