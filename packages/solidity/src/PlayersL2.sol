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
import {Players} from "./Players.sol"; 

import {IRouterClient} from "../../lib/chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from        "../../lib/chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";

contract PlayersL2 is ERC721URIStorage {
    /* errors */
    error PlayersL2__AvatarDoesNotExist();
    error PlayersL2__OnlyOwner();

    /* events */
    event DeployedPlayersL2Contract(address indexed owner, uint256 indexed version, address indexed erc6551_account);
    event CreatedL2Player(uint256 indexed avatarId, address indexed avatarAccountAddress);
    event ChangedL2Erc6551Account(address indexed oldAccount, address indexed newAccount); 

    /* state vars */
    uint256 private _avatarCounter;
    address public immutable OWNER;
    bytes32 private constant SALT = bytes32(hex"7ceda5");
    address private immutable ERC6551_REGISTRY;
    address public erc6551_account;
    address public l1_players; 
    mapping(address => uint256 avatarId) public s_avatarIds; 

    // Event emitted when a message is sent to another chain.
    event MessageSent(bytes32 messageId);

    uint256 public state;
    address constant ROUTER = 0xC8b93b46BF682c39B3F65Aa1c135bC8A95A5E43a; // because ERC-6551 accounts cannot have a constructor, this value is hard coded as a constant. 
    uint64 constant DESTINATION_CHAIN_SELECTOR = 16015286601757825753; // there is only one direction that this ERC-6551 gateway works. Hence hardcoded onRamp Address. 
    // Mapping to keep track of allowlisted destination chains.

    error FailedToWithdrawEth(address owner, address target, uint256 value);

    /* modifiers */
    modifier onlyExistingAvatars(uint256 _avatarId) {
        if (_avatarId > _avatarCounter) {
            revert PlayersL2__AvatarDoesNotExist();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != OWNER) {
            revert PlayersL2__OnlyOwner();
        }
        _;
    }

    /////////////////////////////////////////////////////
    //                    FUNCTIONS                    //
    /////////////////////////////////////////////////////
    /* constructor */
    /**
     * @notice Sets up the playersL2 contract on an L2. It is builds on an ERC-721 NFT template. It creates an AvatarBasedAccount linked to NFTs it mints.
     *
     * @param version the version of this contract. It helps find the correct address on-chain.
     * @param _erc6551_account the address where our token based account implementation (in our case AvatarBasedAccount) is deployed.
     * @param erc6551_registry the entrypoint of the singleton ERC-6551 contract.
     *
     * emits a DeployedPlayersL2Contract event.
     *
     */
    constructor(uint256 version, address _erc6551_account, address erc6551_registry, address _l1_players)
        ERC721("Cats, Dogs and Memes Avatar", "CDM")
    {
        OWNER = msg.sender;
        l1_players = _l1_players; 
        erc6551_account = _erc6551_account;
        ERC6551_REGISTRY = erc6551_registry;

        emit DeployedPlayersL2Contract(msg.sender, version, erc6551_account);
    }

    /* external */
    function setErc6551Account(address _erc6551_account) external onlyOwner {
        address oldAccount = erc6551_account;  
        erc6551_account = _erc6551_account; 
        emit ChangedL2Erc6551Account(oldAccount, erc6551_account); 
     }

    /* public */
    /**
     * @notice mints an avatar for a user and uses this to call the ERC-6551 registry to create a ERC-6551 account.
     *
     * @param avatarURI: the uri that holds the metadata (with the uri to the image) of the Avatar NFT.
     * @param newAvatarId: the avatarCounter read from FUNCTION at the mainnet sepolia deployment of Players.sol.  
     *
     * @return newAvatarId - the avatar Id assigned to the user.  
     * @return AvatarAddress - the address of the Avatar Based Account assigned to the user. 
     *
     * emits a CreatedPlayer event. The event holds (indexed) avatarId and avatarAddress.
     *
     * dev: The CreatedPlayer event should make it possible to search for the user account that called createPlayer
     *      and then retrieve which avatarId and AvatarAddress they received.
     */
    function createL2Player(string memory avatarURI, uint256 avatarId) public returns (uint256 newAvatarId, address AvatarAddress) {
        _mint(msg.sender, avatarId);
        _setTokenURI(avatarId, avatarURI);

        AvatarAddress = _createAvatarAddress(avatarId);
        // Executing the same action on Sepolia mainnet. 
        
        bytes memory functionData = abi.encodeWithSelector(Players.createPlayer.selector, avatarURI);
        bytes memory executeCallData = abi.encode(l1_players, functionData);
        
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(l1_players),
            data: executeCallData,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0) // transaction is always paid in native fee token. 
        });

        uint256 fee = IRouterClient(ROUTER).getFee(
            DESTINATION_CHAIN_SELECTOR,
            message
        );

        bytes32 messageId = IRouterClient(ROUTER).ccipSend{value: fee}(
            DESTINATION_CHAIN_SELECTOR,
            message
        );
        // if all goes well a mirror CreatedPlayer event should be emitted on L1, having the same AvatarAddress. 

        emit CreatedL2Player(newAvatarId, AvatarAddress);

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
            erc6551_account, SALT, block.chainid, address(this), avatarId
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
            ERC6551Registry(ERC6551_REGISTRY).account(erc6551_account, SALT, block.chainid, address(this), avatarId);

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