// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/** 
* Basic ERC-721 contract, but with ERC-6551 integration. 
* Integretation with layerZero, to create an omni-chain ERC-6551 is tbd.  
*
* authors: Argos, CriptoPoeta, 7cedars
*/ 
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC6551Registry } from "@erc6551/src/ERC6551Registry.sol"; 

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
    /**
     * Note Sets up the players contract. It is builds on an ERC-721 NFT template. It creates an AvatarBasedAccount linked to NFTs it mints. 
     * 
     * @param _version the version of this contract. It helps find the correct address on-chain. 
     * @param _erc6551_account the address where our token based account implementation (in our case AvatarBasedAccount) is deployed. 
     * @param _erc6551_registry the entrypoint of the singleton ERC-6551 contract. 
     * 
     * emits a DeployedPlayersContract event. 
     *
     */
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
     * Note: mints an avatar for a user and uses this to call the ERC-6551 registry to create a ERC-6551 account. 
     *
     * @param avatarURI: the uri that holds the metadata (with the uri to the image) of the Avatar NFT.   
     *
     * emits a CreatedPlayer event. The event holds (indexed) avatarId and avatarAddress. 
     *
     * dev: The CreatedPlayer event should makes it possible to search for the user account that called createPlayer 
     *      and then retrieve which avatarId and AvatarAddress they received. 
     */
    function createPlayer(string memory avatarURI)
        public 
        returns (uint256, address)
    {
        uint256 newAvatarId = _avatarCounter;
        _avatarCounter++;

        _mint(msg.sender, newAvatarId);
        _setTokenURI(newAvatarId, avatarURI);
        address AvatarAddress = _createAvatarAddress(newAvatarId);
    
        emit CreatedPlayer(newAvatarId, AvatarAddress); 
        
        return (newAvatarId, AvatarAddress);
    }

    /* internal */
    /**
     * Note: Creates the address of an AvatarBasedAccount.  
     *
     * @param avatarId: The tokenId id of the minted avatar NFT.   
     *
     * dev: this function does not emit an event. Event is emitted in the public function 'createPlayer'. 
     */
    function _createAvatarAddress(uint256 avatarId) internal returns (address AvatarAddress) {
        AvatarAddress = ERC6551Registry(i_erc6551_registry).createAccount(
            i_erc6551_account, SALT, block.chainid, address(this), avatarId
        );

        return AvatarAddress;
    }

    /* getters */
    /**
     * Note: external view function to retrieve address of Avatar based Account, using avatarId as input. 
     *  
     * @param avatarId: The tokenId id of avatar NFT.  
     *
     * dev: Reverts if the avatar does not exist.
     * dev: does not emit an event. (no state var is changed.)
     *  
     */
    function getAvatarAddress(uint256 avatarId) external view onlyExistingAvatars(avatarId) returns (address AvatarAddress) {
        AvatarAddress = ERC6551Registry(i_erc6551_registry).account(
            i_erc6551_account, SALT, block.chainid, address(this), avatarId
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