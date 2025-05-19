// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentNFT
 * @dev Represents AI Agents as unique Non-Fungible Tokens (NFTs).
 *      Each token ID corresponds to a specific agent.
 *      Metadata (like agent capabilities, configuration, or a link to off-chain data)
 *      can be stored via the token URI.
 */
contract AgentNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public nextTokenId;

    // Optional: Mapping to store additional on-chain agent-specific data if needed
    // struct AgentData {
    //     uint256 creationDate;
    //     address creator;
    //     // Add other relevant on-chain data fields
    // }
    // mapping(uint256 => AgentData) public agentData;

    event AgentMinted(address indexed owner, uint256 indexed tokenId, string tokenURI);
    event TokenURIUpdated(uint256 indexed tokenId, string newTokenURI);

    error URIEmpty();

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        nextTokenId = 1; // Start token IDs from 1
    }

    /**
     * @notice Mints a new Agent NFT and assigns it to an owner.
     * @param _owner The address that will own the newly minted NFT.
     * @param _tokenURI The URI for the token's metadata (e.g., pointing to a JSON file).
     * @return The ID of the newly minted token.
     */
    function mintAgent(address _owner, string memory _tokenURI)
        external
        onlyOwner // Or some other authorized role
        nonReentrant
        returns (uint256)
    {
        if (bytes(_tokenURI).length == 0) revert URIEmpty();

        uint256 tokenId = nextTokenId++;
        _safeMint(_owner, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Optional: Initialize AgentData
        // agentData[tokenId] = AgentData({
        //     creationDate: block.timestamp,
        //     creator: msg.sender // or _owner if preferred
        // });

        emit AgentMinted(_owner, tokenId, _tokenURI);
        return tokenId;
    }

    /**
     * @notice Updates the token URI for an existing Agent NFT.
     *         Only callable by the contract owner or potentially the token owner.
     * @param _tokenId The ID of the token to update.
     * @param _newTokenURI The new URI for the token's metadata.
     */
    function updateTokenURI(uint256 _tokenId, string memory _newTokenURI)
        external
        // Consider adding authorization: e.g., onlyOwner or require(_isApprovedOrOwner(msg.sender, _tokenId), "NOT_AUTHORIZED");
        onlyOwner // For simplicity, only owner can update URI
        nonReentrant
    {
        if (!_exists(_tokenId)) revert ERC721NonexistentToken(_tokenId);
        if (bytes(_newTokenURI).length == 0) revert URIEmpty();

        _setTokenURI(_tokenId, _newTokenURI);
        emit TokenURIUpdated(_tokenId, _newTokenURI);
    }

    /**
     * @notice Burns (destroys) an existing Agent NFT.
     *         Typically callable by the token owner or an approved address.
     * @param _tokenId The ID of the token to burn.
     */
    function burn(uint256 _tokenId) public override(ERC721, ERC721URIStorage) nonReentrant {
        // Default ERC721 burn checks for ownership/approval.
        // Add additional checks if necessary.
        super.burn(_tokenId);
    }


    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        if (!_exists(tokenId)) revert ERC721NonexistentToken(tokenId);
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}