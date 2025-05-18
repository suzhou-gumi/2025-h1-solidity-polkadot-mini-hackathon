import { createPublicClient, createWalletClient, defineChain, http, webSocket, formatUnits, parseEther, parseGwei } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { config } from "dotenv"
import path from 'path'
import fs from 'fs'

config()

// 定义Westend AssetHub链
export const westendAssetHub = defineChain({
  id: 420420421,
  name: 'Westend AssetHub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    name: 'Westend Native Token',
    symbol: 'WND',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
    public: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  testnet: true,
})

const PRIVATE_KEY = process.env.AH_PRIV_KEY
if (!PRIVATE_KEY || !PRIVATE_KEY.startsWith("0x")) {
  throw new Error('AH_PRIV_KEY is not defined or does not start with "0x". Please check your environment variables.')
}
// console.log(`Private key: ${PRIVATE_KEY}`)

async function deployToAssetHub(contractName: string): Promise<{
  contractAddress: `0x${string}`;
  txHash: `0x${string}`;
  receipt: any;
}> {
  let txHash: `0x${string}` | undefined;
  let receipt: any;
  
  // 读取 ABI 和字节码
  const contractPath = path.join(__dirname, `../artifacts-pvm/contracts/${contractName}.sol/${contractName}.json`)
  const contractData = fs.readFileSync(contractPath, 'utf8')
  const parsedData = JSON.parse(contractData)

  if (!parsedData || !parsedData.bytecode) {
    throw new Error(`Invalid contract data: ${contractPath}`)
  }

  const bytecode = parsedData.bytecode
  const abi = parsedData.abi

  // 创建钱包和客户端
  const wallet = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)
  const address = wallet.address
  console.log(`Wallet address: ${address}`)

  // 验证链配置
  const chainId = westendAssetHub.id
  const expectedRpcUrl = process.env.RPC_URL || 'https://westend-asset-hub-eth-rpc.polkadot.io'
  
  console.log(`🔗 Network Configuration:
  - Expected Chain: Westend AssetHub
  - Chain ID: ${chainId}
  - RPC Endpoint: ${expectedRpcUrl}`)

  // 创建带有链验证的客户端
  const ethRpcUrl = 'https://westend-asset-hub-eth-rpc.polkadot.io'
  
  // 使用正确的链配置
  const chainConfig = {
    ...westendAssetHub,
    id: chainId,
    rpcUrls: {
      default: { 
        webSocket: [ethRpcUrl],
        http: ['https://westend-asset-hub-eth-rpc.polkadot.io'] 
      },
      public: { 
        webSocket: [ethRpcUrl],
        http: ['https://westend-asset-hub-eth-rpc.polkadot.io']
      }
    }
  }

  // 创建客户端
  const client = createWalletClient({
    account: wallet,
    transport: http(ethRpcUrl), // 暂时回退到HTTP
    chain: chainConfig,
  })
  
  const publicClient = createPublicClient({
    transport: http(ethRpcUrl), // 暂时回退到HTTP
    chain: chainConfig,
  })

  // 强制验证链ID
  const networkChainId = await publicClient.getChainId()
  console.log(`ℹ️ Connected to chain ${networkChainId} via ${ethRpcUrl}`)
  console.log(`ℹ️ Using account: ${address}`)
  
  if (networkChainId !== 420420421) {
    throw new Error(
      `🚨 Chain ID verification failed!\n` +
      `Connected to chain ${networkChainId} via ${ethRpcUrl}\n` +
      `Expected chain ID: 420420421 (Westend AssetHub)`
    )
  }

  // 验证账户状态
  try {
    const balance = await publicClient.getBalance({ 
      address: address,
      blockTag: 'latest'
    })
    console.log(`ℹ️ Account balance: ${formatUnits(balance, 18)} WND`)
  } catch (error) {
    console.error('⚠️ Account access error:', error)
    throw new Error(
      `🚨 Failed to access account ${address}\n` +
      `Check RPC connection and account configuration`
    )
  }

  // 验证网络连接
  const currentRpc = publicClient.transport.url || 'unknown'
  if (networkChainId !== chainId) {
    
    throw new Error(
      `🚨 Network Configuration Error!\n\n` +
      `You are connected to the wrong blockchain network.\n\n` +
      `🔗 Connection Details:\n` +
      `- Current RPC: ${currentRpc}\n` +
      `- Current Chain ID: ${networkChainId}\n\n` +
      `🔄 Required Configuration:\n` +
      `- Expected RPC: ${expectedRpcUrl}\n` +
      `- Expected Chain ID: ${chainId} (Westend AssetHub)\n\n` +
      `💡 Solution:\n` +
      `1. Check your RPC_URL environment variable\n` +
      `2. Verify hardhat.config.ts network settings\n` +
      `3. Ensure you're using the correct RPC endpoint\n` +
      `4. Confirm your wallet is connected to Westend AssetHub`
    )
  }
  
  console.log(`✅ Network Verified: Connected to Westend AssetHub (Chain ID: ${chainId})`)

  // 检查余额
  const balance = await publicClient.getBalance({ address })
  console.log('Balance (WND):', balance)

  // 获取 nonce
  const nonce = await publicClient.getTransactionCount({ address })
  console.log('Nonce:', nonce)

  // Westend AssetHub 网络特定参数
  const NETWORK_GAS = {
    minGasPrice: parseGwei('1'), // 提高最低gas价格到1 gwei
    defaultGasLimit: 30_000_000n // 默认gas limit
  }

  // 获取当前区块和gas价格
  const [block, currentGasPrice] = await Promise.all([
    publicClient.getBlock(),
    publicClient.getGasPrice()
  ])

  // 确保gasPrice不低于网络最低要求
  const adjustedGasPrice = currentGasPrice < NETWORK_GAS.minGasPrice 
    ? NETWORK_GAS.minGasPrice 
    : currentGasPrice

  // 使用合理的gasLimit（区块上限的30%或默认值，取较小者）
  const calculatedLimit = block.gasLimit * 30n / 100n;
  const gasLimit = calculatedLimit < NETWORK_GAS.defaultGasLimit 
    ? calculatedLimit 
    : NETWORK_GAS.defaultGasLimit;

  const gasCost = gasLimit * adjustedGasPrice;
  
  console.log(`⛽ Gas Parameters:
  ├─ Current Block Gas Limit: ${block.gasLimit}
  ├─ Adjusted Gas Price: ${formatUnits(adjustedGasPrice, 9)} gwei
  ├─ Calculated Gas Limit: ${gasLimit}
  └─ Estimated Cost: ${formatUnits(gasCost, 18)} WND`);

  // 检查余额是否足够
  if (balance < gasCost) {
    throw new Error(`Insufficient balance: ${balance} < ${gasCost}`)
  } else {
    // 等待5秒
    await new Promise(resolve => setTimeout(resolve, 5_000))
  }
  
  try {
    // 先测试简单转账交易
    try {
      const testTxHash = await client.sendTransaction({
        to: address, // 给自己转账
        value: parseEther("0.0001"), // 增加测试交易金额
        gas: 21000n,
        gasPrice: parseGwei("1"), // 提高gas price到1 gwei
        nonce,
        chain: chainConfig,
        account: wallet
      })
      console.log(`ℹ️ Test transaction sent: ${testTxHash}`)
    } catch (testError) {
      console.error('⚠️ Test transaction failed:', testError)
      throw new Error(
        `🚨 Failed to send test transaction\n` +
        `This indicates the RPC endpoint may not fully support EVM transactions\n` +
        `Try using alternative RPC endpoint: wss://westend-asset-hub-rpc.polkadot.io`
      )
    }

    // 部署合约
    txHash = await client.sendTransaction({
      data: `0x${bytecode}`,
      gas: gasLimit,
      gasPrice: parseGwei('1'), // 提高gas price到1 gwei
      nonce: nonce + 1, // 递增nonce
      to: undefined,
      value: 0n,
      chain: chainConfig,
      account: wallet
    })
    console.log('✅ Transaction submitted. Hash:', txHash)

    // 等待交易确认
    console.log('⏳ Waiting for transaction confirmation...')
    receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60_000,
    })

    console.log('📄 Transaction receipt:', JSON.stringify(receipt, null, 2))

    if (receipt.status !== 'success') {
      throw new Error(`❌ Transaction failed. Status: ${receipt.status}`)
    }

    console.log('✅ Contract successfully deployed at address:', receipt.contractAddress)
    return {
      contractAddress: receipt.contractAddress,
      txHash,
      receipt
    }
  } catch (error) {
    console.error('\n❌ Deployment Failed!')
    console.error('🔄 Last Transaction Parameters:')
    console.error(`- Gas Limit: ${gasLimit}`)
    console.error(`- Gas Price: ${formatUnits(adjustedGasPrice, 9)} gwei`)
    console.error(`- Nonce: ${nonce}`)
    console.error(`- Account: ${address}`)
    console.error(`- Balance: ${formatUnits(balance, 18)} WND`)
    
    if (txHash) {
      console.error('\n🔍 Transaction Hash:', txHash)
    }
    
    if (error instanceof Error) {
      console.error('\n⚠️ Error Details:')
      console.error(`- Message: ${error.message}`)
      
      // 显示RPC错误详情（如果有）
      if (error.cause && typeof error.cause === 'object') {
        console.error('- RPC Error:', JSON.stringify(error.cause, null, 2))
      }
    } else {
      console.error('\n⚠️ Unknown Error:', error)
    }

    console.error('\n💡 Suggested Solutions:')
    console.error('1. Check account balance (current: ${formatUnits(balance, 18)} WND)')
    console.error(`2. Try increasing gas price (current: ${formatUnits(adjustedGasPrice, 9)} gwei)`)
    console.error('3. Verify network connection and RPC endpoint')
    console.error('4. Check contract bytecode and ABI')
    
    throw error
  }
}

