// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract ERC721 is IERC721{
    struct Award{
        uint256 id;
        uint256 power;
    }
    address private publisher;
    mapping(uint => address) private own_by;
    mapping(address => uint) private own_count;

    constructor(){
        publisher=msg.sender;
    }
    
    function creat(uint id,uint pw) public{
        Award memory a=Award(id,pw);
        own_by[a.id]=publisher;
        own_count[publisher]++;
    }
    
    function balanceOf(address owner) override public view returns (uint256 balance){
        return own_count[owner];
    }
    function ownerOf(uint256 tokenId)override public view returns (address owner){
        return own_by[tokenId];
    }
    function transfer(address to, uint256 tokenId)public returns(bool){
        transferFrom(msg.sender, to, tokenId);
        require(ownerOf(tokenId)==to,"Translate Failed");
        return true;
    }

    function transferFrom(address from, address to, uint256 tokenId)override public{
        require(ownerOf(tokenId) == from);
        own_by[tokenId]=to;
        own_count[from]--;
        own_count[to]++;
    }
}