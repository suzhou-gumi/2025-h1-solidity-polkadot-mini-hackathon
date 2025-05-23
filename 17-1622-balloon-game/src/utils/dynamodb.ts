import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,
    DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { GameRoom, Player } from "@/types/dynamodb";

// 检查是否使用本地 DynamoDB
const isLocalDynamoDB = process.env.NEXT_PUBLIC_ENABLE_LOCAL_DYNAMODB === 'true';

// 打印环境变量信息（仅用于调试）
if (process.env.NODE_ENV === 'development') {
    console.log('DynamoDB 环境配置:', {
        isLocalDynamoDB,
        region: process.env.AWS_REGION,
        hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
}

// 创建 DynamoDB 客户端
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: isLocalDynamoDB ? 'http://localhost:8000' : undefined,
    credentials: isLocalDynamoDB
        ? {
            accessKeyId: 'local',
            secretAccessKey: 'local'
        }
        : {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'MISSING_ACCESS_KEY_ID',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'MISSING_SECRET_ACCESS_KEY'
        }
});

// 创建文档客户端
const docClient = DynamoDBDocumentClient.from(client);

// DynamoDB 表名
const GAME_ROOMS_TABLE = 'GameRooms';

// 创建游戏房间
export async function createGameRoom(room: GameRoom): Promise<GameRoom> {
    await docClient.send(new PutCommand({
        TableName: GAME_ROOMS_TABLE,
        Item: room
    }));
    return room;
}

// 获取游戏房间
export async function getGameRoom(roomId: string): Promise<GameRoom | null> {
    const result = await docClient.send(new GetCommand({
        TableName: GAME_ROOMS_TABLE,
        Key: { roomId }
    }));
    return result.Item as GameRoom || null;
}

// 更新游戏房间
export async function updateGameRoom(roomId: string, updates: Partial<GameRoom>): Promise<GameRoom> {
    const updateExpr: string[] = [];
    const exprNames: Record<string, string> = {};
    const exprValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            updateExpr.push(`#${key} = :${key}`);
            exprNames[`#${key}`] = key;
            exprValues[`:${key}`] = value;
        }
    });

    if (!updateExpr.length) {
        throw new Error('No valid updates provided');
    }

    const result = await docClient.send(new UpdateCommand({
        TableName: GAME_ROOMS_TABLE,
        Key: { roomId },
        UpdateExpression: `SET ${updateExpr.join(', ')}`,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
        ReturnValues: 'ALL_NEW'
    }));

    return result.Attributes as GameRoom;
}

// 获取可用房间列表
export async function getAvailableRooms(): Promise<GameRoom[]> {
    const result = await docClient.send(new QueryCommand({
        TableName: GAME_ROOMS_TABLE,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ExpressionAttributeValues: {
            ':status': 'waiting'
        }
    }));

    return (result.Items || []) as GameRoom[];
}

// 删除游戏房间
export async function deleteGameRoom(roomId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
        TableName: GAME_ROOMS_TABLE,
        Key: { roomId }
    }));
}

// 导出常用命令和客户端
export {
    docClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,
    DeleteCommand
};