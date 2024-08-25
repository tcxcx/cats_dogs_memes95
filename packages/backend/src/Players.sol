// SPDX-License-Identifier: MIT

// Basic ERC-721 contract, but with ERC-6551 omni-chain integration. (From LayerZero)  
  // - will also create an AvatarBasedAccount. 
// Q: where to get avatars from? Prompts to AI? 

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC6551Registry } from "lib/reference/src/ERC6551Registry.sol"; 

contract Players is ERC721URIStorage {
    uint256 private _avatarCounter;

    /* errors */
    error Players__OnlyOwner();
    error Players__AvatarDoesNotExist();

    /* events */
    event DeployedPlayersContract(address indexed owner, string indexed version, address indexed i_erc6551_account);
    event CreatedPlayer(uint256 indexed avatarId, address indexed avatarAccountAddress);

    /* state vars */
    address public s_owner;
    bytes32 private constant SALT = bytes32(hex'7ceda5'); 
    address private immutable i_erc6551_registry; 
    address private immutable i_erc6551_account; 
    
    /* modifiers */
    // Currently not used, but likely we will want to add some role restricted functions later on.  
    modifier onlyOwner() {
        if (msg.sender != s_owner) {
            revert Players__OnlyOwner();
        }
        _;
    }

    modifier onlyExistingAvatars(uint256 _avatarId) {
        if (_avatarId > _avatarCounter) {
            revert Players__AvatarDoesNotExist();
        }
        _;
    }

    /////////////////////////////////////////////////////
    //                    FUNCTIONS                    //
    ///////////////////////////////////////////////////// 
    /* constructor */
    constructor(
        string memory _version,
        address _erc6551_account, 
        address _erc6551_registry
    ) ERC721("Cats, Dogs and Memes Avatar", "CDM") {
        s_owner = msg.sender;
        i_erc6551_account = _erc6551_account; 
        i_erc6551_registry = _erc6551_registry; 

        emit DeployedPlayersContract(msg.sender, _version, i_erc6551_account);
    }


    /* public */
    /**
     * notice: mints an avatar for a user and uses this to call the ERC-6551 registry to create a ERC-6551 account. 
     *
     * £todo: write out natspec.  
     *
     * emits a CreatedPlayer event.  
     */
    function createPlayer(string memory avatarURI)
        public 
        returns (uint256, address)
    {
        uint256 newAvatarId = _avatarCounter;
        _mint(msg.sender, newAvatarId);
        _setTokenURI(newAvatarId, avatarURI);

        address AvatarAddress = _createAvatarAddress(newAvatarId);

        _avatarCounter = _avatarCounter++;
        emit CreatedPlayer(newAvatarId, AvatarAddress); 
        
        return (newAvatarId, AvatarAddress);
    }


    /* internal */
    /**
     * notice: internal function to calculate address of Avatar based Token Based Account. 
     *
     * £todo: write out natspec.  
     *
     * £question: does this emit an event? 
     */
    function _createAvatarAddress(uint256 _avatarId) internal returns (address AvatarAddress) {
        AvatarAddress = ERC6551Registry(i_erc6551_registry).createAccount(
            i_erc6551_account, SALT, block.chainid, address(this), _avatarId
        );

        return AvatarAddress;
    }

    /* getters */
    /**
     * notice: external view function to get address of existing Avatar based Token Based Account. 
     * reverts if the avatar does not exist. 
     *
     * £todo: write out natspec.  
     *
     * £question: does this emit an event? 
     */
    function getAvatarAddress(uint256 _avatarId) external view onlyExistingAvatars(_avatarId) returns (address AvatarAddress) {
        AvatarAddress = ERC6551Registry(i_erc6551_registry).account(
            i_erc6551_account, SALT, block.chainid, address(this), _avatarId
        );

        return AvatarAddress;
    }

}





// £Notes to self  
// When reviewing this code, check: https://github.com/transmissions11/solcurity
// see also: https://github.com/nascentxyz/simple-security-toolkit

// Structure contract // -- from Patrick Collins. 
/* version */
/* imports */
/* errors */
/* interfaces, libraries, contracts */
/* Type declarations */
/* State variables */
/* Events */
/* Modifiers */

/* FUNCTIONS: */
/* constructor */
/* receive function (if exists) */
/* fallback function (if exists) */
/* external */
/* public */
/* internal */
/* private */
/* internal & private view & pure functions */
/* external & public view & pure functions */