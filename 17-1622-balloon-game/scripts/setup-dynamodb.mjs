import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new DynamoDBClient({
    region: 'local',
    endpoint: 'http://localhost:8000',
    credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local'
    }
});

async function createGameRoomsTable() {
    try {
        const command = new CreateTableCommand({
            TableName: "GameRooms",
            AttributeDefinitions: [
                { AttributeName: "roomId", AttributeType: "S" },
                { AttributeName: "status", AttributeType: "S" }
            ],
            KeySchema: [
                { AttributeName: "roomId", KeyType: "HASH" }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "StatusIndex",
                    KeySchema: [
                        { AttributeName: "status", KeyType: "HASH" }
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 5,
                        WriteCapacityUnits: 5
                    }
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        });

        const response = await client.send(command);
        console.log("表创建成功:", JSON.stringify(response, null, 2));
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log("表已存在，跳过创建");
        } else {
            console.error("创建表时出错:", error);
            throw error;
        }
    }
}

// 主函数
async function main() {
    try {
        console.log("开始创建 DynamoDB 表...");
        await createGameRoomsTable();
        console.log("设置完成");
    } catch (error) {
        console.error("设置过程中出错:", error);
        process.exit(1);
    }
}

main(); 