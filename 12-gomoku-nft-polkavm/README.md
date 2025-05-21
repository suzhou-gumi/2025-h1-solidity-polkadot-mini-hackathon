# OnChain Gomoku NFT 🎮🏆

这是一个构建在 PolkaVM 上的链上五子棋游戏（Gomoku），胜者可自动获得一枚纪念 NFT。项目涵盖完整的合约部署、前端交互和 NFT 发行流程。

## 📌 项目功能简介

- 支持玩家与内置 AI 进行五子棋对战（电脑具备基础博弈逻辑）
- 对战时玩家与 AI 执子颜色和先后手随机决定（黑或白、先或后）
- 胜出方会自动调用智能合约 `mintNFT`，领取专属胜者 NFT
- 每个地址仅可领取一次，防止重复领取
- NFT 使用 IPFS 存储的 metadata 和图片
- 支持自动切换至 AssetHub Westend 网络

## 🧠 技术栈

- 前端：React + ethers.js
- 合约：Solidity（轻量级 NFT 模块，无冗余逻辑）
- 部署网络：AssetHub Westend（Polkadot EVM 测试链）
- 存储：Pinata / IPFS

## 📄 智能合约部署信息

- 合约地址：`0xb177CD7a2608654884f9702b59E29b66c54fb041`
- 部署网络：AssetHub Westend
- Chain ID：`420420421`（十进制） / `0x190f1b45`（十六进制）
- 合约源文件：`contracts/GomokuNFT.sol`

## 🖼️ NFT 示例

- 名称：`Gomoku Champion`
- 图像地址（image）：([https://beige-late-emu-575.mypinata.cloud/ipfs/QmYLC2chDZ2mnKPA3JUVkyquqaNKUFVFJgWwEjDchQVjJC/](https://beige-late-emu-575.mypinata.cloud/ipfs/QmYLC2chDZ2mnKPA3JUvkyquqaNKUFVFJgWwEjDchQVJjC))
- JSON 元数据：已上传至 IPFS，合约通过 `tokenURI` 返回

## 🚀 快速运行方式

```bash
# 克隆项目
git clone https://github.com/ljjathena/gomoku-nft-polkavm.git
cd gomoku-nft-polkavm/gomoku-frontend

# 安装依赖
npm install

# 运行本地前端
npm run start

