// DynamoDB 数据模型类型定义

// 玩家信息类型
export interface Player {
    address: string;
    balloonSize?: number;
    hasSubmitted: boolean;
    hasConfirmedStart: boolean;
    confirmedAt?: number;
}

// 游戏房间状态类型
export type GameStatus =
    | 'waiting'           // 等待对手加入
    | 'readyToStart'      // 双方已准备，等待确认开始
    | 'playing'          // 游戏进行中
    | 'determiningRange'  // 确定目标范围
    | 'waitingForSubmissions' // 等待提交结果
    | 'determiningWinner' // 确定获胜者
    | 'finished';        // 游戏结束

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
    vrfRequestId?: string;      // Chainlink VRF 请求 ID
    finalTargetValue?: number;  // 最终目标值
}