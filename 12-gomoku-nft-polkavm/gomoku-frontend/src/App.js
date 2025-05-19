import React, { useState, useEffect, useCallback } from 'react'; 
import './App.css';
import { ethers } from 'ethers';
import GomokuGameABI from './GomokuGameABI.json'; // 请确保将 ABI 文件放在项目中

const BOARD_SIZE = 19;
const EMPTY = null;
const BLACK = 'B';
const WHITE = 'W';
const MAX_DEPTH = 3; // 根据需要调整递归深度


// 智能合约地址（请替换为实际部署的合约地址）
const contractAddress = '0xb177CD7a2608654884f9702b59E29b66c54fb041';

// AssetHub 链的 Chain ID（十六进制格式）
const ASSETHUB_CHAIN_ID = '0x190f1b45'; // 请替换为实际的 Chain ID

// 棋盘初始化
const initializeBoard = () => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(EMPTY));
};

// 评分表，定义各种棋型的评分
const SCORES = {
  FIVE: 1000000,
  FOUR: 100000,
  BLOCKED_FOUR: 10000,
  THREE: 1000,
  BLOCKED_THREE: 100,
  TWO: 100,
  BLOCKED_TWO: 10,
};

let aiColor; // AI 颜色定义

// 检查特定方向上的棋型
const countStones = (board, x, y, dx, dy, player) => {
  let count = 1; // 包含当前位置
  let blocks = 0;

  // 正向
  let i = 1;
  while (true) {
    const nx = x + i * dx;
    const ny = y + i * dy;
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      blocks++;
      break;
    }
    const cell = board[nx][ny];
    if (cell === player) {
      count++;
      i++;
    } else if (cell === EMPTY) {
      break;
    } else {
      blocks++;
      break;
    }
  }

  // 反向
  i = 1;
  while (true) {
    const nx = x - i * dx;
    const ny = y - i * dy;
    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) {
      blocks++;
      break;
    }
    const cell = board[nx][ny];
    if (cell === player) {
      count++;
      i++;
    } else if (cell === EMPTY) {
      break;
    } else {
      blocks++;
      break;
    }
  }

  return { count, blocks };
};

// 调整后的评分函数
const evaluatePoint = (board, x, y, player) => {
  let totalScore = 0;

  const directions = [
    [1, 0], // 横向
    [0, 1], // 纵向
    [1, 1], // 对角线 \
    [1, -1], // 对角线 /
  ];

  for (let [dx, dy] of directions) {
    const { count, blocks } = countStones(board, x, y, dx, dy, player);
    totalScore += getScore(count, blocks, player === aiColor);
  }

  return totalScore;
};

// 根据连续的棋子数和封堵情况返回分数
const getScore = (count, blocks, isAI) => {
  if (blocks >= 2 && count < 5) return 0;
  let score = 0;
  switch (count) {
    case 5:
      score = SCORES.FIVE;
      break;
    case 4:
      score = blocks === 0 ? SCORES.FOUR : SCORES.BLOCKED_FOUR;
      break;
    case 3:
      score = blocks === 0 ? SCORES.THREE : SCORES.BLOCKED_THREE;
      break;
    case 2:
      score = blocks === 0 ? SCORES.TWO : SCORES.BLOCKED_TWO;
      break;
    default:
      score = 0;
      break;
  }
  // 如果是AI的棋型，权重更大
  return isAI ? score : score / 2;
};

// 检查是否有威胁（指定连珠数）
const hasThreat = (board, player, threatLevel) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === EMPTY) {
        if (isThreateningMove(board, i, j, player, threatLevel)) {
          return [i, j];
        }
      }
    }
  }
  return null;
};

// 检查当前位置是否能形成特定威胁
const isThreateningMove = (board, x, y, player, threatLevel) => {
  const directions = [
    [1, 0], // 横向
    [0, 1], // 纵向
    [1, 1], // 对角线 \
    [1, -1], // 对角线 /
  ];

  for (let [dx, dy] of directions) {
    let { count, blocks } = countStones(board, x, y, dx, dy, player);
    if (blocks < 2 && count >= threatLevel) {
      return true;
    }
  }

  return false;
};

