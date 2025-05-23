// 游戏房间状态类型
export type GameStatus =
    | 'waiting'           // 等待对手加入
    | 'readyToStart'      // 双方已准备，等待确认开始
    | 'playing'          // 游戏进行中
    | 'determiningRange'  // 确定目标范围
    | 'waitingForSubmissions' // 等待提交结果
    | 'determiningWinner' // 确定获胜者
    | 'finished';        // 游戏结束

// UI 阶段类型
export type UIStage = 'lobby' | 'waitingForOpponent' | 'waitingForConfirmStart' | 'determiningRange' | 'playing' | 'gameOver';

// 玩家信息类型
export interface Player {
    address: string;
    balloonSize?: number;
    hasSubmitted: boolean;
    hasConfirmedStart: boolean;
    confirmedAt?: number;
}

// 游戏房间类型
export interface GameRoom {
    roomId: string;
    creator: Player;
    opponent?: Player;
    status: GameStatus;
    stakeAmount: number;
    winner?: string;
    targetRangeMin?: number;
    targetRangeMax?: number;
    targetValue?: number;
    createdAt: number;
    updatedAt?: number;
    expiresAt?: number;
}

// 游戏常量
export const INITIAL_BALLOON_SIZE = 1;
export const BALLOON_MAX_SIZE = 10;
export const GAME_DURATION_SECONDS = 20;
export const INFLATION_STEP = 0.5;
export const MAX_BALLOON_SIZE = 10;
export const INFLATION_BASE_INCREMENT = 0.5;
export const MIN_INFLATION_INCREMENT = 0.1;

// 轮询间隔(毫秒)
export const POLLING_INTERVALS = {
    waiting: 2000,
    readyToStart: 1000,
    determiningRange: 1000,
    playing: 500,
    waitingForSubmissions: 1000,
    determiningWinner: 1000,
    finished: 0,
    default: 2000
};

// 游戏状态类型
export type GameState = 'waiting' | 'playing' | 'finished';

// 游戏上下文类型
export interface GameContextType {
    gameRoom: GameRoom | null;
    currentPlayer: Player | null;
    isCreator: boolean;
    setGameRoom: (room: GameRoom | null | ((prev: GameRoom | null) => GameRoom | null)) => void;
}

export interface GameUpdate {
    status?: GameStatus;
    playerUpdate?: {
        balloonSize?: number;
        hasSubmitted?: boolean;
        hasConfirmedStart?: boolean;
        timestamp?: number;
    };
    action?: 'confirmStart' | 'updateGame' | 'submitResult' | 'submitBalloonSize' | 'syncBalloonSize';
}
