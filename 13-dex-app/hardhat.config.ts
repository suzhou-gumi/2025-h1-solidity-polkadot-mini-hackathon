import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.28',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 11155111,
      timeout: 120000, // 增加超时到60秒
    },
    // ah: {
    //   url: process.env.RPC_URL,
    //   accounts: [process.env.AH_PRIV_KEY || ''],
    // },
  },
};

export default config;
