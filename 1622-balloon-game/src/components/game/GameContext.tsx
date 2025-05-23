import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import type { GameRoom, Player, GameContextType } from './types';

const GameContext = createContext<GameContextType | null>(null);

export const useGameContext = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGameContext必须在<GameProvider>内使用');
    return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { address, isConnected } = useAccount();
    const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);

    // 当前玩家信息
    const currentPlayer: Player | null = useMemo(() => {
        if (!gameRoom || !address) return null;
        if (gameRoom.creator.address.toLowerCase() === address.toLowerCase()) {
            return gameRoom.creator;
        }
        if (gameRoom.opponent && gameRoom.opponent.address.toLowerCase() === address.toLowerCase()) {
            return gameRoom.opponent;
        }
        return null;
    }, [gameRoom, address]);

    // 是否是房主
    const isCreator = useMemo(() => {
        if (!gameRoom || !address) return false;
        return gameRoom.creator.address.toLowerCase() === address.toLowerCase();
    }, [gameRoom, address]);

    // 钱包断开或切换时清空房间状态
    React.useEffect(() => {
        if (!isConnected) {
            setGameRoom(null);
        }
    }, [isConnected]);

    const value: GameContextType = {
        gameRoom,
        setGameRoom,
        currentPlayer,
        isCreator,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
