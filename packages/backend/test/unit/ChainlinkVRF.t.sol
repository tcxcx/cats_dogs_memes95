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

contract ChainLinkVRFTest is Test {
    /* Type declarations */
    Cards cards;
    Games games;
    Players players;  
    AvatarBasedAccount avatarBasedAccount;
  
    address constant OVM_GASPRICEORACLE_ADDR = address(0x420000000000000000000000000000000000000F);
    address userOne = makeAddr("UserOne"); 
    address userTwo = makeAddr("UserTwo"); 
    string avatarUri = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ";
  
    ///////////////////////////////////////////////
    ///                   Setup                 ///
    ///////////////////////////////////////////////
    function setUp() external {
        DeployPlayers deployerPlayers = new DeployPlayers();
        (players, avatarBasedAccount, ) = deployerPlayers.run();

        DeployGames deployerGames = new DeployGames();
        (cards, games, ) = deployerGames.run();

        // need to fund the contract itself for Chainlink VRF - direct payments.  
        vm.deal(address(cards), 100 ether);
    }

    // function _mockGasOraclePriceFeeMethods() internal {
    //  // these values are taken from an example transaction on Base Sepolia
    //   vm.mockCall(
    //     OVM_GASPRICEORACLE_ADDR,
    //     abi.encodeWithSelector(bytes4(keccak256("l1BaseFee()"))),
    //     abi.encode(64273426165)
    //   );
    //   vm.mockCall(
    //     OVM_GASPRICEORACLE_ADDR,
    //     abi.encodeWithSelector(bytes4(keccak256("baseFeeScalar()"))),
    //     abi.encode(1101)
    //   );
    //   vm.mockCall(
    //     OVM_GASPRICEORACLE_ADDR,
    //     abi.encodeWithSelector(bytes4(keccak256("blobBaseFeeScalar()"))),
    //     abi.encode(659851)
    //   );
    //   vm.mockCall(
    //     OVM_GASPRICEORACLE_ADDR,
    //     abi.encodeWithSelector(bytes4(keccak256("blobBaseFee()"))),
    //     abi.encode(2126959908362)
    //   );
    //   vm.mockCall(OVM_GASPRICEORACLE_ADDR, abi.encodeWithSelector(bytes4(keccak256("decimals()"))), abi.encode(6));
    // }

    ///////////////////////////////////////////////
    ///                   Tests                 ///
    ///////////////////////////////////////////////

    function testVRFReturnsWithRandomValue() public { 
      vm.txGasPrice(1 gwei);
      // _mockGasOraclePriceFeeMethods();

      uint256 cardPackNumber = 1; 
        // 1: create Avatar Based Account
      vm.prank(userOne);
      (, address avatarAccountAddress) = players.createPlayer(avatarUri);
      // 2: get price pack
      uint256 priceCardPack = cards.s_priceCardPack();  
      // 3: give userOne funds. 

      vm.deal(avatarAccountAddress, 1 ether);  
      // 4: open pack of cards. 
      bytes memory callData = abi.encodeWithSelector(Cards.openCardPack.selector, cardPackNumber);
      vm.prank(userOne);
      AvatarBasedAccount(payable(avatarAccountAddress)).execute(address(cards), priceCardPack, callData, 0);

      // vm.prank(cards.i_owner());
      uint256 requestId = cards.lastRequestId(); 
      console2.log("lastrequestId: ", requestId);
      vm.roll(100 + block.number); 

      (uint256 paid, bool fullfilled) = cards.s_requests(requestId); 
      console.log("paid: ", paid);
      console.log("fullfilled: ", fullfilled);
    }





}