// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Graffiti {

  mapping(address => uint256) public yourMark; 

  event DeployedGraffiti(); 

  constructor() {
        emit DeployedGraffiti();
    }

  function leaveYourMark(uint256 mark) public {
    yourMark[msg.sender] = mark; 
  } 
}