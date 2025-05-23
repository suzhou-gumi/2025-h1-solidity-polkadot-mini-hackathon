import React from 'react';
import { Button } from '@/components/ui/button';
import { GameRoom } from './types';

interface GameLobbyProps {
    onCreateGame: (stakeAmount: number) => void;
    onJoinGame: (roomId: string) => void;
    availableRooms: GameRoom[];
    onRefreshRooms: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({ onCreateGame, onJoinGame, availableRooms, onRefreshRooms }) => {
    const [stakeAmount, setStakeAmount] = React.useState(0.1);
    const [roomIdToJoin, setRoomIdToJoin] = React.useState('');

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">游戏大厅</h2>

                {/* 创建游戏区域 */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">创建新游戏</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={stakeAmount}
                            onChange={e => setStakeAmount(parseFloat(e.target.value))}
                            className="border p-2 rounded w-32"
                            placeholder="质押金额 (ETH)"
                        />
                        <Button onClick={() => onCreateGame(stakeAmount)}>
                            创建游戏
                        </Button>
                    </div>
                </div>

                {/* 可用房间列表 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">可用房间</h3>
                        <Button onClick={onRefreshRooms} className="ml-2">刷新房间</Button>
                    </div>
                    {availableRooms.length === 0 ? (
                        <p className="text-gray-500">暂无可用房间</p>
                    ) : (
                        <div className="grid gap-4">
                            {availableRooms.map(room => (
                                <div
                                    key={room.roomId}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">房间 {room.roomId}</p>
                                        <p className="text-sm text-gray-500">
                                            创建者: {room.creator.address.substring(0, 6)}...
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            质押金额: {room.stakeAmount} ETH
                                        </p>
                                    </div>
                                    <Button onClick={() => onJoinGame(room.roomId)}>
                                        加入游戏
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 手动加入房间 */}
                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">通过ID加入游戏</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={roomIdToJoin}
                            onChange={e => setRoomIdToJoin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="border p-2 rounded w-32"
                            placeholder="输入6位房间ID"
                        />
                        <Button onClick={() => onJoinGame(roomIdToJoin)}>
                            加入游戏
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
