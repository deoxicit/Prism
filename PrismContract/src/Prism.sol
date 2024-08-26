// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Prism is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256[] private _allArticleIds;
    string[] private _allTags;
    mapping(string => bool) private _tagExists;

    struct Article {
        string title;
        address originalAuthor;
        uint256 timestamp;
        uint256 mintPrice;
        uint256 parentTokenId; // 0 for original articles
        string[] tags;
    }

    mapping(uint256 => Article) public articles;
    mapping(string => uint256[]) private tagToArticles;

    uint256 public constant ORIGINAL_AUTHOR_ROYALTY_PERCENTAGE = 50; // 50% to original author
    uint256 public constant MINTER_ROYALTY_PERCENTAGE = 30; // 30% to immediate minter
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 20; // 20% to platform

    event ArticleCreated(uint256 indexed tokenId, address indexed author, string title, string[] tags);
    event ArticleMinted(uint256 indexed newTokenId, uint256 indexed parentTokenId, address minter);
    event TagsUpdated(uint256 indexed tokenId, string[] newTags);

    constructor(address initialOwner) ERC721("Prism", "PRISM") Ownable(initialOwner) {}

    function createArticle(string memory title, string memory tokenURI, uint256 mintPrice, string[] memory tags) public returns (uint256) {
        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        articles[newTokenId] = Article({
            title: title,
            originalAuthor: msg.sender,
            timestamp: block.timestamp,
            mintPrice: mintPrice,
            parentTokenId: 0, // 0 indicates this is an original article
            tags: tags
        });

        _allArticleIds.push(newTokenId);
        _updateTagMappings(newTokenId, tags);

        emit ArticleCreated(newTokenId, msg.sender, title, tags);

        return newTokenId;
    }

    function mintArticle(uint256 parentTokenId) public payable returns (uint256) {
        require(articleExists(parentTokenId), "Parent article does not exist");
        Article storage parentArticle = articles[parentTokenId];
        require(msg.value >= parentArticle.mintPrice, "Insufficient payment");

        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI(parentTokenId));

        articles[newTokenId] = Article({
            title: parentArticle.title,
            originalAuthor: parentArticle.originalAuthor,
            timestamp: block.timestamp,
            mintPrice: parentArticle.mintPrice,
            parentTokenId: parentTokenId,
            tags: parentArticle.tags
        });

        _allArticleIds.push(newTokenId);
        _updateTagMappings(newTokenId, parentArticle.tags);

        // Calculate and distribute payments
        uint256 originalAuthorPayment = (msg.value * ORIGINAL_AUTHOR_ROYALTY_PERCENTAGE) / 100;
        uint256 minterPayment = (msg.value * MINTER_ROYALTY_PERCENTAGE) / 100;
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) / 100;

        payable(parentArticle.originalAuthor).transfer(originalAuthorPayment);
        payable(ownerOf(parentTokenId)).transfer(minterPayment);
        payable(owner()).transfer(platformFee);

        // Refund excess payment
        if (msg.value > parentArticle.mintPrice) {
            payable(msg.sender).transfer(msg.value - parentArticle.mintPrice);
        }

        emit ArticleMinted(newTokenId, parentTokenId, msg.sender);

        return newTokenId;
    }

    function getArticle(uint256 tokenId) public view returns (Article memory) {
        require(articleExists(tokenId), "Article does not exist");
        return articles[tokenId];
    }

    function updateArticle(uint256 tokenId, string memory newTitle, string memory newTokenURI, uint256 newMintPrice, string[] memory newTags) public {
        require(ownerOf(tokenId) == msg.sender, "Only the token owner can update the article");
        require(articleExists(tokenId), "Article does not exist");
        
        Article storage article = articles[tokenId];
        article.title = newTitle;
        article.mintPrice = newMintPrice;
        article.timestamp = block.timestamp;
        
        _setTokenURI(tokenId, newTokenURI);

        _updateTagMappings(tokenId, newTags);
        article.tags = newTags;

        emit TagsUpdated(tokenId, newTags);
    }

    function getMintingChain(uint256 tokenId) public view returns (uint256[] memory) {
        require(articleExists(tokenId), "Article does not exist");
        
        uint256 chainLength = getChainLength(tokenId);
        uint256[] memory chain = new uint256[](chainLength);
        uint256 currentTokenId = tokenId;
        
        for (uint256 i = 0; i < chainLength; i++) {
            chain[i] = currentTokenId;
            currentTokenId = articles[currentTokenId].parentTokenId;
        }
        
        return chain;
    }

    function getChainLength(uint256 tokenId) private view returns (uint256) {
        uint256 length = 0;
        uint256 currentTokenId = tokenId;
        
        while (currentTokenId != 0 && articleExists(currentTokenId)) {
            length++;
            currentTokenId = articles[currentTokenId].parentTokenId;
        }
        
        return length;
    }

    function articleExists(uint256 tokenId) public view returns (bool) {
        return articles[tokenId].originalAuthor != address(0);
    }

    function listAllArticles() public view returns (uint256[] memory) {
        return _allArticleIds;
    }

    function getArticlesByTag(string memory tag) public view returns (uint256[] memory) {
        return tagToArticles[tag];
    }

    function listAllTags() public view returns (string[] memory) {
        return _allTags;
    }

    function _updateTagMappings(uint256 tokenId, string[] memory newTags) private {
        Article storage article = articles[tokenId];
        
        // Remove the article from all its current tag mappings
        for (uint i = 0; i < article.tags.length; i++) {
            string memory oldTag = article.tags[i];
            uint256[] storage articleIds = tagToArticles[oldTag];
            for (uint j = 0; j < articleIds.length; j++) {
                if (articleIds[j] == tokenId) {
                    articleIds[j] = articleIds[articleIds.length - 1];
                    articleIds.pop();
                    break;
                }
            }
        }

        // Add the article to all its new tag mappings
        for (uint i = 0; i < newTags.length; i++) {
            string memory tag = newTags[i];
            tagToArticles[tag].push(tokenId);
            if (!_tagExists[tag]) {
                _allTags.push(tag);
                _tagExists[tag] = true;
            }
        }
    }
}