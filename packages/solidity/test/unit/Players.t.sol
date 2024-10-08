// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "@forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";

contract PlayersTest is Test {
    Players players;
    AvatarBasedAccount avatarBasedAccount;
    
    uint256 ethSepoliaFork;
    address userOne = makeAddr("UserOne");
    string avatarUri =
        "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        string memory SEPOLIA_RPC_URL = vm.envString("SEPOLIA_RPC_URL");
        ethSepoliaFork = vm.createSelectFork(SEPOLIA_RPC_URL);
        
        DeployPlayers deployer = new DeployPlayers();
        (players, avatarBasedAccount,) = deployer.run();
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////
    function testPlayersHasOwner() public {
        address ownerPlayers = players.OWNER();

        assertNotEq(address(0), ownerPlayers);
    }

    function testPlayersCanDeployNewPlayer() public {
        // action
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(0);

        console2.log("avatarId:", avatarId);
        console2.log("avatarAccountAddress:", avatarAccountAddress);

        // assert
        assertNotEq(address(0), avatarAccountAddress);
        assertEq(0, avatarId);
    }

    function testPlayersGivesAddressOfExistingAvatar() public {
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(0);

        address avatarAccountAddressChecked = players.getAvatarAddress(avatarId);

        assertEq(avatarAccountAddress, avatarAccountAddressChecked);
    }

    function testPlayersRevertsWithNonExistingAvatar() public {
        uint256 nonExistentAvatarId = 10;
        vm.expectRevert(); // £todo define revert.
        address avatarAccountAddressChecked = players.getAvatarAddress(nonExistentAvatarId);
    }
}
