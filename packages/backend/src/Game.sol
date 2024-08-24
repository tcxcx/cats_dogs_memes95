// SPDX-License-Identifier: MIT

// Manages game flow

pragma solidity 0.8.26;

contract Game {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
