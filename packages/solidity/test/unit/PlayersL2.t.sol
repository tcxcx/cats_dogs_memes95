// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";
import {PlayersL2} from "../../src/PlayersL2.sol";
import {AvatarBasedAccount} from "../../src/AbaOptimismToMainnet.sol";
import {DeployPlayersL2} from "../../script/DeployPlayersL2.s.sol";

contract PlayersL2Test is Test {
    // PlayersL2 playersL2;
    // AvatarBasedAccount avatarBasedAccount;

    // address userOne = makeAddr("UserOne");
    // string avatarUri =
    //     "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    // ///////////////////////////////////////////////
    // ///                   Setup                 ///
    // ///////////////////////////////////////////////
    // function setUp() external {
    //     DeployPlayersL2 deployer = new DeployPlayersL2();
    //     (playersL2, avatarBasedAccount,) = deployer.run();
    // }

    // ///////////////////////////////////////////////
    // ///                   Tests                 ///
    // ///////////////////////////////////////////////
    // function testPlayersL2HasOwner() public {
    //     address ownerPlayersL2 = playersL2.OWNER();

    //     assertNotEq(address(0), ownerPlayersL2);
    // }

    // function testPlayersL2CanDeployNewPlayer() public {
    //     // action
    //     vm.prank(userOne);
    //     (uint256 avatarId, address avatarAccountAddress) = playersL2.createL2Player(avatarUri);

    //     console2.log("avatarId:", avatarId);
    //     console2.log("avatarAccountAddress:", avatarAccountAddress);

    //     // assert
    //     assertNotEq(address(0), avatarAccountAddress);
    //     assertEq(0, avatarId);
    // }

    // function testPlayersL2GivesAddressOfExistingAvatar() public {
    //     vm.prank(userOne);
    //     (uint256 avatarId, address avatarAccountAddress) = playersL2.createL2Player(avatarUri);

    //     address avatarAccountAddressChecked = playersL2.getAvatarAddress(avatarId);

    //     assertEq(avatarAccountAddress, avatarAccountAddressChecked);
    // }

    // function testPlayersL2RevertsWithNonExistingAvatar() public {
    //     uint256 nonExistentAvatarId = 10;
    //     vm.expectRevert(); // £todo define revert.
    //     address avatarAccountAddressChecked = playersL2.getAvatarAddress(nonExistentAvatarId);
    // }
}
