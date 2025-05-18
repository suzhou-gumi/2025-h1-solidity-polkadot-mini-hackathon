import React from 'react';
import { useGameContext } from './GameContext';
import { Button } from '../ui/button';

interface GameControlsProps {
    onConfirmStart: () => void | Promise<void>;
    onLeaveGame: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
    onConfirmStart,
    onLeaveGame,
}) => {
    const { gameRoom, currentPlayer } = useGameContext();
    const [isLoading, setIsLoading] = React.useState(false);

    if (!gameRoom || !currentPlayer) return null;

    // 仅在 readyToStart 且未确认时显示确认按钮
    const hasConfirmed = !!currentPlayer.hasSubmitted;
    const showConfirmButton = gameRoom.status === 'readyToStart' && !hasConfirmed;
    const showLeaveButton = gameRoom.status === 'waiting' || gameRoom.status === 'finished';

    const handleConfirmStart = async () => {
        setIsLoading(true);
        try {
            await onConfirmStart();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 min-h-[120px]">
            {gameRoom.status === 'readyToStart' && hasConfirmed && (
                <div className="text-blue-500 font-semibold">您已确认，等待对方确认...</div>
            )}
            {showConfirmButton && (
                <Button
                    onClick={handleConfirmStart}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isLoading}
                >
                    {isLoading ? "正在开始..." : "开始游戏"}
                </Button>
            )}
            {showLeaveButton && (
                <Button
                    onClick={onLeaveGame}
                    className="bg-gray-500 hover:bg-gray-600"
                >
                    离开房间
                </Button>
            )}
        </div>
    );
};
