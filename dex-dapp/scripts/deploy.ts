import pkg from 'hardhat';
const { ethers } = pkg;
const path = require('path');

async function main() {
  // 获取部署者
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // 部署 CryptoMarketRegistry
  const MarketRegistry = await ethers.getContractFactory(
    'CryptoMarketRegistry'
  );
  const registry = await MarketRegistry.deploy();
  await registry.waitForDeployment();
  console.log('MarketRegistry deployed to:', await registry.getAddress());

  // 读取现有配置
  const configPath = path.join(__dirname, '../frontend/src/config.js');
  const config = require(configPath);
  let configModule = JSON.parse(
    JSON.stringify(config.CONTRACT_CONFIG || config.default.CONTRACT_CONFIG)
  );
  // 确保本地网络配置存在
  if (!configModule.networks) configModule.networks = {};
  if (!configModule.networks.localhost) {
    configModule.networks.localhost = {
      rpcUrl: 'http://127.0.0.1:8545/',
      contracts: {},
      tokens: {},
    };
  }
  // 更新合约地址
  configModule.networks.localhost.contracts.MarketRegistry =
    await registry.getAddress();

  // 部署 Dex
  const Dex = await ethers.getContractFactory('Dex');
  const dex = await Dex.deploy();
  await dex.waitForDeployment();
  console.log('Dex deployed to:', await dex.getAddress());
  configModule.networks.localhost.contracts.Dex = await dex.getAddress();

  // 保存部署地址到文件
  const fs = require('fs');
  const addresses = {
    CryptoMarketRegistry: await registry.getAddress(),
    Dex: await dex.getAddress(),
  };
  fs.writeFileSync(
    'deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
