// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./ERC721.sol";

contract main {
    ERC20 E2 = new ERC20();
    ERC721 E7 = new ERC721();

    struct Award{
        uint256 id;
        uint256 power;
    }
    struct Player{
        uint[] storehouse_ID;
        uint length;
    }

    address private publisher;
    constructor(){
        publisher=msg.sender;
        init_store();
        init_pool();
    }

    uint private start=block.number;//设置初始时间，用于盲盒奖池的定时刷新
    Award[10] private pool;//盲盒奖池
    uint private f;//盲盒奖池计数
    Award[] private store;//商店
    uint private num = 0;//商店计数
    mapping(uint => uint) private price;//装备的价格
    mapping(uint => address) owner;//装备的拥有者
    mapping(uint => Award) private storehouse_A;//装备信息
    mapping(address => Player) private Players;//用户地址对应其库存信息
    mapping(address => uint) private experience;//用户经验，在购买装备或盲盒、售卖装备和充值时会提升等级
    mapping(uint => uint) private logo;//用于绑定装备及其图片
    
    function init_address() private {

    }
    
    //商店初始化，生成一个容量为10的普通商店
    function init_store() private {
        uint k=5;
        for (uint i=0;i<10;i++){
            uint k1=uint256(keccak256(abi.encodePacked(block.difficulty,block.timestamp,i+k)));
            Award memory c = Award({id: k1, power: k1%35+50});
            store.push(c);
            num++;
            owner[c.id]=address(this);
            price[c.id]=(c.power*3+k1%8)*5;
            E7.creat(c.id,c.power);
            storehouse_A[c.id]=c;
            Players[address(this)].storehouse_ID.push(c.id);
            Players[address(this)].length++;
            logo[c.id]=k;
            k++;
        }
    }

    //盲盒初始化，生成一个容量为5的盲盒抽奖池
    function init_pool() private {
        f=0;
        for (uint i=0;i<5;i++){
            uint k1=uint256(keccak256(abi.encodePacked(block.difficulty,block.timestamp,i)));
            Award memory c = Award({id: k1, power: k1%20+70});
            pool[i]=c;
            f++;
            owner[c.id]=address(this);
            price[c.id]=888;
            E7.creat(c.id,c.power);
            storehouse_A[c.id]=c;
            Players[address(this)].storehouse_ID.push(c.id);
            Players[address(this)].length++;
            logo[c.id]=i;
        }
    }
    //盲盒抽奖
    function tran_pool() public returns(uint){
        uint k=uint256(keccak256(abi.encodePacked(block.difficulty,block.timestamp,f)))%f;
        uint TokenID=pool[k].id;
        require(E2.balanceOf(msg.sender) >= price[TokenID],"Insufficient balance");
        require(E2.transferFrom(msg.sender ,owner[TokenID], price[TokenID]),"Transaction Failed");
        E7.transferFrom(owner[TokenID], msg.sender, TokenID);
        for(uint i=0;i<Players[owner[TokenID]].length;i++)
            if(Players[owner[TokenID]].storehouse_ID[i]==TokenID){
                Players[owner[TokenID]].storehouse_ID[i]=Players[owner[TokenID]].storehouse_ID[Players[owner[TokenID]].length-1];
                Players[owner[TokenID]].length--;
            }
        for(uint i=0;i<f;i++)
            if(pool[i].id==TokenID){
                pool[i]=pool[f-1];
                f--;
            }
        Players[msg.sender].storehouse_ID.push(TokenID);
        Players[msg.sender].storehouse_ID[Players[msg.sender].length]=Players[msg.sender].storehouse_ID[Players[msg.sender].storehouse_ID.length-1];
        Players[msg.sender].length++;
        experience[msg.sender]++;
        owner[TokenID]=msg.sender;
        return TokenID;
    }
    //商店购买
    function tran_store(uint TokenID) public returns(bool){
        require(E2.balanceOf(msg.sender) >= price[TokenID],"Insufficient balance");
        require(E2.transferFrom(msg.sender ,owner[TokenID], price[TokenID]),"Transaction Failed");
        E7.transferFrom(owner[TokenID], msg.sender, TokenID);
        for(uint i=0;i<Players[owner[TokenID]].length;i++)
            if(Players[owner[TokenID]].storehouse_ID[i]==TokenID){
                Players[owner[TokenID]].storehouse_ID[i]=Players[owner[TokenID]].storehouse_ID[Players[owner[TokenID]].length-1];
                Players[owner[TokenID]].length--;
            }
        for(uint i=0;i<num;i++)
            if(store[i].id==TokenID){
                store[i]=store[num-1];
                num--;
            }
        Players[msg.sender].storehouse_ID.push(TokenID);
        Players[msg.sender].storehouse_ID[Players[msg.sender].length]=Players[msg.sender].storehouse_ID[Players[msg.sender].storehouse_ID.length-1];
        Players[msg.sender].length++;
        experience[msg.sender]++;
        owner[TokenID]=msg.sender;
        return true;
    }
    //玩家出售装备
    function upload(uint TokenID,uint pri) public returns(bool){
        require(experience[msg.sender] >= 2);
        Award memory p=storehouse_A[TokenID];
        store[num]=p;
        num++;
        experience[msg.sender]++;
        price[TokenID]=pri;
        return true;
    }
    //充值积分，积分与货币1:1
    function recharge(uint money) public returns(bool){
        require(E2.transferFrom(address(this), msg.sender, money),"Transaction Failed");
        return true;
    }

    //盲盒奖池3天刷新一次
    function repool() public returns(bool){
        require(msg.sender == publisher);
        uint now1 = block.number;
        if(now1-17280 >= start){
            init_pool();
            start=now1;
            return true;
        }
        else
            return false;
    }

    //获取积分余额
    function balanceOf() public view returns(uint){
        return E2.balanceOf(msg.sender);
    }
    //获取装备数量
    function getE7balance() public view returns(uint){
        return E7.balanceOf(msg.sender);
    }
    //返回store
    function getstore()public view returns(Award[] memory,uint){
        Award[] memory ID = new Award[](num);
        for(uint i=0;i<num;i++)
            ID[i]=store[i];
        return (ID,num);
    }
    //返回pool
    function getpool()public view returns(Award[] memory,uint){
        Award[] memory ID = new Award[](f);
        for(uint i=0;i<f;i++)
            ID[i]=pool[i];
        return (ID,f);
    }
    //返回拥有者
    function getowner(uint TokenID)public view returns(address){
        return owner[TokenID];
    }
    //返回价格
    function getprice(uint TokenID)public view returns(uint){
        return price[TokenID];
    }
    //返回ID对应装备
    function getstorehouse_A(uint TokenID)public view returns(Award memory){
        return storehouse_A[TokenID];
    }
    //返回用户拥有的装备ID
    function getstorehouse_ID()public view returns(uint[] memory, uint){
        uint[] memory ID = new uint[](Players[msg.sender].length);
        for(uint i=0;i<Players[msg.sender].length;i++)
            ID[i]=(Players[msg.sender].storehouse_ID[i]);
        return (ID,Players[msg.sender].length);
    }
    function getlogo(uint id)public view returns(uint){
        return logo[id];
    }
}