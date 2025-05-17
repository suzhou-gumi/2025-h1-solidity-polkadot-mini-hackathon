import "@nomicfoundation/hardhat-toolbox-viem"
import "@nomicfoundation/hardhat-ignition"
// import "@nomicfoundation/hardhat-foundry";
import "hardhat-resolc"
import "./scripts/compile-revive"
import { HardhatRuntimeEnvironment } from "hardhat/types";
import type { HardhatUserConfig } from "hardhat/config";
import { config } from "dotenv"
config()

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 400,
      },
    },
  },
  networks: {
    hardhat: {
      polkavm: true,
      nodeConfig: {
        nodeBinaryPath: "../../polkadot-sdk/target/release/substrate-node",
        rpcPort: 8000,
        dev: true,
      },
      adapterConfig: {
        adapterBinaryPath: "../../polkadot-sdk/target/release/eth-rpc",
        dev: true,
      },
    },
    // polkavm: { url: "http://127.0.0.1:8545" },
    polkavm: {
      polkavm: true,
      url: "http://127.0.0.1:8545",
      accounts: [process.env.LOCAL_PRIV_KEY],
    },
    ah: {
      url: "https://westend-asset-hub-rpc.polkadot.io",
      chainId: 10081, // Westend AssetHub chain ID
      accounts: [process.env.AH_PRIV_KEY],
    },
  },

  resolc: {
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
        runs: 400,
      },
      evmVersion: "istanbul",
      // compilerPath: "~/.cargo/bin/resolc --solc /usr/local/bin/solc",
      compilerPath: "~/.cargo/bin/resolc",
      standardJson: true,
    },
  },
};