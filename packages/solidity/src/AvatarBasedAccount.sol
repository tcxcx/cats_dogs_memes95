// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 * Copied from TokenBounds's reference ERC6551Account.sol. (see lib/reference/src/examples/simple)
 * Two small changes:
 * 1 - changed names of contracts. This ensure that the interfaceId of AvatarBasedAccounts is unique.
 * 2 - added onERC1155Received and onERC1155BatchReceived. This allows receiving of ERC-1155 tokens.
 */
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

// see https://docs.chain.link/ccip/tutorials/send-arbitrary-data for the docs. 
// https://github.com/smartcontractkit/ccip-starter-kit-foundry
import {IAny2EVMMessageReceiver} from "../../lib/chainlink/contracts/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import {Client} from        "../../lib/chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";

interface IAvatarAccount {
    receive() external payable;

    function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId);

    function state() external view returns (uint256);

    function isValidSigner(address signer, bytes calldata context) external view returns (bytes4 magicValue);
}

interface IAvatarExecutable {
    function execute(address to, uint256 value, bytes calldata data, uint8 operation)
        external
        payable
        returns (bytes memory);
}

// for now, only call from optimism chain are allowed. So router is a constant variable. 
contract AvatarBasedAccount is IERC165, IERC1271, IAvatarAccount, IAvatarExecutable {
    
    error Aba_InvalidRouter(address sender); 
    error Aba_NotMirrorAccount(address sender); 
    error Aba_ExecuteCallFailed(bytes result); 
    address constant optimismRouter = address(0); // insert address here
    
    uint256 public state;
    address public constant ROUTER = address(0); 

    event ExecutedL2Action(
        bytes32 latestMessageId,
        uint64 latestSourceChainSelector,
        address latestSender,
        string latestMessage
    );


    receive() external payable {}

    function execute(address to, uint256 value, bytes calldata data, uint8 operation)
        external
        payable
        virtual
        returns (bytes memory result)
    {
        require(_isValidSigner(msg.sender), "Invalid signer");
        require(operation == 0, "Only call operations are supported");

        ++state;

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }
    
    // Ensures that actions from Avatar Based Account on L2 are executed on L1. 
    function ccipReceive(Client.Any2EVMMessage calldata message) external {
        bytes32 latestMessageId;
        uint64 latestSourceChainSelector;
        address latestSender;
        string memory latestMessage;
        
        if (msg.sender != address(ROUTER)) {
            revert Aba_InvalidRouter(msg.sender); 
            }

        latestMessageId = message.messageId;
        latestSourceChainSelector = message.sourceChainSelector;
        latestSender = abi.decode(message.sender, (address));
        (address to, bytes memory callData) = abi.decode(message.data, (address, bytes));

        if (latestSender != address(this)) {
            revert Aba_NotMirrorAccount(latestSender); 
        }

        // execute call  
        ++state;
        
        bool success;
        bytes memory result; 
        uint256 value = 0; 
        (success, result) = to.call{value: value}(callData);

        if (!success) {
            revert Aba_ExecuteCallFailed(result); 
        }
    }


    function isValidSigner(address signer, bytes calldata) external view virtual returns (bytes4) {
        if (_isValidSigner(signer)) {
            return IAvatarAccount.isValidSigner.selector;
        }

        return bytes4(0);
    }

    function isValidSignature(bytes32 hash, bytes memory signature) external view virtual returns (bytes4 magicValue) {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return bytes4(0);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId || interfaceId == type(IAvatarAccount).interfaceId
            || interfaceId == type(IAvatarExecutable).interfaceId
            || interfaceId == type(IAny2EVMMessageReceiver).interfaceId;
    }

    function token() public view virtual returns (uint256, address, uint256) {
        bytes memory footer = new bytes(0x60);

        assembly {
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0x60)
        }

        return abi.decode(footer, (uint256, address, uint256));
    }

    function owner() public view virtual returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    function _isValidSigner(address signer) internal view virtual returns (bool) {
        return signer == owner();
    }

    /**
     * @dev added onERC1155Received function to make single transfers of ERC1155 tokens to TBA possible.
     */
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    /**
     * @dev added onERC1155Received function to make batch transfers of ERC1155 tokens to TBA possible.
     */
    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory)
        public
        virtual
        returns (bytes4)
    {
        return this.onERC1155BatchReceived.selector;
    }
}
