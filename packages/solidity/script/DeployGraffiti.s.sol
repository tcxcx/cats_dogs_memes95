// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "@forge-std/Script.sol";
import {Graffiti} from "../src/Graffiti.sol";

/**
* This deploys the Games, Cards and Coins contracts. It ALSO saves cards to cards.sol. 
*/ 
contract DeployGraffiti is Script {

  Graffiti graffiti; 

  function run() external returns (Graffiti) {
   
    vm.startBroadcast(); 
    graffiti = new Graffiti();
    vm.stopBroadcast();

    return (graffiti); 
  }

} 