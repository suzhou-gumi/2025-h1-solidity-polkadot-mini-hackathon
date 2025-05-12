import { createPublicClient, http } from 'viem';
import { abi } from '../artifacts-pvm/contracts/ContractVerifier.sol/ContractVerifier.json'; // 替换为实际路径

const CONTRACT_ADDRESS = '0x97e0c8f6643df31197fff71ced70f8288c187120';
const RPC_URL = 'https://westend-asset-hub-eth-rpc.polkadot.io';

async function main() {
  // 创建公共客户端（只读）
  const client = createPublicClient({
    transport: http(RPC_URL),
  });

  // 调用合约函数，例如 owner()
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'owner',
    args: [], // 如果函数有参数，填在这里
  });

  console.log('owner() 返回值:', result);
}

main().catch((err) => {
  console.error('调用失败:', err);
});
