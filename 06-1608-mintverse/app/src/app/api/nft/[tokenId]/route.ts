/**
 * NFT元数据API路由
 * 根据tokenId提供NFT元数据，包括图像URI和属性
 */

import { NextRequest, NextResponse } from 'next/server'
import seedrandom from 'seedrandom'

// 缓存对象，用于存储已生成的元数据
const metadataCache: Record<string, any> = {}

/**
 * 检查tokenId是否有效
 */
function isValidTokenId(tokenId: string): boolean {
  const id = parseInt(tokenId, 10)
  return !isNaN(id) && id > 0
}

/**
 * 生成颜色特性
 * @param tokenId - NFT的唯一标识符
 */
function generateTraits(tokenId: number): Record<string, string | number> {
  const rng = seedrandom(tokenId.toString())
  
  // 基础色相
  const hue = Math.floor(rng() * 360)
  // 互补色相
  const complementaryHue = (hue + 180) % 360
  
  // 生成层和圆环数量
  const layers = 3 + Math.floor(rng() * 5)
  const circles = 8 + Math.floor(rng() * 8)
  
  return {
    'Primary Color': `hsl(${hue}, 80%, 50%)`,
    'Secondary Color': `hsl(${complementaryHue}, 80%, 50%)`,
    'Layers': layers,
    'Circles': circles,
    'Shape Type': Math.random() > 0.5 ? 'Circular' : 'Spiral',
  }
}

/**
 * 处理GET请求，返回NFT元数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const resolvedParams = await params
  const { tokenId } = resolvedParams

  // 验证tokenId
  if (!isValidTokenId(tokenId)) {
    return NextResponse.json(
      { error: '无效的tokenId' },
      { status: 400 }
    )
  }

  const tokenIdNumber = parseInt(tokenId, 10)

  try {
    // 检查缓存
    if (metadataCache[tokenId]) {
      return NextResponse.json(metadataCache[tokenId])
    }
    
    // 生成特性
    const traits = generateTraits(tokenIdNumber)
    
    // 构建元数据对象
    const metadata = {
      name: `Mintverse NFT #${tokenId}`,
      description: '基于tokenId生成的独特NFT，每个都有不同的颜色和形状特性。',
      image: `/nft-1.png`,
      external_url: `${request.nextUrl.origin}/preview/${tokenId}`,
      attributes: Object.entries(traits).map(([trait_type, value]) => ({
        trait_type,
        value
      }))
    }
    
    // 缓存元数据
    metadataCache[tokenId] = metadata
    
    // 返回响应
    return NextResponse.json(metadata)
  } 
  catch (error) {
    console.error(`Error generating metadata for token ${tokenId}:`, error)
    
    return NextResponse.json(
      { error: '生成元数据时发生错误' },
      { status: 500 }
    )
  }
} 