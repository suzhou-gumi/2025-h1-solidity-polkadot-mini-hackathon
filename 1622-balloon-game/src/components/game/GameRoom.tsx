import React, { useEffect, useState } from 'react';
import { useGameContext } from './GameContext';
import { Balloon } from './Balloon';
import { GAME_DURATION_SECONDS, GameUpdate } from './types';
import { GameStatusDisplay } from './GameStatus';

interface GameRoomProps {
    onUpdateGame: (updates: GameUpdate) => void;
    onLeaveGame: () => void;
}

export const GameRoom: React.FC<GameRoomProps> = ({
    onUpdateGame,
    onLeaveGame,
}) => {
    const { gameRoom, currentPlayer, isCreator, setGameRoom } = useGameContext();
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // 强行设置 readyToStart 状态 (临时修复)
    useEffect(() => {
        if (gameRoom && gameRoom.status === 'waiting' && gameRoom.opponent) {
            console.log('强制设置房间状态为 readyToStart');
            setGameRoom({
                ...gameRoom,
                status: 'readyToStart'
            });
        }
    }, [gameRoom, setGameRoom]);

    // 轮询房间状态
    useEffect(() => {
        if (!gameRoom?.roomId) return;

        console.log('GameRoom - 开始轮询房间状态');

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api?action=getRoomStatus&roomId=${gameRoom.roomId}`);
                const data = await res.json();
                if (data && data.roomId) {
                    console.log('轮询获取房间状态:', data.status);

                    // 只在游戏刚开始时重置计时器
                    if (data.status === 'waitingForSubmissions' &&
                        gameRoom.status !== 'waitingForSubmissions') {
                        console.log('检测到游戏开始！重置计时器');
                        setTimeLeft(GAME_DURATION_SECONDS);
                    }

                    setGameRoom(data);
                }
            } catch (error) {
                console.error('轮询房间状态出错:', error);
            }
        }, 1000);

        return () => {
            console.log('GameRoom - 停止轮询房间状态');
            clearInterval(interval);
        };
    }, [gameRoom?.roomId, setGameRoom]);

    // 游戏计时器
    useEffect(() => {
        // 清理已有的计时器
        if (timer) {
            clearInterval(timer);
            setTimer(null);
        }

        // 只在游戏进行中且玩家未提交时启动计时器
        if (gameRoom?.status === 'waitingForSubmissions' && !currentPlayer?.hasSubmitted) {
            console.log('启动游戏计时器，当前剩余时间:', timeLeft);

            // 创建新的计时器
            const newTimer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;
                    console.log('倒计时:', newTime);

                    // 时间到自动提交
                    if (newTime <= 0) {
                        clearInterval(newTimer);
                        console.log('时间到，自动提交');
                        handleSubmit();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);

            setTimer(newTimer);

            // 清理函数
            return () => {
                console.log('清理计时器');
                clearInterval(newTimer);
            };
        }
    }, [gameRoom?.status, currentPlayer?.hasSubmitted]);

    // 在组件卸载时清理计时器
    useEffect(() => {
        return () => {
            if (timer) {
                console.log('组件卸载，清理计时器');
                clearInterval(timer);
            }
        };
    }, [timer]);

    const handleInflate = () => {
        if (!canInteract) return;
        const newSize = Math.min((currentPlayer?.balloonSize ?? 1) + 0.5, 12);
        onUpdateGame({
            action: 'syncBalloonSize',
            playerUpdate: { balloonSize: newSize }
        });
    };

    const handleSubmit = () => {
        // 只要在游戏中且未提交过就可以提交
        const canSubmit = gameRoom?.status === 'waitingForSubmissions' && !currentPlayer?.hasSubmitted;
        if (!gameRoom || !currentPlayer || !canSubmit) {
            console.log('提交被阻止:', {
                hasGame: !!gameRoom,
                hasPlayer: !!currentPlayer,
                status: gameRoom?.status,
                hasSubmitted: currentPlayer?.hasSubmitted
            });
            return;
        }

        // 构建一个干净的更新对象
        const rawBalloonSize = currentPlayer.balloonSize ?? 1;

        // 确保气球大小在有效范围内
        if (typeof rawBalloonSize !== 'number' || isNaN(rawBalloonSize) || rawBalloonSize < 1 || rawBalloonSize > 10) {
            console.error('气球大小无效:', rawBalloonSize);
            return;
        }

        const balloonSize = Number(rawBalloonSize.toFixed(1));

        console.log('提交气球大小:', {
            currentPlayerBalloonSize: currentPlayer.balloonSize,
            rawBalloonSize,
            balloonSize
        });

        const update: GameUpdate = {
            action: 'submitBalloonSize' as const,
            playerUpdate: {
                balloonSize,
                hasSubmitted: true,
                timestamp: Date.now(),
            }
        };

        // 调用更新函数
        onUpdateGame(update);
    };

    const handleConfirmStart = async () => {
        if (!gameRoom?.roomId || !currentPlayer?.address || isConfirming) return;

        try {
            setIsConfirming(true);
            console.log('发送确认请求:', {
                roomId: gameRoom.roomId,
                playerAddress: currentPlayer.address
            });

            const res = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'confirmStart',
                    roomId: gameRoom.roomId,
                    playerAddress: currentPlayer.address
                })
            });

            const data = await res.json();
            console.log('确认结果:', data);

            if (data && !data.error) {
                console.log('更新游戏状态:', data.status);
                setGameRoom(data);

                // 如果对方已经确认，强制轮询一次房间状态确保同步
                if (data.status === 'waitingForSubmissions') {
                    console.log('游戏已开始，重置计时器');
                    setTimeLeft(GAME_DURATION_SECONDS);
                } else if (data.creator.hasConfirmedStart && data.opponent?.hasConfirmedStart) {
                    console.log('双方已确认但状态未更新，强制轮询');
                    setTimeout(async () => {
                        try {
                            const refreshRes = await fetch(`/api?action=getRoomStatus&roomId=${gameRoom.roomId}`);
                            const refreshData = await refreshRes.json();
                            if (refreshRes.ok && refreshData) {
                                console.log('强制轮询结果:', refreshData);
                                setGameRoom(refreshData);
                            }
                        } catch (error) {
                            console.error('强制轮询失败:', error);
                        }
                    }, 500);
                }
            } else if (data.error) {
                console.error('确认失败:', data.error);
            }
        } catch (error) {
            console.error('确认开始游戏出错:', error);
        } finally {
            setIsConfirming(false);
        }
    };

    // 处理退出房间
    const handleLeaveRoom = async () => {
        if (isLeaving) return;

        try {
            setIsLeaving(true);
            await onLeaveGame();
        } catch (error) {
            console.error('退出房间出错:', error);
        } finally {
            setIsLeaving(false);
        }
    };

    // 获取对手信息
    const opponentPlayer = gameRoom && currentPlayer
        ? gameRoom.creator.address.toLowerCase() === currentPlayer.address.toLowerCase()
            ? gameRoom.opponent
            : gameRoom.creator
        : undefined;

    // 游戏状态判断
    const canInteract = gameRoom?.status === 'waitingForSubmissions' &&
        timeLeft > 0 &&
        !currentPlayer?.hasSubmitted;

    const showBalloon = gameRoom && ['waitingForSubmissions', 'finished'].includes(gameRoom.status);
    const isGameFinished = gameRoom?.status === 'finished';

    if (!gameRoom) {
        return <div className="text-center p-4">加载中...</div>;
    }

    // 房间存在但没有玩家信息，这是异常情况
    if (!currentPlayer) {
        console.error('GameRoom - 有房间但无玩家数据', {
            roomId: gameRoom.roomId,
            creator: gameRoom.creator,
            opponent: gameRoom.opponent
        });
        return <div className="text-center p-4 bg-red-100 text-red-700">身份验证中...</div>;
    }

    // 判断当前玩家是否已确认
    const hasCurrentPlayerConfirmed = currentPlayer.hasConfirmedStart;

    return (
        <div className="space-y-6">
            {/* 游戏状态显示 */}
            <div className="w-full text-center p-4 rounded mb-4">
                {gameRoom.status === 'waiting' && (
                    <div className="bg-yellow-100 p-4 rounded">
                        <p className="text-yellow-700 font-bold">等待对手加入...</p>
                        <p className="text-sm mt-2">房间号: {gameRoom.roomId}</p>
                    </div>
                )}

                {/* 确认开始游戏界面 */}
                {(gameRoom.status === 'readyToStart' || (gameRoom.status === 'waiting' && gameRoom.opponent)) && (
                    <div className="bg-blue-100 p-4 rounded">
                        <div className="text-blue-700 font-bold mb-4">
                            请确认开始游戏
                        </div>
                        <div className="flex justify-center gap-8 text-sm mb-4">
                            <span>房主: {gameRoom.creator.hasConfirmedStart ? "✅ 已确认" : "❌ 未确认"}</span>
                            <span>挑战者: {gameRoom.opponent?.hasConfirmedStart ? "✅ 已确认" : "❌ 未确认"}</span>
                        </div>

                        {/* 玩家身份提示 */}
                        <div className="text-sm text-gray-600 mb-3">
                            您的身份: {isCreator ? "房主" : "挑战者"}
                        </div>

                        <div className="flex justify-center gap-4">
                            {!hasCurrentPlayerConfirmed && (
                                <button
                                    onClick={handleConfirmStart}
                                    disabled={isConfirming}
                                    className={`px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isConfirming ? '确认中...' : '确认开始游戏'}
                                </button>
                            )}
                            {hasCurrentPlayerConfirmed && (
                                <div className="px-6 py-2 bg-green-100 text-green-700 rounded">
                                    已确认，等待对方确认...
                                </div>
                            )}
                            <button
                                onClick={handleLeaveRoom}
                                disabled={isLeaving}
                                className={`px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ${isLeaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLeaving ? '退出中...' : '退出房间'}
                            </button>
                        </div>
                    </div>
                )}

                {gameRoom.status === 'waitingForSubmissions' && (
                    <div className="bg-green-100 p-4 rounded">
                        <p className="text-green-700 font-bold">剩余时间: {timeLeft}秒</p>

                        <p className="font-bold text-green-700">
                            {currentPlayer?.hasSubmitted
                                ? "已确认气球大小，等待对手..."
                                : `剩余时间: ${timeLeft}秒`}
                        </p>
                    </div>
                )}

                {/* 添加游戏结束状态显示 */}
                {gameRoom.status === 'finished' && (
                    <div className={`p-4 rounded ${gameRoom.winner === currentPlayer?.address ? 'bg-green-100' : 'bg-red-100'}`}>
                        <p className={`font-bold ${gameRoom.winner === currentPlayer?.address ? 'text-green-700' : 'text-red-700'}`}>
                            {gameRoom.winner === currentPlayer?.address ? '恭喜你赢得了游戏！' : '很遗憾，你输了'}
                        </p>
                        {gameRoom.targetValue && (
                            <p className="mt-2">
                                目标大小: {gameRoom.targetValue}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* 气球显示区域 */}
            {showBalloon && (
                <div className="flex justify-around gap-8">
                    {/* 我的气球 */}
                    <div className="flex-1 text-center">
                        <h3 className="font-bold mb-2">我的气球</h3>
                        <Balloon
                            size={currentPlayer.balloonSize ?? 1}
                            onInflate={handleInflate}
                            onSubmit={handleSubmit}
                            timeLeft={timeLeft}
                            canInteract={canInteract}
                            isLoser={isGameFinished && gameRoom.winner !== currentPlayer.address}
                            containerSize={320}
                        />
                    </div>

                    {/* 对手气球 */}
                    <div className="flex-1 text-center">
                        <h3 className="font-bold mb-2">对手气球</h3>
                        <Balloon
                            size={opponentPlayer?.balloonSize ?? 1}
                            onInflate={() => { }}
                            onSubmit={() => { }}
                            timeLeft={timeLeft}
                            canInteract={false}
                            isLoser={isGameFinished && gameRoom.winner !== opponentPlayer?.address}
                            containerSize={320}
                        />
                    </div>
                </div>
            )}

            {/* 游戏结果显示 */}
            {isGameFinished || gameRoom.targetValue && (
                <div className="p-6 bg-white rounded-lg shadow-lg mt-4">
                    <h2 className="text-2xl font-bold mb-4 text-center">游戏结果</h2>
                    <div className="mb-4 text-center">
                        <p className="text-lg">
                            目标值: <span className="font-bold text-blue-600">{gameRoom.targetValue.toFixed(1)}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 当前玩家结果 */}
                        <div className={`p-4 rounded-lg text-center ${gameRoom.winner === currentPlayer.address ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                            <h3 className="font-semibold mb-2">你的气球</h3>
                            <p className="text-2xl font-bold">{currentPlayer.balloonSize?.toFixed(1) ?? '0.0'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                差值: {Math.abs((currentPlayer.balloonSize ?? 0) - (gameRoom.targetValue ?? 0)).toFixed(1)}
                            </p>
                        </div>

                        {/* 对手结果 */}
                        <div className={`p-4 rounded-lg text-center ${gameRoom.winner === opponentPlayer?.address ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                            <h3 className="font-semibold mb-2">对手气球</h3>
                            <p className="text-2xl font-bold">{opponentPlayer?.balloonSize?.toFixed(1) ?? '0.0'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                差值: {Math.abs((opponentPlayer?.balloonSize ?? 0) - (gameRoom.targetValue ?? 0)).toFixed(1)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        {gameRoom.winner === currentPlayer.address ? (
                            <p className="text-xl text-green-600 font-bold">恭喜你赢得了游戏!</p>
                        ) : gameRoom.winner === opponentPlayer?.address ? (
                            <p className="text-xl text-blue-600">真遗憾，下次继续加油!</p>
                        ) : (
                            <p className="text-xl text-gray-600">平局!</p>
                        )}
                    </div>
                </div>
            )}

            {/* 游戏结束按钮 */}
            {isGameFinished && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleLeaveRoom}
                        className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        返回游戏大厅
                    </button>
                </div>
            )}
        </div>
    );
};
