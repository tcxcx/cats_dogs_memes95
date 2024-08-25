// SPDX-License-Identifier: MIT


// Basic ERC-721 contract, but with ERC-6551 omni-chain integration. (From LayerZero)  
  // - will also create an AvatarBasedAccount. 
// Q: where to get avatars from? Prompts to AI? 

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