// 执行部署
;(async () => {
  try {
    console.log('🚀 Starting DividendToken deployment to AssetHub...')
    const result = await deployToAssetHub('DividendToken')
    console.log('\n🎉 Deployment Successful!')
    console.log(`- Contract Address: ${result.contractAddress}`)
    console.log(`- Transaction Hash: ${result.txHash}`)
  } catch (error) {
    console.error('\n💥 Critical Deployment Failure!')
    
    if (error instanceof Error) {
      // 特殊处理链ID不匹配错误
      if (error.message.includes('Chain ID mismatch')) {
        console.error('⚠️ Network Configuration Error:')
        console.error(error.message)
        console.error('\n🔧 Quick Fix:')
        console.error('1. Check your RPC endpoint URL')
        console.error('2. Verify the endpoint is for Westend AssetHub')
        console.error('3. Ensure your wallet is connected to the correct network')
      } else {
        console.error('Root cause:', error.message)
        // 显示嵌套错误详情
        let currentError = error
        while (currentError.cause instanceof Error) {
          console.error('Underlying error:', currentError.cause.message)
          currentError = currentError.cause
        }
      }
    } else {
      console.error('Unknown error type:', error)
    }

    console.error('\n🛠️ Recommended Actions:')
    console.error('1. Verify RPC endpoint configuration (must be Westend AssetHub)')
    console.error('2. Check network chain ID matches (expected: 420420421)')
    console.error('3. Review account balance and gas parameters')
    console.error('4. Validate contract compilation artifacts')

    process.exit(1)
  }
})()