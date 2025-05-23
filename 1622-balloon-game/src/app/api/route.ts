import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createGameRoom, getGameRoom, updateGameRoom, getAvailableRooms, deleteGameRoom } from '@/utils/dynamodb';
import { GameRoom, GameStatus, Player } from '@/types/dynamodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/contracts';

// 从环境变量获取管理员私钥
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }

  try {
    const { gameId, winner } = req.body;

    if (!gameId || !winner) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!ADMIN_PRIVATE_KEY) {
      return res.status(500).json({ error: '管理员私钥未配置' });
    }

    // 创建RPC提供者和管理员钱包
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, adminWallet);

    // 调用合约结束游戏
    const tx = await contract.endGame(gameId, winner);
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: '游戏结果已提交到合约',
      txHash: receipt.transactionHash
    });
  } catch (error: any) {
    console.error('提交游戏结果失败:', error);
    return res.status(500).json({
      error: '提交游戏结果失败',
      message: error.message
    });
  }
}
// --- 智能合约交互相关函数 ---
async function initiateSmartContractVrfRangeRequest(roomId: string): Promise<string> {
  const vrfRequestId = `vrf_range_req_${roomId}_${Date.now()}`;
  const now = Date.now();

  // 更新房间状态
  await updateGameRoom(roomId, {
    vrfRequestId,
    status: 'waitingForSubmissions',
    targetRangeMin: 6,
    targetRangeMax: 10,
    updatedAt: now
  });

  return vrfRequestId;
}

async function checkVrfRangeResult(roomId: string): Promise<{ min?: number; max?: number } | null> {
  // 不需要检查，因为在initiateSmartContractVrfRangeRequest中已经设置了范围
  return null;
}

async function initiateSmartContractFinalTargetRequest(roomId: string): Promise<string> {
  const vrfRequestId = `vrf_final_req_${roomId}_${Date.now()}`;
  const now = Date.now();

  // 获取房间信息以访问范围值
  const room = await getGameRoom(roomId);
  if (!room || !room.targetRangeMin || !room.targetRangeMax || !room.creator.balloonSize || !room.opponent?.balloonSize) {
    throw new Error('房间信息不完整');
  }

  // 使用固定的目标值代替VRF (这里应该调用智能合约)
  const finalTarget = 8; // 固定在中间位置

  // 更新房间状态
  await updateGameRoom(roomId, {
    vrfRequestId,
    status: 'finished' as GameStatus,
    finalTargetValue: finalTarget,
    winner: determineWinner(room, finalTarget),
    updatedAt: now
  });

  return vrfRequestId;
}

// 辅助函数：计算获胜者
function determineWinner(room: GameRoom, finalTarget: number): string {
  if (!room.creator.balloonSize || !room.opponent?.balloonSize) {
    return room.creator.address; // 如果有一方未提交，另一方获胜
  }

  const creatorDiff = Math.abs(room.creator.balloonSize - finalTarget);
  const opponentDiff = Math.abs(room.opponent.balloonSize - finalTarget);

  if (creatorDiff < opponentDiff) {
    return room.creator.address;
  } else if (opponentDiff < creatorDiff) {
    return room.opponent.address;
  } else {
    // 平局情况下，先提交的玩家获胜
    const creatorSubmitTime = room.creator.confirmedAt || Number.MAX_SAFE_INTEGER;
    const opponentSubmitTime = room.opponent.confirmedAt || Number.MAX_SAFE_INTEGER;
    return creatorSubmitTime < opponentSubmitTime
      ? room.creator.address
      : room.opponent.address;
  }
}

async function checkFinalTargetResultAndDetermineWinner(roomId: string): Promise<{ target?: number; winner?: string } | null> {
  // 不需要检查，因为在initiateSmartContractFinalTargetRequest中已经设置了所有值
  return null;
}

