// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface Interface {
    struct Card {
        string name;
        string cardType;
        uint16 atk;
        uint16 hp;
        uint16 spd;
        uint16 infRange;
        uint16 supRange;
    }

    error Cards__ArraysNotSameLength(uint256 lengthOne, uint256 lengthTwo);
    error Cards__FundRetrievalUnsuccessful();
    error Cards__InsufficientPayment();
    error Cards__NoCardsExist();
    error Cards__OnlyAvatarBasedAccount(address playerAccount);
    error Cards__OnlyOwner();

    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event ChangedCardPackPrice(uint256 newPrice, uint256 oldPrice);
    event DeployedCardsContract(address indexed owner, address indexed coinsContract, uint256 indexed priceCardPack);
    event Log(string func, uint256 gas);
    event TransferBatch(
        address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values
    );
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event URI(string value, uint256 indexed id);

    constructor(uint256 priceCardPack, uint256[] packThresholds, uint256[] packCoinAmounts);

    fallback() external payable;

    receive() external payable;

    function addToCoinAllowance(uint256 coins, address recipient) external;
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids) external view returns (uint256[] memory);
    function createCards(Card[] memory cards, uint256[] memory mintAmounts, string memory newuri) external;
    function getCollection(address AvatarBasedAccount) external view returns (uint256[] memory cardCollection);
    function isApprovedForAll(address account, address operator) external view returns (bool);
    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory)
        external
        returns (bytes4);
    function onERC1155Received(address, address, uint256, uint256, bytes memory) external returns (bytes4);
    function openCardPack(uint256 cardPackNumber) external payable;
    function retrieveFunds() external;
    function s_cardIds(uint256) external view returns (uint256);
    function s_cardPackCounter() external view returns (uint256);
    function s_cards(uint256 cardId)
        external
        view
        returns (
            string memory name,
            string memory cardType,
            uint16 atk,
            uint16 hp,
            uint16 spd,
            uint16 infRange,
            uint16 supRange
        );
    function s_coinAllowance(address avatarBasedAccount) external view returns (uint256 allowance);
    function s_coins() external view returns (address);
    function s_owner() external view returns (address);
    function s_packCoinAmounts(uint256) external view returns (uint256);
    function s_packThresholds(uint256) external view returns (uint256);
    function s_priceCardPack() external view returns (uint256);
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external;
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external;
    function setApprovalForAll(address operator, bool approved) external;
    function setPriceCardPack(uint256 newPrice) external;
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
    function uri(uint256) external view returns (string memory);
}
