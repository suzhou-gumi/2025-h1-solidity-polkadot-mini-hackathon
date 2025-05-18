import "@nomicfoundation/hardhat-toolbox";
import "@parity/hardhat-polkadot";
import "@parity/hardhat-polkadot-resolc";

require("dotenv").config();

const config: any = {
  solidity: "0.8.28",

  // npm Compiler
  resolc: {
    version: "1.5.2",
    compilerSource: "npm",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    westendAssetHub: {
      polkavm: true,
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;
