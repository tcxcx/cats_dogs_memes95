// SPDX-License-Identifier: MIT


// Basic ERC-20 contract.
// but minting tokens happens on basis of cards (or packs of cards) owned.

pragma solidity 0.8.26;

contract Coins {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
