"use client";

import { NextPage } from "next";
import { useState, useEffect, useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GameLobby } from "../components/game/GameLobby";
import { GameRoom } from "../components/game/GameRoom";
import type { GameRoom as GameRoomType } from '../components/game/types';
import { useGameContext } from '../components/game/GameContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/contracts';

// 创建游戏
export async function createGame(gameId: string) {
  try {
    if (!window.ethereum) throw new Error("需要安装MetaMask钱包");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const stakeAmount = ethers.utils.parseEther("0.01");

    const tx = await contract.createGame(gameId, { value: stakeAmount });
    const receipt = await tx.wait();

    console.log("游戏创建成功:", receipt);
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error("创建游戏失败:", error);
    return { success: false, error: error instanceof Error ? error.message : "未知错误" };
  }
}

// 加入游戏
export async function joinGame(gameId: string) {
  try {
    if (!window.ethereum) throw new Error("需要安装MetaMask钱包");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const stakeAmount = ethers.utils.parseEther("0.01");

    const tx = await contract.joinGame(gameId, { value: stakeAmount });
    const receipt = await tx.wait();

    console.log("加入游戏成功:", receipt);
    return { success: true, txHash: receipt.transactionHash };
  } catch (error) {
    console.error("加入游戏失败:", error);
    return { success: false, error: error instanceof Error ? error.message : "未知错误" };
  }
}

// 游戏结束时调用此函数
async function submitGameResult(gameId: string, winner: string) {
  try {
    const response = await fetch("/api/game-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        winner // 传递获胜者的钱包地址
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "提交结果失败");
    }

    console.log("游戏结果已提交:", result);
    return result;
  } catch (error) {
    console.error("提交游戏结果错误:", error);
    throw error;
  }
}

