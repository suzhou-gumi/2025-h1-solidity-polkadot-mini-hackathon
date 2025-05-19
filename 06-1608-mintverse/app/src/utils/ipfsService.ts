/**
 * ipfsService.ts
 * 提供IPFS上传功能
 */

import pinataSDK from '@pinata/sdk'

// 环境变量
const PINATA_API_KEY = process.env.PINATA_API_KEY || ''
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY || ''

// 检查Pinata凭证是否已配置
const isPinataConfigured = PINATA_API_KEY && PINATA_SECRET_KEY

// Pinata客户端
let pinata: any = null

// 初始化Pinata客户端
if (isPinataConfigured) {
  pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY)
}

/**
 * 验证Pinata凭证是否有效
 */
export async function testPinataAuthentication(): Promise<boolean> {
  if (!isPinataConfigured) {
    console.warn('Pinata API credentials not configured.')
    return false
  }

  try {
    await pinata.testAuthentication()
    console.log('Pinata authentication successful!')
    return true
  }
  catch (err) {
    console.error('Pinata authentication failed:', err)
    return false
  }
}

/**
 * 上传图片到IPFS
 * @param imgBuffer - 图片数据buffer
 * @param tokenId - NFT的tokenId
 * @returns IPFS CID或null（如果上传失败）
 */
export async function uploadImageToIPFS(imgBuffer: Buffer, tokenId: number): Promise<string | null> {
  if (!isPinataConfigured || !pinata) {
    console.warn('Pinata not configured. Unable to upload image.')
    return null
  }

  try {
    const options = {
      pinataMetadata: {
        name: `Mintverse-Mandala-${tokenId}`
      }
    }

    const result = await pinata.pinFileToIPFS(imgBuffer, options)
    
    console.log(`Image for token ${tokenId} uploaded to IPFS with CID: ${result.IpfsHash}`)
    return result.IpfsHash
  }
  catch (err) {
    console.error(`Error uploading image for token ${tokenId} to IPFS:`, err)
    return null
  }
}

/**
 * 创建并上传NFT元数据到IPFS
 * @param tokenId - NFT的tokenId
 * @param imageCid - 图片的IPFS CID
 * @param traits - NFT属性
 * @returns 元数据的IPFS CID或null（如果上传失败）
 */
export async function uploadMetadataToIPFS(
  tokenId: number,
  imageCid: string,
  traits: Record<string, string>
): Promise<string | null> {
  if (!isPinataConfigured || !pinata) {
    console.warn('Pinata not configured. Unable to upload metadata.')
    return null
  }

  // 格式化traits为OpenSea兼容格式
  const attributes = Object.entries(traits).map(([trait_type, value]) => ({
    trait_type,
    value
  }))

  // 创建元数据
  const metadata = {
    name: `Mintverse Mandala #${tokenId}`,
    description: 'A unique generative mandala artwork NFT.',
    image: `ipfs://${imageCid}`,
    external_url: `https://mintverse.com/token/${tokenId}`,
    attributes
  }

  try {
    const options = {
      pinataMetadata: {
        name: `Mintverse-Metadata-${tokenId}`
      }
    }

    const result = await pinata.pinJSONToIPFS(metadata, options)
    
    console.log(`Metadata for token ${tokenId} uploaded to IPFS with CID: ${result.IpfsHash}`)
    return result.IpfsHash
  }
  catch (err) {
    console.error(`Error uploading metadata for token ${tokenId} to IPFS:`, err)
    return null
  }
}

/**
 * 获取本地缓存元数据或生成新元数据
 * @param tokenId - NFT的token ID
 * @param getTraitsFunction - 获取NFT特性的函数
 * @param generateImageFunction - 生成图片的函数
 * @returns 包含元数据URI的对象，或null
 */
export async function getOrCreateMetadata(
  tokenId: number,
  getTraitsFunction: (tokenId: number) => Record<string, string>,
  generateImageFunction: (tokenId: number) => Promise<Buffer>
): Promise<{ metadataUri: string, imageUri: string } | null> {
  try {
    // 生成图像
    const imageBuffer = await generateImageFunction(tokenId)
    
    // 上传图像到IPFS
    const imageCid = await uploadImageToIPFS(imageBuffer, tokenId)
    if (!imageCid) return null
    
    // 获取NFT特性
    const traits = getTraitsFunction(tokenId)
    
    // 上传元数据到IPFS
    const metadataCid = await uploadMetadataToIPFS(tokenId, imageCid, traits)
    if (!metadataCid) return null
    
    return {
      metadataUri: `ipfs://${metadataCid}`,
      imageUri: `ipfs://${imageCid}`
    }
  }
  catch (err) {
    console.error(`Error creating metadata for token ${tokenId}:`, err)
    return null
  }
} 