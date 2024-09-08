// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Basic ERC-721 contract, but with ERC-6551 integration.
 *
 *
 *
 *
 * authors: Argos, CriptoPoeta, 7cedars
 */
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC6551Registry} from "@reference/src/ERC6551Registry.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// see https://docs.chain.link/ccip/tutorials/send-arbitrary-data for the docs. 
// https://github.com/smartcontractkit/ccip-starter-kit-foundry
import {IAny2EVMMessageReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

contract Players is ERC721URIStorage {
    /* errors */
    error Players__AvatarDoesNotExist();
    error Players__OnlyOwner(); 
    error Players__L2andL1AvatarIdsDoNotAlign(uint256 expectedId, uint256 actualId);  

    /* events */
    event DeployedPlayersContract(address indexed owner, uint256 indexed version, address indexed erc6551_account);
    event CreatedPlayer(uint256 indexed avatarId, address indexed avatarAccountAddress);
    event ChangedErc6551Account(address indexed oldAccount, address indexed newAccount);  
    event ChangedL1PlayersAddress(address indexed oldAccount, address indexed newAccount);
    event MessageReceived(address indexed latestSender, uint256 avatarUri); 

    /* state vars */
    uint256 public avatarCounter;
    address public immutable OWNER;
    bytes32 private constant SALT = bytes32(hex"7ceda5");
    address private immutable ERC6551_REGISTRY;
    address public erc6551_account;
    address public l1_players; 
    address constant SENDER_ROUTER = 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165; // Opt sepolia router. -- because ERC-6551 accounts cannot have a constructor, this value is hard coded as a constant. 
    address constant RECEIVER_ROUTER = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59; // Eth sepolia router. -- 
    uint64 constant DESTINATION_CHAIN_SELECTOR = 16015286601757825753; // there is only one direction that this ERC-6551 gateway works. Hence hardcoded onRamp Address. 
    uint256 public constant DESTINATION_CHAIN_ID = 11155111; 
    string public avatarURI = "https://aqua-famous-sailfish-288.mypinata.cloud/ipfs/QmZQUeuaE52HjsBxVZFxTb7KoymW2TErQQJzHFribZStnZ"; 
    mapping(address => uint256 avatarId) public s_avatarIds; 

    error InvalidRouter(address sender); 

    /* modifiers */
    modifier onlyExistingAvatars(uint256 _avatarId) {
        if (_avatarId > avatarCounter) {
            revert Players__AvatarDoesNotExist();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != OWNER) {
            revert Players__OnlyOwner();
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
     * @param _erc6551_account the address where our token based account implementation (in our case AvatarBasedAccount) is deployed.
     * @param erc6551_registry the entrypoint of the singleton ERC-6551 contract.
     *
     * emits a DeployedPlayersContract event.
     *
     */
    constructor(uint256 version, address _erc6551_account, address erc6551_registry, address _l1_players)
        ERC721("Cats, Dogs and Memes Avatar", "CDM")
    {
        OWNER = msg.sender;
        ERC6551_REGISTRY = erc6551_registry;
        erc6551_account = _erc6551_account;
        l1_players = _l1_players; 

        emit DeployedPlayersContract(msg.sender, version, erc6551_account);
    }

    /* external */
    function setErc6551Account(address _erc6551_account) external onlyOwner {
        address oldAccount = erc6551_account;  
        erc6551_account = _erc6551_account; 
        emit ChangedErc6551Account(oldAccount, erc6551_account); 
    }

    function setL1_playersAddress(address _l1_players) external onlyOwner {
        address oldAccount = l1_players;  
        l1_players = _l1_players; 
        emit ChangedL1PlayersAddress(oldAccount, l1_players); 
    }

    /* public */
    /**
     * @notice mints an avatar for a user and uses this to call the ERC-6551 registry to create a ERC-6551 account.
     *
     * @param avatarId: text tbi. 
     *
     * @return newAvatarId - the avatar Id assigned to the user.  
     * @return AvatarAddress - the address of the Avatar Based Account assigned to the user. 
     *
     * emits a CreatedPlayer event. The event holds (indexed) avatarId and avatarAddress.
     *
     * dev: The CreatedPlayer event should make it possible to search for the user account that called createPlayer
     *      and then retrieve which avatarId and AvatarAddress they received.
     */
    function createPlayer(uint256 avatarId) public returns (uint256 newAvatarId, address AvatarAddress) {
        // checks and setting counters. 
        newAvatarId = avatarId; 
        if (block.chainid == DESTINATION_CHAIN_ID) {
            newAvatarId = avatarCounter;
            avatarCounter++;
        } else {
            uint256 newAvatarCounter = avatarCounter; 
            if (newAvatarCounter != avatarId) {
                revert Players__L2andL1AvatarIdsDoNotAlign(newAvatarCounter, avatarId); 
            }
            avatarCounter++;
        }
        // minting Avatar NFT 
        _mint(msg.sender, newAvatarId);
        _setTokenURI(newAvatarId, avatarURI);
        
        // calculating ERC-6551 account.  
        AvatarAddress = _createAvatarAddress(newAvatarId);
        s_avatarIds[msg.sender] = newAvatarId;

        // if this contract is not deployed on Mainnet, rerun createPlayer on mainnet. 
        if (block.chainid != DESTINATION_CHAIN_ID) {
            bytes memory avatarIdData = abi.encode(avatarId);
            
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(l1_players),
                data: avatarIdData,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: "",
                feeToken: address(0) // transaction is always paid in native fee token. 
            });

            uint256 fee = IRouterClient(SENDER_ROUTER).getFee(
                DESTINATION_CHAIN_SELECTOR,
                message
            );

            bytes32 messageId = IRouterClient(SENDER_ROUTER).ccipSend{value: fee}(
                DESTINATION_CHAIN_SELECTOR,
                message
            );
        }
        emit CreatedPlayer(newAvatarId, AvatarAddress);

        return (newAvatarId, AvatarAddress);
    }

    function ccipReceive(Client.Any2EVMMessage calldata message) external {
        bytes32 latestMessageId;
        uint64 latestSourceChainSelector;
        address latestSender;
        string memory latestMessage;
        
        if (msg.sender != address(RECEIVER_ROUTER)) revert InvalidRouter(msg.sender);
        
        latestMessageId = message.messageId;
        latestSourceChainSelector = message.sourceChainSelector;
        latestSender = abi.decode(message.sender, (address));
        uint256 avatarId = abi.decode(message.data, (uint256));

        emit MessageReceived(latestSender, avatarId); 

        createPlayer(avatarId); // creates a mirror player for the one on L2 & emits an event. 
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
            erc6551_account, SALT, 0, address(this), avatarId // Note: chain id is set to 0, this ensures created addresses are the same accross chains. 
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
            ERC6551Registry(ERC6551_REGISTRY).account(erc6551_account, SALT, 0, address(this), avatarId); // Note: chain id is set to 0, this ensures created addresses are the same accross chains. 

        return AvatarAddress;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IAny2EVMMessageReceiver).interfaceId;
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