import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const LaunchpadModule = buildModule('LaunchpadModule', (m) => {
    // 获取已部署的资金代币地址作为参数
    const fundingTokenAddress = m.getParameter('fundingTokenAddress', '0xf3649AE6c937eB7348E12E41033A47C3d235Fe58');

    console.log("使用资金代币地址:", fundingTokenAddress);

    // 部署 Launchpad
    const launchpad = m.contract('Launchpad', [
        fundingTokenAddress,
    ]);
    console.log("Launchpad 合约已部署");

    return { launchpad };
});

export default LaunchpadModule; 