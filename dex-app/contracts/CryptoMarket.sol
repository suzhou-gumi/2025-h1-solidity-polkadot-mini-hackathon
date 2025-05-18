// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoMarketRegistry is Ownable {
    constructor() Ownable(msg.sender) {}

    // 币种信息栈
    struct CoinInfo {
        string name;
        string symbol;
        uint256 price; // 价格（USD，放大 1e18）
        int256 priceChange; // 24h 涨跌幅（放大 1e4）
        uint256 lastUpdated;
        bool isActive;
    }

    // 币种映射
    mapping(string => CoinInfo) public coins;
    // 活跃的币种符号
    string[] public activeSymbols;

    //币种注册事件
    event CoinRegistered(string indexed symbol, string name);
    // 币种价格更新事件
    event CoinUpdated(
        string indexed symbol,
        uint256 newPrice,
        int256 priceChange,
        uint256 timestamp
    );
    // 币种停用事件
    event CoinDeactivated(string indexed symbol);

    // 错误定义
    error CoinAlreadyExists(); // 币种已存在
    error CoinNotFound(); // 币种不存在
    error InvalidPrice(); // 无效价格

    function registerCoin(
        string calldata symbol,
        string calldata name,
        uint256 initialPrice
    ) external onlyOwner {
        if (bytes(coins[symbol].symbol).length != 0) revert CoinAlreadyExists();
        if (initialPrice == 0) revert InvalidPrice();

        coins[symbol] = CoinInfo({
            name: name,
            symbol: symbol,
            price: initialPrice,
            priceChange: 0,
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeSymbols.push(symbol);

        emit CoinRegistered(symbol, name);
        emit CoinUpdated(symbol, initialPrice, 0, block.timestamp);
    }

    function updateCoinPrice(
        string calldata symbol,
        uint256 newPrice
    ) external onlyOwner {
        CoinInfo storage coin = coins[symbol];
        if (!coin.isActive) revert CoinNotFound();
        if (newPrice == 0) revert InvalidPrice();

        int256 priceChange;
        if (coin.lastUpdated > 0) {
            priceChange = int256(
                ((newPrice - coin.price) * 10000) / coin.price
            );
        } else {
            priceChange = 0;
        }

        coin.price = newPrice;
        coin.priceChange = priceChange;
        coin.lastUpdated = block.timestamp;

        emit CoinUpdated(symbol, newPrice, priceChange, block.timestamp);
    }

    function deactivateCoin(string calldata symbol) external onlyOwner {
        CoinInfo storage coin = coins[symbol];
        if (!coin.isActive) revert CoinNotFound();
        coin.isActive = false;

        emit CoinDeactivated(symbol);
    }

    // 获取单个币种信息
    function getCoinBySymbol(
        string calldata symbol
    ) external view returns (CoinInfo memory) {
        return coins[symbol];
    }

    function getAllActiveCoins() external view returns (CoinInfo[] memory) {
        CoinInfo[] memory result = new CoinInfo[](activeSymbols.length);
        for (uint256 i = 0; i < activeSymbols.length; i++) {
            result[i] = coins[activeSymbols[i]];
        }
        return result;
    }
}
