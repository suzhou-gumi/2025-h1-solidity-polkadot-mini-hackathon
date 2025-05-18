import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/contractInteraction';

// 管理员私钥 - 注意：在实际生产中应该使用环境变量并加密存储
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || 'YOUR_ADMIN_PRIVATE_KEY';

// 设置RPC提供商
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY');

// 创建管理员钱包
const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

// 连接合约
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, adminWallet);

// 游戏房间数据存储
let rooms: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        if (method === 'GET') {
            const { action, roomId } = req.query;

            if (action === 'getAvailableRooms') {
                // 返回等待中的房间
                const availableRooms = rooms.filter(room => room.status === 'waiting');
                return res.status(200).json(availableRooms);
            }

            if (action === 'getRoomStatus' && roomId) {
                // 获取房间状态
                const room = rooms.find(r => r.roomId === roomId);
                if (!room) {
                    return res.status(404).json({ error: '房间不存在' });
                }
                return res.status(200).json(room);
            }

            return res.status(400).json({ error: '无效的操作' });
        }

        if (method === 'POST') {
            const { action, roomId, playerAddress, playerUpdate, stakeAmount, txHash } = req.body;

            if (action === 'createRoom') {
                // 创建房间
                const newRoom = {
                    roomId,
                    status: 'waiting',
                    creator: { address: playerAddress, ready: false },
                    challenger: { address: '', ready: false },
                    stakeAmount: stakeAmount || 0.01,
                    txHash,
                    gameState: null
                };

                rooms.push(newRoom);
                return res.status(200).json(newRoom);
            }

            if (action === 'joinRoom') {
                // 加入房间
                const roomIndex = rooms.findIndex(room => room.roomId === roomId);
                if (roomIndex === -1) {
                    return res.status(404).json({ error: '房间不存在' });
                }

                if (rooms[roomIndex].status !== 'waiting') {
                    return res.status(400).json({ error: '房间无法加入' });
                }

                rooms[roomIndex].challenger = { address: playerAddress, ready: false };
                rooms[roomIndex].status = 'readyToStart';

                return res.status(200).json(rooms[roomIndex]);
            }

            if (action === 'updateGame') {
                // 更新游戏状态
                const roomIndex = rooms.findIndex(room => room.roomId === roomId);
                if (roomIndex === -1) {
                    return res.status(404).json({ error: '房间不存在' });
                }

                const room = rooms[roomIndex];

                // 更新玩家状态
                if (playerUpdate) {
                    if (playerAddress.toLowerCase() === room.creator.address.toLowerCase()) {
                        room.creator = { ...room.creator, ...playerUpdate };
                    } else if (playerAddress.toLowerCase() === room.challenger.address.toLowerCase()) {
                        room.challenger = { ...room.challenger, ...playerUpdate };
                    }

                    // 如果双方都准备好，开始游戏
                    if (room.status === 'readyToStart' && room.creator.ready && room.challenger.ready) {
                        room.status = 'playing';
                        room.gameState = {
                            // 游戏初始状态
                            balloonSize: 100,
                            currentPlayer: 'creator',
                            lastAction: null
                        };
                    }

                    // 如果游戏结束，调用合约处理结果
                    if (playerUpdate.gameOver) {
                        const winner = playerUpdate.winner;
                        let winnerAddress;

                        if (winner === 'creator') {
                            winnerAddress = room.creator.address;
                        } else if (winner === 'challenger') {
                            winnerAddress = room.challenger.address;
                        } else {
                            return res.status(400).json({ error: '无效的获胜者' });
                        }

                        try {
                            // 调用合约提交游戏结果
                            const tx = await contract.endGame(roomId, winnerAddress);
                            await tx.wait();

                            console.log(`游戏${roomId}结束，获胜者: ${winnerAddress}`);
                            room.status = 'completed';
                            room.winner = winner;
                        } catch (error) {
                            console.error('提交游戏结果失败:', error);
                            return res.status(500).json({ error: '提交游戏结果到合约失败' });
                        }
                    }
                }

                return res.status(200).json(room);
            }

            if (action === 'deleteRoom') {
                // 删除房间
                rooms = rooms.filter(room => room.roomId !== roomId);
                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: '无效的操作' });
        }

        return res.status(405).json({ error: '方法不允许' });
    } catch (error) {
        console.error('API错误:', error);
        return res.status(500).json({ error: '服务器内部错误' });
    }
}