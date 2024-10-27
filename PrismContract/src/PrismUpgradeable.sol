// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PrismUpgradeable is 
    Initializable, 
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    uint256 private _nextTokenId;
    uint256[] private _allArticleIds;

    struct Article {
        string title;
        string tokenURI;
        address originalAuthor;
        uint256 timestamp;
        uint256 mintPrice;
        uint256 parentTokenId;
    }

    mapping(uint256 => Article) public articles;

    uint256 public constant ORIGINAL_AUTHOR_ROYALTY_PERCENTAGE = 50;
    uint256 public constant MINTER_ROYALTY_PERCENTAGE = 30;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 20;

    event ArticleCreated(uint256 indexed tokenId, address indexed author, string title);
    event ArticleMinted(uint256 indexed newTokenId, uint256 indexed parentTokenId, address minter);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("Prism", "PRISM");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function articleExists(uint256 tokenId) public view returns (bool) {
        return articles[tokenId].originalAuthor != address(0);
    }

    function createArticle(
        string memory title, 
        string memory uri, 
        uint256 mintPrice
    ) public returns (uint256) {
        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);

        articles[newTokenId] = Article({
            title: title,
            tokenURI: uri,
            originalAuthor: msg.sender,
            timestamp: block.timestamp,
            mintPrice: mintPrice,
            parentTokenId: 0
        });

        _allArticleIds.push(newTokenId);
        emit ArticleCreated(newTokenId, msg.sender, title);
        return newTokenId;
    }

    function mintArticle(uint256 parentTokenId) public payable returns (uint256) {
        require(articleExists(parentTokenId), "Parent article does not exist");
        Article storage parentArticle = articles[parentTokenId];
        require(msg.value >= parentArticle.mintPrice, "Insufficient payment");

        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);

        articles[newTokenId] = Article({
            title: parentArticle.title,
            tokenURI: parentArticle.tokenURI,
            originalAuthor: parentArticle.originalAuthor,
            timestamp: block.timestamp,
            mintPrice: parentArticle.mintPrice,
            parentTokenId: parentTokenId
        });

        _allArticleIds.push(newTokenId);

        // Distribute payments
        uint256 originalAuthorPayment = (msg.value * ORIGINAL_AUTHOR_ROYALTY_PERCENTAGE) / 100;
        uint256 minterPayment = (msg.value * MINTER_ROYALTY_PERCENTAGE) / 100;
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 100;

        payable(parentArticle.originalAuthor).transfer(originalAuthorPayment);
        payable(ownerOf(parentTokenId)).transfer(minterPayment);
        payable(owner()).transfer(platformFee);

        emit ArticleMinted(newTokenId, parentTokenId, msg.sender);
        return newTokenId;
    }

    function getArticle(uint256 tokenId) public view returns (Article memory) {
        require(articleExists(tokenId), "Article does not exist");
        return articles[tokenId];
    }

    function updateArticle(
        uint256 tokenId,
        string memory newTitle,
        string memory newUri,
        uint256 newMintPrice
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can update");
        require(articleExists(tokenId), "Article does not exist");
        
        Article storage article = articles[tokenId];
        article.title = newTitle;
        article.tokenURI = newUri;
        article.mintPrice = newMintPrice;
        article.timestamp = block.timestamp;
    }

    function getAllArticles() public view returns (uint256[] memory) {
        return _allArticleIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(articleExists(tokenId), "Article does not exist");
        return articles[tokenId].tokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}