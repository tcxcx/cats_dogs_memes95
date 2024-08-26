// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {Cards} from "../src/Cards.sol";

contract DeployCards is Script {
  Cards cards; 

  function run() external returns (Cards) {
    vm.startBroadcast();
      cards = new Cards(5000);
    vm.stopBroadcast();

    console2.log("cards deployed at: ", address(cards));

    return cards; 
  }
}