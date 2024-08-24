// SPDX-License-Identifier: MIT


// A library of actions that cards can take in interaction with another card. 
// these function should be the actions that players can take.  

pragma solidity 0.8.26;

contract Players {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
