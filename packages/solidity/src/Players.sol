// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Basic ERC-721 contract, but with ERC-6551 integration.
 *
 * authors: Argos, CriptoPoeta, 7cedars
 */
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC6551Registry} from "@reference/src/ERC6551Registry.sol";

contract Players is ERC721URIStorage {
    /* errors */
    error Players__AvatarDoesNotExist();

    /* events */
    event DeployedPlayersContract(address indexed owner, uint256 indexed version, address indexed erc6551_account);
    event CreatedPlayer(uint256 indexed avatarId, address indexed avatarAccountAddress);

    /* state vars */
    uint256 private _avatarCounter;
    address public immutable OWNER;
    bytes32 private constant SALT = bytes32(hex"7ceda5");
    address private immutable ERC6551_REGISTRY;
    address private immutable ERC6551_ACCOUNT;
    mapping(address => uint256 avatarId) public s_avatarIds; 

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
     * @notice Sets up the players contract. It is builds on an ERC-721 NFT template. It creates an AvatarBasedAccount linked to NFTs it mints.
     *
     * @param version the version of this contract. It helps find the correct address on-chain.
     * @param erc6551_account the address where our token based account implementation (in our case AvatarBasedAccount) is deployed.
     * @param erc6551_registry the entrypoint of the singleton ERC-6551 contract.
     *
     * emits a DeployedPlayersContract event.
     *
     */
    constructor(uint256 version, address erc6551_account, address erc6551_registry)
        ERC721("Cats, Dogs and Memes Avatar", "CDM")
    {
        OWNER = msg.sender;
        ERC6551_ACCOUNT = erc6551_account;
        ERC6551_REGISTRY = erc6551_registry;

        emit DeployedPlayersContract(msg.sender, version, ERC6551_ACCOUNT);
    }

    /* public */
    /**
     * @notice mints an avatar for a user and uses this to call the ERC-6551 registry to create a ERC-6551 account.
     *
     * @param avatarURI: the uri that holds the metadata (with the uri to the image) of the Avatar NFT.
     *
     * @return newAvatarId - the avatar Id assigned to the user.  
     * @return AvatarAddress - the address of the Avatar Based Account assigned to the user. 
     *
     * emits a CreatedPlayer event. The event holds (indexed) avatarId and avatarAddress.
     *
     * dev: The CreatedPlayer event should make it possible to search for the user account that called createPlayer
     *      and then retrieve which avatarId and AvatarAddress they received.
     */
    function createPlayer(string memory avatarURI) public returns (uint256 newAvatarId, address AvatarAddress) {
        newAvatarId = _avatarCounter;
        _avatarCounter++;

        _mint(msg.sender, newAvatarId);
        _setTokenURI(newAvatarId, avatarURI);
        AvatarAddress = _createAvatarAddress(newAvatarId);

        // note: avatarIds can be overwritten, in effect resetting Avatar Based Account. 
        s_avatarIds[msg.sender] = newAvatarId; 

        emit CreatedPlayer(newAvatarId, AvatarAddress);

        return (newAvatarId, AvatarAddress);
    }

    /* internal */
    /**
     * @notice Creates the address of an AvatarBasedAccount.
     *
     * @param avatarId: The tokenId id of the minted avatar NFT.
     *
     * dev: this function does not emit an event. Event is emitted in the public function 'createPlayer'.
     */
    function _createAvatarAddress(uint256 avatarId) internal returns (address AvatarAddress) {
        AvatarAddress = ERC6551Registry(ERC6551_REGISTRY).createAccount(
            ERC6551_ACCOUNT, SALT, block.chainid, address(this), avatarId
        );

        return AvatarAddress;
    }

    /* getters */
    /**
     * @notice external view function to retrieve address of Avatar based Account, using avatarId as input.
     *
     * @param avatarId: The tokenId id of avatar NFT.
     *
     * dev: Reverts if the avatar does not exist.
     * dev: does not emit an event. (no state var is changed.)
     *
     */
    function getAvatarAddress(uint256 avatarId)
        external
        view
        onlyExistingAvatars(avatarId)
        returns (address AvatarAddress)
    {
        AvatarAddress =
            ERC6551Registry(ERC6551_REGISTRY).account(ERC6551_ACCOUNT, SALT, block.chainid, address(this), avatarId);

        return AvatarAddress;
    }
}

// for extensive guidance on best practices see: 
// - https://book.getfoundry.sh/tutorials/best-practices?highlight=lint#general-contract-guidance
// - https://docs.soliditylang.org/en/latest/style-guide.html


// Structure contract // -- From patrick collins, following guidance of the Ethereum foundation at: https://docs.soliditylang.org/en/latest/style-guide.html#order-of-functions
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

// for guidance on security see:   
// - https://github.com/transmissions11/solcurity
// - https://github.com/nascentxyz/simple-security-toolkit