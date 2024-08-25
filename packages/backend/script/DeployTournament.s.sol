// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";

// NB: this will also deploy Cards, Coins, Game, Actions. Deploying tournament means deploying the protocol. 

contract DeployTournamentScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
    }
}