// 使用 Minimax 算法结合 Alpha-Beta 剪枝
const getBestMove = (
  board,
  player,
  opponent,
  depth = MAX_DEPTH,
  alpha = -Infinity,
  beta = Infinity
) => {
  if (depth === 0) {
    const score = evaluateBoard(board, aiColor, opponent);
    return [null, null, score];
  }

  // 检查AI是否有必胜机会
  const aiWinMove = hasThreat(board, aiColor, 5);
  if (aiWinMove) return [aiWinMove[0], aiWinMove[1], Infinity];

  // 检查对手是否有必胜机会
  const opponentWinMove = hasThreat(board, opponent, 5);
  if (opponentWinMove) return [opponentWinMove[0], opponentWinMove[1], -Infinity];

  // 检查AI是否有活四（进攻优先）
  const aiFourMove = hasThreat(board, aiColor, 4);
  if (aiFourMove && depth === MAX_DEPTH) return [aiFourMove[0], aiFourMove[1], Infinity];

  // 检查对手是否有活四或活三（防守其次）
  const opponentThreatMove =
    hasThreat(board, opponent, 4) || hasThreat(board, opponent, 3);
  if (opponentThreatMove && depth === MAX_DEPTH) {
    return [opponentThreatMove[0], opponentThreatMove[1], -Infinity];
  }

  const moves = generateMoves(board);

  let bestMove = null;
  let bestScore = player === aiColor ? -Infinity : Infinity;

  for (let [i, j] of moves) {
    board[i][j] = player;

    const [_, __, score] = getBestMove(
      board,
      opponent,
      player,
      depth - 1,
      alpha,
      beta
    );
    board[i][j] = EMPTY;

    if (player === aiColor) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = [i, j];
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = [i, j];
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      break;
    }
  }

  return [...(bestMove || [0, 0]), bestScore];
};

// 评估整个棋盘的得分
const evaluateBoard = (board, player, opponent) => {
  let playerScore = 0;
  let opponentScore = 0;

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === player) {
        playerScore += evaluatePoint(board, i, j, player);
      } else if (board[i][j] === opponent) {
        opponentScore += evaluatePoint(board, i, j, opponent);
      }
    }
  }

  return playerScore - opponentScore;
};

// 生成可行的走法，只考虑已有棋子附近的空位，并加入关键位置
const generateMoves = (board) => {
  const moves = [];
  const visited = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(false)
  );

  // 优先考虑能形成四连或阻挡对手威胁的走法
  const criticalMoves = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === EMPTY) {
        if (
          isThreateningMove(board, i, j, aiColor, 4) ||
          isThreateningMove(board, i, j, aiColor === BLACK ? WHITE : BLACK, 4)
        ) {
          criticalMoves.push([i, j]);
          visited[i][j] = true;
        }
      }
    }
  }

  if (criticalMoves.length > 0) {
    return criticalMoves;
  }

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] !== EMPTY) {
        for (let x = -2; x <= 2; x++) {
          for (let y = -2; y <= 2; y++) {
            const nx = i + x;
            const ny = j + y;
            if (
              nx >= 0 &&
              nx < BOARD_SIZE &&
              ny >= 0 &&
              ny < BOARD_SIZE &&
              board[nx][ny] === EMPTY &&
              !visited[nx][ny]
            ) {
              moves.push([nx, ny]);
              visited[nx][ny] = true;
            }
          }
        }
      }
    }
  }

  // 如果棋盘为空，返回中心点
  if (moves.length === 0) {
    const center = Math.floor(BOARD_SIZE / 2);
    moves.push([center, center]);
  }

  return moves;
};

