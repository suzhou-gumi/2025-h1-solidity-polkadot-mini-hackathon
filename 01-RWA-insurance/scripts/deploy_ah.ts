import { createPublicClient, createWalletClient, defineChain, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { config } from "dotenv"
import path from 'path'
import fs from 'fs'

config()

// 定义Westend AssetHub链
export const westendAssetHub = defineChain({
  id: 10081,
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
  },
  testnet: true,
})

const PRIVATE_KEY = process.env.AH_PRIV_KEY
if (!PRIVATE_KEY || !PRIVATE_KEY.startsWith("0x")) {
  throw new Error('AH_PRIV_KEY is not defined or does not start with "0x". Please check your environment variables.')
}
// console.log(`Private key: ${PRIVATE_KEY}`)

async function deployToAssetHub(contractName: string) {
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

  const client = createWalletClient({
    account: wallet,
    transport: http(),
    chain: westendAssetHub,
  })

  const publicClient = createPublicClient({
    transport: http(),
    chain: westendAssetHub,
  })

  // 检查余额
  const balance = await publicClient.getBalance({ address })
  console.log('Balance (WND):', balance)

  // 获取 nonce
  const nonce = await publicClient.getTransactionCount({ address })
  console.log('Nonce:', nonce)

  // 手动设定一个较高的 gas limit（适用于 PolkaVM）
  const gasLimit = 30_000_000n // PolkaVM 上合约部署需要较高 gas

  try {
    // 直接部署合约
    const hash = await client.deployContract({
      abi,
      bytecode,
      args: [],
      gas: gasLimit,
      nonce,
    })
    console.log('Transaction hash:', hash)

    // 等待交易确认
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000,
    })

    if (receipt.status !== 'success') {
      throw new Error('Contract deployment failed')
    }

    console.log('Contract deployed at address:', receipt.contractAddress)
    return receipt.contractAddress
  } catch (error) {
    console.error('Deployment error:', error)
    throw error
  }
}

// 执行部署
;(async () => {
  try {
    const contractAddress = await deployToAssetHub('DividendToken')
    console.log(`✅ Contract deployed at address: ${contractAddress}`)
  } catch (e) {
    if (e instanceof Error) {
      console.error('❌ Deployment failed:', e.message)
    } else {
      console.error('❌ Unknown error:', e)
    }
  }
})()