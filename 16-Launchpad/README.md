# Launchpad 项目

这是一个基于 Hardhat 的 Launchpad 项目，用于创建和管理代币发行项目。

## 已部署合约地址

- PlatformToken: `0xf3649AE6c937eB7348E12E41033A47C3d235Fe58`
- Launchpad: `0xf13A80D9489BE734769389d98e9FaD8998A73510`

## 项目结构

- `contracts/`: 智能合约源代码
- `scripts/`: 部署和测试脚本
- `ignition/`: Ignition 部署模块
- `test/`: 测试文件
- `frontend/`: 前端应用

## 安装步骤

1. 克隆项目
```bash
git clone <项目地址>
cd Launchpad
```

2. 安装依赖
```bash
npm install
```

3. 编译合约
```bash
npx hardhat compile
```

4. 创建环境变量文件
   创建 `.env` 文件并添加以下内容：
```
WESTEND_HUB_PK="你的私钥"
```

## 部署步骤

1. 部署 PlatformToken
```bash
npx hardhat ignition deploy ignition/modules/PlatformToken.ts
```

2. 部署 Launchpad
```bash
npx hardhat ignition deploy ignition/modules/Launchpad.ts
```

## 脚本说明

scripts 目录下的脚本功能说明：

- `PlatformTokenMint.ts`: 用于铸造平台代币（需要修改合约地址）
- `deploy.ts`: 部署合约并创建一个项目的脚本
- `createProject.ts`: 创建新的募资项目
- `subscribe.ts`: 参与项目认购
- `claim.ts`: 领取项目代币或退款
- `finalize.ts`: 结束项目
- `listProjects.ts`: 列出所有项目
- `test.ts`: 完整功能测试脚本
- `testSoftCap.ts`: 测试软顶功能

## 使用说明

1. 铸造平台代币
   修改 `scripts/PlatformTokenMint.ts` 中的合约地址为：
```
const platformTokenAddress = "0xf3649AE6c937eB7348E12E41033A47C3d235Fe58";
```
然后运行：
```bash
npx hardhat run scripts/PlatformTokenMint.ts
```

2. 创建项目
   修改 `scripts/createProject.ts` 中的 Launchpad 合约地址为：
```
const launchpadAddress = "0xf13A80D9489BE734769389d98e9FaD8998A73510";
```
然后运行：
```bash
npx hardhat run scripts/createProject.ts
```

3. 测试功能
   完整测试：
```bash
npx hardhat run scripts/test.ts
```

单步测试：
```bash
# 认购项目
npx hardhat run scripts/subscribe.ts

# 结束项目
npx hardhat run scripts/finalize.ts

# 领取代币
npx hardhat run scripts/claim.ts

# 查看项目列表
npx hardhat run scripts/listProjects.ts
```

4. 启动前端项目
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
npm install --save-dev @types/react @types/react-dom

# 启动开发服务器
npm start
```

## 注意事项

1. 确保在运行脚本前已经正确配置了 `.env` 文件
2. 部署合约后需要更新相关脚本中的合约地址
3. 测试脚本中的参数（如代币数量、时间等）可以根据需要修改

## 许可证

MIT License
