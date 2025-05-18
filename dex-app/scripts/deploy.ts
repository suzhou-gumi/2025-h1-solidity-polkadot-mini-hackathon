import pkg from 'hardhat';
const { ethers } = pkg;

  async function main() {
    // 获取部署者
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
  
    // 部署 CryptoMarketRegistry
    const MarketRegistry = await ethers.getContractFactory("CryptoMarketRegistry");
    const registry = await MarketRegistry.deploy();
    await registry.waitForDeployment();
    console.log("MarketRegistry deployed to:", await registry.getAddress());
  
    // 部署 Dex
    const Dex = await ethers.getContractFactory("Dex");
    const dex = await Dex.deploy();
    await dex.waitForDeployment();
    console.log("Dex deployed to:", await dex.getAddress());
  
    // 保存部署地址到文件
    const fs = require("fs");
    const addresses = {
      CryptoMarketRegistry: await registry.getAddress(),
      Dex: await dex.getAddress()
    };
    fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });