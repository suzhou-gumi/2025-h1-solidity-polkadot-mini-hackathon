// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ParkView is ERC721 {
    uint256 private tokenCount=0;
    mapping(uint256 => TokenInfo) private tokenInfos;
    uint256[] private tokenIds;

    event ParkViewTime(uint when);


    struct TokenInfo {
        uint256 id; // token id
        string name; // 车位名称
        string picture; // 车位图片地址
        string location; // 车位位置
        address owner; // 车位所有者
        address renter; // 车位出租者
        uint256 rent_end_time; // 租赁结束时间
        uint256 rent_price; // 租赁价格
        bool rent_status; // 租赁状态
        int256 longitude; // 车位经度
        int256 latitude; // 车位纬度
        uint256 create_time; // create时间
        uint256 update_time; // update时间
        bool is_property; //
    }

    constructor() ERC721("ParkView", "PV") {}

    function createToken(TokenInfo memory tokenInfo) public returns (uint256) {
        tokenCount += 1;
        uint256 tokenId = tokenCount;
        tokenInfo.id = tokenId;
        tokenInfo.owner = msg.sender;
        tokenInfo.create_time = block.timestamp;
        tokenInfo.update_time = block.timestamp;
        tokenInfo.rent_status = tokenInfo.renter == address(0);
        tokenInfo.is_property = tokenInfo.owner == address(this);
        tokenInfos[tokenId] = tokenInfo;
        tokenIds.push(tokenId);
        _safeMint(msg.sender, tokenId);
        emit ParkViewTime(block.timestamp);
        return tokenId;
    }

    function updateToken(uint256 tokenId, TokenInfo memory tokenInfo) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this token."
        );
        tokenInfo.update_time = block.timestamp;
        tokenInfo.rent_status = tokenInfo.renter == address(0);
        tokenInfo.is_property = tokenInfo.owner == address(this);
        tokenInfos[tokenId] = tokenInfo;
    }

    function getTokens() public view returns (TokenInfo[] memory) {
        TokenInfo[] memory tokens = new TokenInfo[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length ; i++) {
            tokens[i] = tokenInfos[tokenIds[i]];
        }
        return tokens;
    }

    function getToken(uint256 tokenId) public view returns (TokenInfo memory) {
        return tokenInfos[tokenId];
    }
}
