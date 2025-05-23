// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleBalloonGame {
    // 合约管理员
    address public owner;
    // 固定质押金额: 0.01 ETH (10^16 wei)
    uint256 public constant STAKE_AMOUNT = 10000000000000000; // 0.01 ETH
    // 游戏数据结构
    struct Game {
        uint256 totalStake; // 游戏中的总质押金额
        address creator; // 游戏创建者
        address challenger; // 挑战者
        bool isActive; // 游戏是否仍在进行
    }

    // 游戏ID到游戏数据的映射
    mapping(string => Game) public games;

    // 事件
    event GameCreated(string gameId, address creator, uint256 stakeAmount);
    event PlayerJoined(string gameId, address challenger, uint256 stakeAmount);
    event GameCompleted(string gameId, address winner, uint256 prize);

    // 构造函数 - 设置合约所有者
    constructor() {
        owner = msg.sender;
    }

    // 修饰器：只允许管理员调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // 创建游戏
    function createGame(string memory gameId) external payable {
        require(msg.value == STAKE_AMOUNT, "Must stake some ETH");
        require(games[gameId].creator == address(0), "Game ID already exists");

        games[gameId] = Game({
            totalStake: msg.value,
            creator: msg.sender,
            challenger: address(0),
            isActive: true
        });

        emit GameCreated(gameId, msg.sender, msg.value);
    }

    // 加入游戏
    function joinGame(string memory gameId) external payable {
        Game storage game = games[gameId];

        require(game.creator != address(0), "Game does not exist");
        require(game.challenger == address(0), "Game already has a challenger");
        require(game.isActive, "Game is not active");
        require(
            msg.sender != game.creator,
            "Creator cannot join as challenger"
        );
        require(msg.value == STAKE_AMOUNT, "Must stake same amount as creator");

        // 更新游戏数据
        game.challenger = msg.sender;
        game.totalStake += msg.value;

        emit PlayerJoined(gameId, msg.sender, msg.value);
    }

    // 结束游戏并分发奖励（只有管理员可以调用）
    function endGame(string memory gameId, address winner) external onlyOwner {
        Game storage game = games[gameId];

        require(game.creator != address(0), "Game does not exist");
        require(
            game.challenger != address(0),
            "Game not ready: missing challenger"
        );
        require(game.isActive, "Game already completed");

        // 验证获胜者是游戏参与者之一
        require(
            winner == game.creator || winner == game.challenger,
            "Winner must be one of the players"
        );

        // 标记游戏为已完成
        game.isActive = false;

        // 发放奖励
        uint256 prize = game.totalStake;

        // 转账给获胜者
        (bool success, ) = winner.call{value: prize}("");
        require(success, "Failed to send prize");

        emit GameCompleted(gameId, winner, prize);
    }

    // 取消游戏（只有创建者或管理员可以在挑战者加入前取消）
    function cancelGame(string memory gameId) external {
        Game storage game = games[gameId];

        require(game.creator != address(0), "Game does not exist");
        require(
            msg.sender == game.creator || msg.sender == owner,
            "Only creator or owner can cancel"
        );
        require(
            game.challenger == address(0),
            "Cannot cancel after challenger joined"
        );
        require(game.isActive, "Game already completed");

        // 标记游戏为已完成
        game.isActive = false;

        // 退还创建者的质押金额
        (bool success, ) = game.creator.call{value: game.totalStake}("");
        require(success, "Failed to refund creator");
    }

    // 管理员可以更改合约所有者
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    // 获取游戏信息
    function getGameInfo(
        string memory gameId
    )
        external
        view
        returns (
            address creator,
            address challenger,
            uint256 totalStake,
            bool isActive
        )
    {
        Game storage game = games[gameId];
        return (game.creator, game.challenger, game.totalStake, game.isActive);
    }
}
