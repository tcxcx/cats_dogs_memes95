// SPDX-License-Identifier: MIT

// Manages create of games, setting up players (and their decks) against each other. etc. 
// NOTE: the detailed functioning of this contract will be developed later. 
// in early stages, the only thing that this contract should do is to initiate a game when two players and their decks have entered. 

pragma solidity 0.8.26;

contract Tournaments {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
