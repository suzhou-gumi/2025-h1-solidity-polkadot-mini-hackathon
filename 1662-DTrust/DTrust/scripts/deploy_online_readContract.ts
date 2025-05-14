import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts';
import { abi } from '../artifacts-pvm/contracts/ContractVerifier.sol/ContractVerifier.json'; // 替换为实际路径

const CONTRACT_ADDRESS = '0x97e0c8f6643df31197fff71ced70f8288c187120';
const RPC_URL = 'https://westend-asset-hub-eth-rpc.polkadot.io';
const PRIVATE_KEY = '0xcf27fffdd1a6b9ea37a6a7757f6c5f3712a68d7560c3497575154db6e350414f'; // 请替换为你的私钥
const targetUser = '0x550FA69e0A7b61c2D3F34d4dEd7c1B3cE1327488';

const westendAssetHub = defineChain({
  id:420420421, // ❗ 示例 Chain ID, 请替换为 Westend Asset Hub 的实际 Chain ID
  name: 'Westend Asset Hub',
  nativeCurrency: { name: 'Westend Dot', symbol: 'WND', decimals: 18 }, // ❗ 示例原生代币, 请核实并替换
  rpcUrls: { 
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  // blockExplorers: { // 可选: 如果有区块浏览器
  //   default: { name: 'ExplorerName', url: 'https://explorer.example.com' },
  // },
});


async function main() {
  // 创建公共客户端（只读）
  const client = createPublicClient({
    transport: http(RPC_URL),
  });

  // 读取 owner
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'owner',
    args: [],
  });
  console.log('owner() 返回值:', result);

  // 创建钱包客户端（可读写）
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    transport: http(RPC_URL),
  });

  // 调用 assignUserRole
  const txHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'assignUserRole',
    args: [targetUser],
    account,
    chain: westendAssetHub
  });
  console.log('assignUserRole() 交易哈希:', txHash);
}

main().catch((err) => {
  console.error('调用失败:', err);
});