// 检查是否胜利
const checkWin = (x, y, player, board) => {
  return (
    checkLine(x, y, 1, 0, player, board) || // 横向
    checkLine(x, y, 0, 1, player, board) || // 纵向
    checkLine(x, y, 1, 1, player, board) || // 对角线1
    checkLine(x, y, 1, -1, player, board) // 对角线2
  );
};

// 检查某一方向是否有五连珠
const checkLine = (x, y, dx, dy, player, board) => {
  let count = 1;

  for (let i = 1; i < 5; i++) {
    const newX = x + i * dx;
    const newY = y + i * dy;
    if (
      newX >= 0 &&
      newX < BOARD_SIZE &&
      newY >= 0 &&
      newY < BOARD_SIZE &&
      board[newX][newY] === player
    ) {
      count++;
    } else {
      break;
    }
  }

  for (let i = 1; i < 5; i++) {
    const newX = x - i * dx;
    const newY = y - i * dy;
    if (
      newX >= 0 &&
      newX < BOARD_SIZE &&
      newY >= 0 &&
      newY < BOARD_SIZE &&
      board[newX][newY] === player
    ) {
      count++;
    } else {
      break;
    }
  }

  return count >= 5;
};

const App = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [playerColor, setPlayerColor] = useState(null); // 初始为 null，待游戏开始时设置
  const [winner, setWinner] = useState(null);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasMinted, setHasMinted] = useState(false); // 新增状态，记录玩家是否已经领取过 NFT

  useEffect(() => {
    if (window.ethereum) {
      // 监听账户和网络变化
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [gameStarted, isPaused]);

  // 处理账户变化
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      setHasMinted(false); // 账户切换时，重置已领取状态
      // 检查是否已经领取过 NFT
      if (provider) {
        checkIfMinted(accounts[0], provider);
      }
    } else {
      setWalletAddress(null);
      setGameStarted(false);
      setHasMinted(false);
    }
  };

  // 处理链变化
  const handleChainChanged = async (chainId) => {
    if (chainId !== ASSETHUB_CHAIN_ID) {
      alert('请切换到 Assethub 网络');
      try {
        await switchToAssetHubChain();
      } catch (error) {
        console.error(error);
        alert('切换网络失败，请手动切换到 Assethub 网络');
      }
      if (gameStarted) {
        setIsPaused(true);
      }
    } else {
      if (gameStarted && isPaused) {
        setIsPaused(false);
      }
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = ethProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setProvider(ethProvider);

        const network = await ethProvider.getNetwork();
        if (network.chainId !== parseInt(ASSETHUB_CHAIN_ID, 16)) {
          await switchToAssetHubChain();
        }

        // 检查是否已经领取过 NFT
        checkIfMinted(address, ethProvider);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert('请安装 MetaMask 钱包');
    }
  };

  // 切换到 AssetHub 网络
  const switchToAssetHubChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x190f1b45' }],
      });
    } catch (switchError) {
      // 如果网络尚未添加到钱包中，则添加网络
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x190f1b45',
              chainName: 'AssetHub Westend',
              rpcUrls: ['https://westend-assethub-eth-rpc.polkadot.io'],
              nativeCurrency: {
                name: 'WestendDOT',
                symbol: 'WND',
                decimals: 18,
              },
              blockExplorerUrls: ['https://blockscout-asset-hub.parity-chains-scw.parity.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  // 检查玩家是否已经领取过 NFT
  const checkIfMinted = async (address, ethProvider) => {
    try {
      const contract = new ethers.Contract(contractAddress, GomokuGameABI, ethProvider);
      const hasMintedNFT = await contract.hasMinted(address);
      setHasMinted(hasMintedNFT);
    } catch (error) {
      console.error(error);
    }
  };

  // 开始游戏
  const startGame = () => {
    if (!walletAddress) {
      alert('请先连接钱包');
      return;
    }
    setBoard(initializeBoard());
    setWinner(null);
    setGameStarted(true);
    setIsPaused(false);

    const isPlayerBlack = Math.random() > 0.5;
    if (isPlayerBlack) {
      setPlayerColor(BLACK);
      aiColor = WHITE;
      setIsAiTurn(false);
    } else {
      setPlayerColor(WHITE);
      aiColor = BLACK;
      setIsAiTurn(true);
    }
  };

  // 玩家点击棋盘落子
  const handleBoardClick = useCallback(
    (x, y) => {
      if (!gameStarted || isPaused) return;
      if (board[x][y] || winner || isAiTurn) return;
      const newBoard = board.map((row) => row.slice());
      newBoard[x][y] = playerColor;
      setBoard(newBoard);

      if (checkWin(x, y, playerColor, newBoard)) {
        setWinner(playerColor);
        alert('玩家获胜！');
        setGameStarted(false);
        // 调用合约铸造 NFT
        if (walletAddress && provider) {
          if (!hasMinted) {
            mintNFT();
          } else {
            alert('您已经领取过 NFT 奖励，每个账户只能领取一次。');
          }
        } else {
          alert('请连接钱包以领取 NFT 奖励');
        }
        return;
      }

      setIsAiTurn(true);
    },
    [board, winner, isAiTurn, playerColor, walletAddress, provider, gameStarted, isPaused, hasMinted]
  );

  // AI 落子逻辑
  useEffect(() => {
    if (isAiTurn && !winner && gameStarted && !isPaused) {
      setTimeout(() => {
        const [bestX, bestY] = getBestMove(
          board.map((row) => row.slice()),
          aiColor,
          playerColor
        );
        handleBoardClickForAi(bestX, bestY);
      }, 500);
    }
  }, [isAiTurn, board, winner, gameStarted, isPaused]);

  // AI 落子
  const handleBoardClickForAi = (x, y) => {
    if (!gameStarted || isPaused) return;
    if (board[x][y] || winner) return;
    const newBoard = board.map((row) => row.slice());
    newBoard[x][y] = aiColor;
    setBoard(newBoard);

    if (checkWin(x, y, aiColor, newBoard)) {
      setWinner(aiColor);
      alert('AI获胜！');
      setGameStarted(false);
      return;
    }

    setIsAiTurn(false);
  };

  // 调用智能合约铸造 NFT
  const mintNFT = async () => {
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, GomokuGameABI, signer);

      // 调用合约的 mint 函数
      const tx = await contract.mintNFT(walletAddress);
      await tx.wait();
      alert('恭喜您获得了五子棋冠军 NFT！');
      setHasMinted(true);
    } catch (error) {
      console.error(error);
      if (error.code === -32603 || error.data?.message.includes('Already minted')) {
        alert('您已经领取过 NFT 奖励，每个账户只能领取一次。');
        setHasMinted(true);
      } else {
        alert('NFT 领取失败，请稍后重试');
      }
    }
  };

  // 渲染钱包地址
  const renderWalletAddress = () => {
    if (walletAddress) {
      const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
      return `已连接 (${shortAddress})`;
    } else {
      return '连接钱包';
    }
  };

  // 渲染棋盘
  return (
    <div className="game-board">
      <h1>五子棋</h1>
      {winner && <h2>{winner === playerColor ? '玩家获胜！' : 'AI获胜！'}</h2>}
      <button className="wallet-button" onClick={connectWallet}>
        {renderWalletAddress()}
      </button>
      {isPaused && <h2 className="paused">游戏已暂停，请切换回 AssetHub 网络</h2>}
      <div className="board">
        {board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`cell ${
                  cell === BLACK ? 'black' : cell === WHITE ? 'white' : ''
                }`}
                onClick={() => handleBoardClick(rowIndex, cellIndex)}
              />
            ))}
          </div>
        ))}
      </div>
      <button
        className="start-button"
        onClick={startGame}
        disabled={!walletAddress || gameStarted}
      >
        {gameStarted ? '游戏进行中...' : winner ? '再来一局？' : '开始游戏'}
      </button>
    </div>
  );
};

export default App;
