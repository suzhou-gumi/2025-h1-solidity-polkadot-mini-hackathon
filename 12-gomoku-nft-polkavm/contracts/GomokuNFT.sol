// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MinimalNFT {
    string public name = "Gomoku NFT";
    string public symbol = "GOMOKU";
    string public baseTokenURI = "https://beige-late-emu-575.mypinata.cloud/ipfs/QmaqhUFoLJ9EVLsXzZzYL2SJ6DtAtoZRuBKLfp3YY1fjx7/";

    uint256 public totalMinted;
    uint256 public constant MAX_SUPPLY = 8888;

    mapping(address => bool) public hasMinted;
    mapping(uint256 => address) public ownerOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function mintNFT(address winner) external {
        require(totalMinted < MAX_SUPPLY, "All NFTs minted");
        require(winner != address(0), "Invalid address");
        require(!hasMinted[winner], "Already minted");

        uint256 tokenId = ++totalMinted;
        ownerOf[tokenId] = winner;
        hasMinted[winner] = true;

        emit Transfer(address(0), winner, tokenId);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");

        return string(abi.encodePacked(baseTokenURI, _toString(tokenId), ".json"));
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }
     
 }
