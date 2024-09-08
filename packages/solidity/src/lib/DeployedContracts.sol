// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Contract dpeloyment addresses. Old contracts are commented out.  

contract DeployedContracts {
  address public cards = 0x37FD9cA01307708E29812621991eA7DF04e3E539; // 0x5e48B24C922eB20Bbc3C08222165Eeb5D4593b14;
  address public games = 0x0f0D9F12143eBCa798E3873CE5350eE71AcDC03b; // 0x79c81b8EE31fDF46ce07A1Cc0EF264C735d28abB; 

  address public avatarBasedAccounts = 0x8d59b934BEb304464E80c2F18693d5cf9dF627F6;  
    // 0x50270BCeC0a006b0Ac734B40516Ed7CF0A5fcf9E; // 0x27027C7F5B357aE339f25A421A7F159A58394cE0; 
  address public players = 0xb7dF35B05401e6d338832247C752dC298648Cc99; 
    // 0x2F294745e596F4552C5a21023cf5d97c88cb80D3; // 0xA070608Bc65116D860f3aCF3086Bc345DccA484C;

  // Optimism sepolia - NOTE: same addresses as on sepolia mainnet.  
  address public optAvatarBasedAccount = 0x8d59b934BEb304464E80c2F18693d5cf9dF627F6; // 0x50270BCeC0a006b0Ac734B40516Ed7CF0A5fcf9E; 
  address public optPlayers = 0xb7dF35B05401e6d338832247C752dC298648Cc99; // 0x2F294745e596F4552C5a21023cf5d97c88cb80D3; 

  constructor() {}

}
