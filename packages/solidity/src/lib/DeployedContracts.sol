// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Contract dpeloyment addresses. Old contracts are commented out.  

contract DeployedContracts {
  address public cards = 0xfF88f0002FED8793E99b49c232F3E0103C1861A4; // 0x5e48B24C922eB20Bbc3C08222165Eeb5D4593b14;
  address public games = 0x885Ee711Dbc0A92a7D8D05C9a91521CE6044f623; // 0x79c81b8EE31fDF46ce07A1Cc0EF264C735d28abB; 

  address public avatarBasedAccounts = 0x233E0f58D33a69d801d6D6E885231D5eEb332eaB;  
    // 0x50270BCeC0a006b0Ac734B40516Ed7CF0A5fcf9E; // 0x27027C7F5B357aE339f25A421A7F159A58394cE0; 
  address public players = 0x019Ff7E90B85f20148825Ea40cBfcB0bEC6CC2bB; 
    // 0x2F294745e596F4552C5a21023cf5d97c88cb80D3; // 0xA070608Bc65116D860f3aCF3086Bc345DccA484C;

  // Optimism sepolia - NOTE: same addresses as on sepolia mainnet.  
  address public optAvatarBasedAccount = 0x233E0f58D33a69d801d6D6E885231D5eEb332eaB; // 0x50270BCeC0a006b0Ac734B40516Ed7CF0A5fcf9E; 
  address public optPlayers = 0x019Ff7E90B85f20148825Ea40cBfcB0bEC6CC2bB; // 0x2F294745e596F4552C5a21023cf5d97c88cb80D3; 

  constructor() {}

}