const InnerPage: NextPage = () => {
  const { address: playerAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { gameRoom, setGameRoom } = useGameContext();
  const [availableRooms, setAvailableRooms] = useState<GameRoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gameMessage, setGameMessage] = useState("");

  // API Helper Function
  const apiRequest = async (endpoint: string, method: "GET" | "POST", body?: any) => {
    const isPolling = endpoint.includes('getRoomStatus');
    if (!isPolling && isLoading) return null;

    if (!isPolling) {
      setIsLoading(true);
      setGameMessage("");
    }

    try {
      // 清理 body 对象中的循环引用
      const cleanBody = body ? JSON.parse(JSON.stringify(body, (key, value) => {
        if (key === 'target' || key === 'currentTarget' || key.startsWith('__react')) {
          return undefined; // 移除 React 相关的属性
        }
        return value;
      })) : undefined;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(cleanBody) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      if (!isPolling) {
        const errorMsg = error.message || "未知错误";
        setGameMessage(`错误: ${errorMsg}`);
        console.error('API Request Error:', error);
        throw error;
      }
      return null;
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  };

  // 生成6位数字房间ID
  function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const handleCreateGame = async (stakeAmount: number) => {
    if (!playerAddress) {
      setGameMessage("请先连接钱包");
      return;
    }

    try {
      setIsLoading(true);
      setGameMessage("正在创建房间，请在钱包中确认交易...");

      // 生成房间ID
      const roomId = generateRoomId();

      // 调用合约创建游戏并支付ETH
      const contractResult = await createGame(roomId);

      if (!contractResult.success) {
        throw new Error(`合约交互失败: ${contractResult.error}`);
      }

      // 合约交互成功后，创建房间
      const room = await apiRequest("/api", "POST", {
        action: "createRoom",
        playerAddress,
        stakeAmount,
        roomId,
        txHash: contractResult.txHash  // 传递交易哈希
      });

      if (room) {
        setGameRoom(room);
        setGameMessage("房间创建成功！质押已锁定在合约中");
      }
    } catch (error: any) {
      setGameMessage(`创建房间失败: ${error.message || "未知错误"}`);
      console.error('Create game error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (roomId: string) => {
    if (!playerAddress) {
      setGameMessage("请先连接钱包");
      return;
    }

    try {
      setIsLoading(true);
      setGameMessage("正在加入房间，请在钱包中确认交易...");

      // 调用合约加入游戏并支付ETH
      const contractResult = await joinGame(roomId);

      if (!contractResult.success) {
        throw new Error(`合约交互失败: ${contractResult.error}`);
      }

      // 合约交互成功后，加入房间
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "joinRoom",
          roomId,
          playerAddress,
          txHash: contractResult.txHash  // 传递交易哈希
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '加入房间失败');
      }

      console.log('加入房间返回数据:', data);

      // 确保房间状态正确
      if (data && data.roomId) {
        // 明确设置挑战者身份和房间状态
        const updatedRoom = {
          ...data,
          status: 'readyToStart', // 强制设置为准备状态
        };

        // 设置房间数据
        setGameRoom(updatedRoom);
        setGameMessage("成功加入房间！质押已锁定在合约中");

        // 立即发送一次状态更新请求以确保同步
        setTimeout(async () => {
          try {
            await fetch(`/api?action=getRoomStatus&roomId=${roomId}`);
          } catch (error) {
            console.error('更新房间状态失败:', error);
          }
        }, 500);
      }
    } catch (error: any) {
      setGameMessage(`加入房间失败: ${error.message || "未知错误"}`);
      console.error('Join game error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    if (gameRoom?.status === 'waiting' && gameRoom.creator.address.toLowerCase() === playerAddress?.toLowerCase()) {
      await apiRequest("/api", "POST", {
        action: "deleteRoom",
        roomId: gameRoom.roomId,
        playerAddress,
      });
    }
    setGameRoom(null);
    setGameMessage("");
    await fetchAvailableRooms();
  };

  const handleUpdateGame = async (updates: any) => {
    if (!gameRoom?.roomId || !playerAddress) return;

    try {
      const room = await apiRequest("/api", "POST", {
        action: updates.action || "updateGame",
        roomId: gameRoom.roomId,
        playerAddress,
        playerUpdate: updates.playerUpdate
      });

      if (room) {
        setGameRoom(room);
      }
    } catch (error) {
      console.error('Update game error:', error);
    }
  };

  const fetchAvailableRooms = useCallback(async () => {
    if (!isConnected) return;

    try {
      const rooms = await apiRequest("/api?action=getAvailableRooms", "GET");
      if (rooms) {
        setAvailableRooms(rooms);
      }
    } catch (error: any) {
      console.error('Fetch rooms error:', error);
      setGameMessage(`获取房间列表失败: ${error.message || '未知错误'}`);
    }
  }, [isConnected]);

  // 添加轮询获取房间列表
  useEffect(() => {
    if (isConnected && !gameRoom) {
      fetchAvailableRooms();
      const interval = setInterval(fetchAvailableRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [isConnected, gameRoom, fetchAvailableRooms]);

  // Effects
  useEffect(() => {
    if (!isConnected) {
      setGameRoom(null);
      setAvailableRooms([]);
      setGameMessage("");
      return;
    }
    // 钱包连接后更新
    if (!gameRoom) {
      fetchAvailableRooms();
    }
  }, [isConnected, gameRoom, fetchAvailableRooms]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 只在大厅/等待/准备阶段显示顶部信息栏 */}
      {/* ... 保持原有UI ... */}

      {/* {txPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-lg">处理链上交易中...</p>
              <p className="mt-2 text-sm text-gray-500">请在钱包中确认交易</p>
            </div>
          </div>
        </div>
      )} */}
      {(!gameRoom || ['waiting', 'readyToStart'].includes(gameRoom.status)) && (
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <h1 className="text-4xl font-bold">
            Balloon <span className="text-red-500">Duel</span>!!!
          </h1>
          <ConnectButton />
        </header>
      )}

      {!isConnected ? (
        // 未连接钱包
        <div className="text-center py-8">
          <h2 className="text-xl text-gray-700">欢迎!</h2>
          <p className="text-lg text-gray-600 mt-2">请连接您的钱包来玩气球 BOOM!!!</p>
        </div>
      ) : !gameRoom ? (
        // 已连接且未进房间
        <GameLobby
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          availableRooms={availableRooms}
          onRefreshRooms={fetchAvailableRooms}
        />
      ) : (
        // 已进房间，重写状态管理和按钮逻辑
        <GameRoom
          onUpdateGame={handleUpdateGame}
          onLeaveGame={handleLeaveGame}
        />
      )}

      {/* 显示游戏消息 */}
      {gameMessage && (
        <div className={`mt-4 p-4 rounded ${gameMessage.startsWith('错误') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
          {gameMessage}
        </div>
      )}

      {isConnected && (
        <button
          onClick={() => {
            disconnect();
            handleLeaveGame();
          }}
          className="block mx-auto mt-8 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          断开钱包连接
        </button>
      )}
    </div>
  );
};

// 删除冗余的 GameProvider 包裹，直接导出 InnerPage 组件
export default InnerPage;