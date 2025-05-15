# NFT斗图游戏项目

## 项目概述
基于Polkadot生态的NFT对战游戏，用户可铸造表情包NFT，NFT带有大模型给出的搞笑值，用户使用NFT进行对战，胜者赢走参与者的质押Token作为战利品。

## 游戏设计
- 铸造NFT：用户可通过铸造表情包NFT来获得游戏体验。项目集成了豆包大模型，用户提交的表情包将发送给豆包大模型，生成搞笑值。
- 对战系统：用户可使用铸造的表情包NFT进行对战。用户首先质押一定金额的对战押金，对战系统基于用户使用的NFT的搞笑值进行计算，根据搞笑值的高低决定胜负，胜者赢走部分押金，对战合约部分Token作为游戏手续费。
- 钱包连接：用户可通过钱包连接与游戏进行交互。

## 技术栈
- 前后端: Next.js + TRPC + Tailwind CSS + drizzle +viem.js 
- 合约: Solidity (PolkaVM兼容) + @parity/hardhat-polkadot: 0.1.4

## 合约设计
- 代币合约(GT.sol)：基于ERC20标准的游戏代币合约，用户需要获取Game Token(GT)才能铸造NFT和参与对战。合约包含代币发行、转账、授权等基础功能。
- NFT铸造合约：用户发送给ERC721合约1个GT代币，才可以铸造NFT，NFT被铸造后会带有power（搞笑值）属性。
- 对战系统合约：用户首先需要质押一定金额的对战押金，对战系统基于用户使用的NFT的搞笑值进行计算，根据搞笑值的高低决定胜负，胜者赢走部分押金，剩余Token作为游戏手续费。


## 功能特性
1. NFT铸造功能
2. NFT对战系统
3. 代币奖励机制
4. 钱包连接与账户管理

## 部署说明

### 环境变量配置
在`.env`文件中需要配置以下变量：
```bash
DATABASE_URL="file:./db.sqlite"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x3ed62137c5DB927cb137c26455969116BF0c23Cb"
NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS="0xac9f48A511F1C688E769767900467498F69A6505"
NEXT_PUBLIC_ALCHEMY_RPC_URL="http://127.0.0.1:8545"
JWT_SECRET=bed674227cf3c516e8cc55cc502c8d87a14cf5a73992a5f2d297b45ec6bed6132fa0bf2f03e703e761a1df73885c48bfb753b534403982f2320bc33fe4a53e66
```

### 前后端
```bash
cd app/nft_game
pnpm install
pnpm run dev
```

### 合约
```bash
cd ../contracts
pnpm install
npx hardhat compile
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/NFTEmojiModule.ts --network localNode
npx hardhat ignition deploy ./ignition/modules/GTModule.ts --network localNode
npx hardhat ignition deploy ./ignition/modules/BattleModule.ts --network localNode
```

## 部署与交互过程中发现的问题
