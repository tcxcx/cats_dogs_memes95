// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "lib/forge-std/src/Test.sol"; // remappings do not work correctly in my vscode. 
import {Players} from "../../src/Players.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  
import {DeployRegistry} from "lib/reference/script/DeployRegistry.s.sol";  


contract PlayersTest is Test {
    
    Players players;
    AvatarBasedAccount avatarBasedAccount;

    address userOne = makeAddr("UserOne"); 
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";
  
    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // first have to deploy the ERC-6551 registry... 
        DeployRegistry deployerRegistry = new DeployRegistry(); 
        deployerRegistry.run(); 

        DeployPlayers deployer = new DeployPlayers();
        (players, avatarBasedAccount) = deployer.run();
    }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////
    function testPlayersHasOwner() public {
        address ownerPlayers = players.s_owner(); 

        assertNotEq(address(0), ownerPlayers);
    }

    function testPlayersCanDeployNewPlayer() public {
        // action 
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(avatarUri);

        console2.logString("avatarId and avatarAccountAddress:"); 
        console2.logUint(avatarId); 
        console2.logAddress(avatarAccountAddress); 

        // assert 
        assertNotEq(address(0), avatarAccountAddress);
        assertEq(0, avatarId);
    }

    function testPlayersGivesAddressOfExistingAvatar() public {
        vm.prank(userOne);
        (uint256 avatarId, address avatarAccountAddress) = players.createPlayer(avatarUri);
        
        address avatarAccountAddressChecked = players.getAvatarAddress(avatarId);

        assertEq(avatarAccountAddress, avatarAccountAddressChecked);
    }

    function testPlayersRevertsWithNonExistingAvatar() public {
        uint256 nonExistentAvatarId = 10; 
        vm.expectRevert(); // £todo define revert. 
        address avatarAccountAddressChecked = players.getAvatarAddress(nonExistentAvatarId);
    }

}
