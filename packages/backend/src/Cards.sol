// SPDX-License-Identifier: MIT


// Basic ERC-721 or ERC-1155 contract. 
// Manages cards, buying packs of cards. 
// Buying packs of cards. use chainlink VRF for randomisation.    
// Cards content + characteristics created by Itu. 

pragma solidity 0.8.26;

contract Cards {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
