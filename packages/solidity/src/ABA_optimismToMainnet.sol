// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 * Copied from TokenBounds's reference ERC6551Account.sol. (see lib/reference/src/examples/simple)
 * Three changes:
 * 1 - changed names of contracts. This ensure that the interfaceId of AvatarBasedAccounts is unique.
 * 2 - added onERC1155Received and onERC1155BatchReceived. This allows receiving of ERC-1155 tokens.
 * 3 - it integrates (a very basic implementation of) Chainlink's CCIP to allow it to be deployed on optimism sepolia and interact with contracts on mainnet sepolia. 
 *
 * It acts as a tokenised gateway between blockchains. Allowing users to seemlessly interact with the Cats, Dogs, Memes, etc game on mainnet.  
 */

// see https://docs.chain.link/ccip/tutorials/send-arbitrary-data for the docs. 
// https://github.com/smartcontractkit/ccip-starter-kit-foundry
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {Withdraw} from "./utils/Withdraw.sol";

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

interface IAbaAccount {
    receive() external payable;

    function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId);

    function state() external view returns (uint256);

    function isValidSigner(address signer, bytes calldata context) external view returns (bytes4 magicValue);
}

interface IAbaExecutable {
    function execute(address to, uint256 value, bytes calldata data, uint8 operation)
        external
        payable
        returns (bytes memory);
}

contract ABA is IERC165, IERC1271, IAvatarAccount, IAvatarExecutable {

    // Event emitted when a message is sent to another chain.
    event MessageSent(bytes32 messageId);

    uint256 public state;
    address constant ROUTER = 0xC8b93b46BF682c39B3F65Aa1c135bC8A95A5E43a; // because ERC-6551 accounts cannot have a constructor, this value is hard coded as a constant. 
    address constant DESTINATION_CHAIN_SELECTOR = 16015286601757825753; // there is only one direction that this ERC-6551 gateway works. Hence hardcoded onRamp Address. 
    // Mapping to keep track of allowlisted destination chains.

    receive() external payable {}

    // NOTE no value can be send. 
    // NOTE the destination chain is hard coded. This ERC-6551 acts as a tokenised gateway to one single external chain.  
    // NOTE no value can be transferred as such. This param is unused. 
    function execute(address to, uint256 /* value */, bytes calldata data, uint8 operation) 
        external
        payable
        virtual
        returns (bytes memory result)
    {
        require(_isValidSigner(msg.sender), "Invalid signer");
        require(operation == 0, "Only call operations are supported");
        
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(to),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: "",
            feeToken: address(0) // transaction is always paid in native fee token. 
        });

        uint256 fee = IRouterClient(ROUTER).getFee(
            DESTINATION_CHAIN_SELECTOR,
            message
        );

        ++state;

        messageId = IRouterClient(ROUTER).ccipSend{value: fee}(
            DESTINATION_CHAIN_SELECTOR,
            message
        );

        emit MessageSent(messageId); 
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
            || interfaceId == type(IAvatarExecutable).interfaceId;
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
