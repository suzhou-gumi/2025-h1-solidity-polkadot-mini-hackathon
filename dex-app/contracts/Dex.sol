// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract Dex {
    struct Pool {
        uint256 token0;  // 代币A数量
        uint256 token1;  // 代币B数量
    }
    
    mapping(address => mapping(address => Pool)) public pools; // tokenA => (tokenB => Pool)
    
    // 添加流动性（需要先授权代币）
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        
        pools[tokenA][tokenB] = Pool(
            pools[tokenA][tokenB].token0 + amountA,
            pools[tokenA][tokenB].token1 + amountB
        );
    }

    // 获取汇率（基于恒定乘积公式）
    function getPrice(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256) {
        Pool memory pool = pools[tokenIn][tokenOut];
        require(pool.token0 > 0 && pool.token1 > 0, "No liquidity");
        return (amountIn * pool.token1) / (pool.token0 + amountIn);
    }

    // 执行代币交换
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external {
        uint256 amountOut = getPrice(tokenIn, tokenOut, amountIn);
        
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        // 更新池子余额
        pools[tokenIn][tokenOut].token0 += amountIn;
        pools[tokenIn][tokenOut].token1 -= amountOut;
    }
}