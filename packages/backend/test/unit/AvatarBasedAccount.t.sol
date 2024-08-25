// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console, console2} from "forge-std/Test.sol";
import {Players} from "../../src/Players.sol";
import {AvatarBasedAccount} from "../../src/AvatarBasedAccount.sol";
import {DeployPlayers} from "../../script/DeployPlayers.s.sol";  

contract AvatarBasedAccountTest is Test {

    AvatarBasedAccount avatarBasedAccount;
    Players players;

    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        // DeployPlayers deployer = new DeployPlayers();
        // (loyaltyProgram, loyaltyCard6551Account) = deployer.run();
        // ownerProgram = loyaltyProgram.getOwner(); 

        // console2.log("address loyaltyCard6551Account:" , address(loyaltyCard6551Account)); 

        // DeployMockLoyaltyGifts deployerGifts = new DeployMockLoyaltyGifts(); 
        // (mockLoyaltyGifts) = deployerGifts.run();

        // DeployMockERC1155 deployerERC1155 = new DeployMockERC1155(); 
        // (mockERC1155) = deployerERC1155.run();
    }


    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////



}
