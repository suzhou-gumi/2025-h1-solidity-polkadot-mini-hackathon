// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract ERC20 is IERC20 {

    string public constant name = "TC_Coin";
    string public constant symbol = "TTC";
    uint8 public constant decimals = 18;

    uint256 totalSupply_ = 10 ether;
    mapping(address => uint256) balances;


   constructor() {
    balances[msg.sender] = totalSupply_;
    }
    
    function totalSupply() public override view returns (uint256) {
    return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }
    
    function transferFrom(address from, address to, uint256 numTokens) public override returns (bool) {
        require(balances[from] >= numTokens);
        balances[from] = balances[from]-numTokens;
        balances[to] = balances[to]+numTokens;
        emit Transfer(from, to, numTokens);
        return true;
    }
}
