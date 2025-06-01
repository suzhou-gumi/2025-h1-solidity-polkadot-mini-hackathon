import React from 'react';
import { useGameContext } from '../game/GameContext';
import { useAccount, useBalance } from 'wagmi';

export const GameStatusDisplay: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({
        address,
        unit: 'ether'
    });

    const {
        gameRoom,
        currentPlayer,
        isCreator
    } = useGameContext();

    // 如果钱包未连接，显示连接提示
    if (!isConnected) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
                <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-400">钱包状态</h3>
                    <p className="text-red-500">请先连接钱包</p>
                </div>
            </div>
        );
    }

    // 如果没有游戏房间或玩家信息，显示等待状态
    if (!gameRoom || !currentPlayer) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400">我的钱包</h3>
                        <p className="truncate">{address}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400">代币余额</h3>
                        <p>{balance ? `${balance.formatted} ${balance.symbol}` : '加载中...'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // 显示游戏阶段信息
    const renderGameStageInfo = () => {
        const opponent = isCreator ? gameRoom.opponent : gameRoom.creator;
        const opponentConfirmed = opponent?.hasConfirmedStart;
        const playerConfirmed = currentPlayer.hasConfirmedStart;

        switch (gameRoom.status) {
            case 'waiting':
                return <div className="text-yellow-500">等待对手加入...</div>;
            case 'readyToStart':
                return (
                    <div className="text-blue-500">
                        {playerConfirmed
                            ? `等待对手确认开始${opponentConfirmed ? '...' : ''}`
                            : '请确认开始游戏'}
                    </div>
                );
            case 'playing':
                return (
                    <div className="text-green-500">
                        游戏进行中!
                        {gameRoom.targetRangeMin && gameRoom.targetRangeMax &&
                            `目标范围: ${gameRoom.targetRangeMin} - ${gameRoom.targetRangeMax}`
                        }
                    </div>
                );
            case 'waitingForSubmissions':
                return (
                    <div className="text-orange-500">
                        {currentPlayer.hasSubmitted
                            ? '等待对手提交结果...'
                            : '请提交你的结果!'}
                    </div>
                );
            case 'finished':
                const isWinner = gameRoom.winner === currentPlayer.address;
                const opponent = isCreator ? gameRoom.opponent : gameRoom.creator;
                return (
                    <div className="space-y-2">
                        <div className={`text-${isWinner ? 'green' : 'red'}-500 text-lg font-bold`}>
                            游戏结束! {isWinner ? '你赢了!' : '你输了!'}
                        </div>
                        <div className="text-gray-300 space-y-1 text-sm">
                            <p>最终目标值: {gameRoom.targetValue?.toFixed(1)}</p>
                            <p>你的气球大小: {currentPlayer.balloonSize?.toFixed(1)}</p>
                            {opponent && <p>对手气球大小: {opponent.balloonSize?.toFixed(1)}</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
            <div className="grid grid-cols-2 gap-4">
                {/* 基本信息 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400">我的钱包</h3>
                    <p className="truncate">{address}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400">代币余额</h3>
                    <p>{balance ? `${balance.formatted} ${balance.symbol}` : '0'}</p>
                </div>

                {/* 游戏信息 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400">房间押金</h3>
                    <p>{gameRoom.stakeAmount} ETH</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400">我的角色</h3>
                    <p>{isCreator ? '房主' : '挑战者'}</p>
                </div>

                {/* 对手信息 */}
                {gameRoom.opponent && (
                    <div className="col-span-2">
                        <h3 className="text-sm font-semibold text-gray-400">对手钱包</h3>
                        <p className="truncate">{isCreator ? gameRoom.opponent.address : gameRoom.creator.address}</p>
                    </div>
                )}

                {/* 游戏状态 */}
                <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-400">游戏状态</h3>
                    {renderGameStageInfo()}
                </div>

                {/* 游戏进行中的信息 */}
                {(gameRoom.status === 'playing' || gameRoom.status === 'waitingForSubmissions') && (
                    <>
                        {currentPlayer.balloonSize && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400">当前气球大小</h3>
                                <p>{currentPlayer.balloonSize.toFixed(1)}</p>
                            </div>
                        )}
                        {gameRoom.targetRangeMin && gameRoom.targetRangeMax && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400">目标范围</h3>
                                <p>{gameRoom.targetRangeMin} - {gameRoom.targetRangeMax}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};