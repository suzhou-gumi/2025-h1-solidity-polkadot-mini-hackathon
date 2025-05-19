require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // 加载 .env 文件内容

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    assethub: {
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      chainId: 420420421,
      accounts: [process.env.PRIVATE_KEY].filter(Boolean),
    },
  },
};