// --- API 路由处理程序 ---

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action } = data;

    switch (action) {
      case 'createRoom': {
        const { playerAddress, stakeAmount, roomId } = data;
        if (!playerAddress || !stakeAmount) {
          return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
        }

        const now = Date.now();
        const room: GameRoom = {
          roomId: roomId || uuidv4(), // 优先用前端传入的6位数字ID
          creator: {
            address: playerAddress,
            hasConfirmedStart: false,
            hasSubmitted: false,
            balloonSize: 1
          },
          stakeAmount,
          status: 'waiting',
          createdAt: now,
          updatedAt: now,
          expiresAt: Math.floor(now / 1000) + 3600, // 1小时后过期
        };

        const createdRoom = await createGameRoom(room);
        return NextResponse.json(createdRoom);
      }

      case 'joinRoom': {
        const { roomId, playerAddress } = data;
        const room = await getGameRoom(roomId);

        if (!room || room.status !== 'waiting') {
          return NextResponse.json({ error: '房间不存在或不可加入' }, { status: 400 });
        }

        const now = Date.now();
        // 初始化对手状态，并确保状态为 readyToStart
        const updatedRoom = await updateGameRoom(roomId, {
          opponent: {
            address: playerAddress,
            hasConfirmedStart: false,
            hasSubmitted: false,
            balloonSize: 1,
          },
          status: 'readyToStart',
          updatedAt: now
        });

        console.log('挑战者加入房间:', {
          roomId,
          playerAddress,
          status: updatedRoom.status,
          creator: updatedRoom.creator.address,
          opponent: updatedRoom.opponent?.address,
        });

        return NextResponse.json(updatedRoom);
      }

      case 'confirmStart': {
        const { roomId, playerAddress } = data;
        const room = await getGameRoom(roomId);

        console.log('收到确认请求:', {
          roomId,
          playerAddress,
          roomStatus: room?.status,
          creatorAddress: room?.creator.address,
          opponentAddress: room?.opponent?.address
        });

        // 房间检查
        if (!room) {
          return NextResponse.json({ error: '房间不存在' }, { status: 400 });
        }

        // 如果房间状态是waiting但有opponent，自动转为readyToStart
        if (room.status === 'waiting' && room.opponent) {
          await updateGameRoom(roomId, { status: 'readyToStart' });
          const refreshedRoom = await getGameRoom(roomId);
          if (!refreshedRoom) {
            return NextResponse.json({ error: '刷新房间状态失败' }, { status: 500 });
          }
          room.status = 'readyToStart';
        }

        if (room.status !== 'readyToStart') {
          return NextResponse.json({ error: '房间状态错误' }, { status: 400 });
        }

        const now = Date.now();

        // 简化确认逻辑，检查是否房主，否则就视为挑战者
        const normalizedPlayerAddress = playerAddress.toLowerCase();
        const normalizedCreatorAddress = room.creator.address.toLowerCase();
        const isCreator = normalizedPlayerAddress === normalizedCreatorAddress;

        // 创建完整的房间更新对象，确保不丢失任何数据
        const roomUpdate: Partial<GameRoom> = {
          updatedAt: now
        };

        // 复制现有数据以确保数据完整性
        if (isCreator) {
          // 是房主
          console.log('房主确认开始游戏');
          roomUpdate.creator = {
            ...room.creator,
            hasConfirmedStart: true
          };
        } else {
          // 不是房主，一定是挑战者
          console.log('挑战者确认开始游戏');
          if (!room.opponent) {
            // 如果没有opponent字段，创建一个完整的对象
            roomUpdate.opponent = {
              address: playerAddress,
              balloonSize: 1,
              hasConfirmedStart: true,
              hasSubmitted: false
            };
          } else {
            // 确保使用完整的对象更新
            roomUpdate.opponent = {
              ...room.opponent,
              hasConfirmedStart: true
            };
          }
        }

        // 确保保留未更新的玩家数据
        if (isCreator && room.opponent) {
          roomUpdate.opponent = { ...room.opponent };
        } else if (!isCreator) {
          roomUpdate.creator = { ...room.creator };
        }

        console.log('确认前房间状态:', {
          roomId,
          status: room.status,
          creator: room.creator,
          opponent: room.opponent
        });

        console.log('准备更新房间:', JSON.stringify(roomUpdate, null, 2));

        // 先检查当前房间的确认状态
        if (room.creator.hasConfirmedStart && room.opponent?.hasConfirmedStart) {
          // 如果更新前已经双方都确认了，直接开始游戏
          console.log('检测到双方已经确认，直接开始游戏');
          await initiateSmartContractVrfRangeRequest(roomId);
          const gameStartedRoom = await getGameRoom(roomId);

          if (!gameStartedRoom) {
            return NextResponse.json({ error: '获取游戏开始状态失败' }, { status: 500 });
          }

          console.log('游戏直接开始，最终状态:', {
            status: gameStartedRoom.status,
            targetRangeMin: gameStartedRoom.targetRangeMin,
            targetRangeMax: gameStartedRoom.targetRangeMax
          });

          return NextResponse.json(gameStartedRoom);
        }

        // 如果还没有双方都确认，更新当前玩家的确认状态
        const updatedRoom = await updateGameRoom(roomId, roomUpdate);

        console.log('更新后房间状态:', {
          roomId,
          status: updatedRoom.status,
          creatorConfirmed: updatedRoom.creator.hasConfirmedStart,
          opponentConfirmed: updatedRoom.opponent?.hasConfirmedStart
        });

        // 再次检查是否更新后双方都已确认
        const bothConfirmed = updatedRoom.creator.hasConfirmedStart === true &&
          updatedRoom.opponent?.hasConfirmedStart === true;

        console.log('双方确认状态:', {
          creatorConfirmed: updatedRoom.creator.hasConfirmedStart,
          opponentConfirmed: updatedRoom.opponent?.hasConfirmedStart,
          bothConfirmed
        });

        // 如果更新后双方都已确认，开始游戏
        if (bothConfirmed) {
          console.log('更新后双方都已确认，开始游戏');
          await initiateSmartContractVrfRangeRequest(roomId);

          // 重新获取最新房间状态
          const gameStartedRoom = await getGameRoom(roomId);

          if (!gameStartedRoom) {
            return NextResponse.json({ error: '获取游戏开始状态失败' }, { status: 500 });
          }

          console.log('游戏开始，最终房间状态:', {
            status: gameStartedRoom.status,
            targetRangeMin: gameStartedRoom.targetRangeMin,
            targetRangeMax: gameStartedRoom.targetRangeMax
          });

          return NextResponse.json(gameStartedRoom);
        }

        // 如果还没有双方都确认，返回更新后的房间状态
        return NextResponse.json(updatedRoom);
      }

      case 'syncBalloonSize': {
        const { roomId, playerAddress, playerUpdate } = data;
        const room = await getGameRoom(roomId);
        if (!room || room.status !== 'waitingForSubmissions') {
          return NextResponse.json({ error: '房间不在等待提交状态' }, { status: 400 });
        }
        let updates: Partial<GameRoom> = {};
        if (room.creator.address === playerAddress) {
          updates.creator = {
            ...room.creator,
            balloonSize: playerUpdate.balloonSize,
            address: room.creator.address,
            hasSubmitted: room.creator.hasSubmitted ?? false,
            hasConfirmedStart: room.creator.hasConfirmedStart ?? false
          };
        } else if (room.opponent && room.opponent.address === playerAddress) {
          updates.opponent = {
            ...room.opponent,
            balloonSize: playerUpdate.balloonSize,
            address: room.opponent.address,
            hasSubmitted: room.opponent.hasSubmitted ?? false,
            hasConfirmedStart: room.opponent.hasConfirmedStart ?? false
          };
        }
        const updatedRoom = await updateGameRoom(roomId, updates);
        return NextResponse.json(updatedRoom);
      }

      case 'submitBalloonSize': {
        const { roomId, playerAddress, playerUpdate } = data;
        const room = await getGameRoom(roomId);

        if (!room || room.status !== 'waitingForSubmissions') {
          return NextResponse.json({ error: '房间不在等待提交状态' }, { status: 400 });
        }

        const balloonSize = Number(playerUpdate?.balloonSize);
        if (!playerUpdate?.balloonSize ||
          typeof balloonSize !== 'number' ||
          isNaN(balloonSize) ||
          balloonSize < 1 ||
          balloonSize > 10) {
          return NextResponse.json({
            error: '提交的气球大小无效',
            details: {
              receivedValue: playerUpdate?.balloonSize,
              parsedValue: balloonSize
            }
          }, { status: 400 });
        }

        const now = Date.now();
        let updates: Partial<GameRoom> = {
          updatedAt: now
        };

        const submitBalloonSize = playerUpdate.balloonSize;

        if (room.creator.address === playerAddress) {
          if (room.creator.hasSubmitted) {
            return NextResponse.json({ error: '已经提交过气球大小' }, { status: 400 });
          }
          updates.creator = {
            ...room.creator,
            balloonSize: submitBalloonSize,
            hasSubmitted: true,
            confirmedAt: now
          };
        } else if (room.opponent?.address === playerAddress) {
          if (!room.opponent) return NextResponse.json({ error: '对手不存在' }, { status: 400 });
          if (room.opponent.hasSubmitted) {
            return NextResponse.json({ error: '已经提交过气球大小' }, { status: 400 });
          }
          updates.opponent = {
            ...room.opponent,
            balloonSize: submitBalloonSize,
            hasSubmitted: true,
            confirmedAt: now
          };
        } else {
          return NextResponse.json({ error: '玩家不在此房间中或已提交' }, { status: 400 });
        }

        const updatedRoom = await updateGameRoom(roomId, updates);

        // 检查是否有一方爆炸
        const MAX = 10;
        const creatorSize = updatedRoom.creator.balloonSize;
        const opponentSize = updatedRoom.opponent?.balloonSize;

        if (!creatorSize) {
          console.error('创建者气球大小未定义');
          return NextResponse.json({ error: '创建者气球大小未定义' }, { status: 500 });
        }

        // 检查爆炸情况
        if (creatorSize > MAX || (opponentSize && opponentSize > MAX)) {
          let winner: string;

          if (creatorSize > MAX && (!opponentSize || opponentSize <= MAX)) {
            // 创建者爆炸，对手获胜
            winner = updatedRoom.opponent?.address || '';
          } else if (opponentSize && opponentSize > MAX && creatorSize <= MAX) {
            // 对手爆炸，创建者获胜
            winner = updatedRoom.creator.address;
          } else {
            // 都爆炸了，谁的气球小谁赢
            winner = (creatorSize < opponentSize!)
              ? updatedRoom.creator.address
              : (updatedRoom.opponent?.address || '');
          }

          if (!winner) {
            console.error('无法确定获胜者');
            return NextResponse.json({ error: '无法确定获胜者' }, { status: 500 });
          }

          await updateGameRoom(roomId, {
            status: 'finished' as GameStatus,
            winner,
            updatedAt: now
          });

          console.log('游戏结算完成:', {
            creatorSize,
            opponentSize,
            winner,
          });

          const finishedRoom = await getGameRoom(roomId);
          return NextResponse.json(finishedRoom);
        }

        // 检查是否双方都已提交
        if (updatedRoom.creator.hasSubmitted && updatedRoom.opponent?.hasSubmitted) {
          // 更新状态为确定获胜者
          await updateGameRoom(roomId, {
            status: 'determiningWinner' as GameStatus,
            updatedAt: now
          });
          // 触发智能合约请求最终目标值
          await initiateSmartContractFinalTargetRequest(roomId);
        }

        return NextResponse.json(updatedRoom);
      }

      case 'deleteRoom': {
        const { roomId, playerAddress } = data;
        const room = await getGameRoom(roomId);
        if (!room) {
          return NextResponse.json({ error: '房间不存在' }, { status: 400 });
        }
        // 只有房主可以删除且房间未开始
        if (room.creator.address !== playerAddress || room.status !== 'waiting') {
          return NextResponse.json({ error: '无权删除房间或房间已开始' }, { status: 403 });
        }
        // 删除房间
        await deleteGameRoom(roomId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getAvailableRooms': {
        const rooms = await getAvailableRooms();
        return NextResponse.json(rooms);
      }

      case 'getRoomStatus': {
        const roomId = searchParams.get('roomId');
        if (!roomId) return NextResponse.json({ error: '缺少房间ID' }, { status: 400 });

        const room = await getGameRoom(roomId);
        if (!room) return NextResponse.json({ error: '房间不存在' }, { status: 404 });

        // 直接返回房间状态，因为状态转换已经在其他函数中处理
        return NextResponse.json(room);
      }

      default:
        return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
