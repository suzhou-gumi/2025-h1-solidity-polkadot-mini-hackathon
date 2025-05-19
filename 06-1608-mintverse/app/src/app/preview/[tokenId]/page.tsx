/**
 * NFT预览页面
 * 展示根据tokenId生成的NFT图像和元数据
 */

'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * NFT元数据类型定义
 */
interface NFTMetadata {
  name: string
  description: string
  image: string
  external_url: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
}

/**
 * 提取颜色对象，用于样式展示
 */
function extractColorsFromAttributes(attributes: {trait_type: string, value: string | number}[]) {
  const colors = {
    primary: '',
    secondary: '',
    accent: ''
  }
  
  attributes.forEach(attr => {
    if (attr.trait_type === 'Primary Color') {
      colors.primary = attr.value as string
    } else if (attr.trait_type === 'Secondary Color') {
      colors.secondary = attr.value as string
    }
  })
  
  return colors
}

/**
 * NFT预览页面组件
 */
export default function NFTPreview({ params }: { params: Promise<{ tokenId: string }> }) {
  const resolvedParams = use(params)
  const { tokenId } = resolvedParams
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [colors, setColors] = useState({ primary: '', secondary: '', accent: '' })

  useEffect(() => {
    async function fetchMetadata() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/nft/${tokenId}`)
        
        if (!response.ok) {
          throw new Error(`获取元数据失败: ${response.status}`)
        }
        
        const data = await response.json()
        setMetadata(data)
        
        // 提取颜色信息
        if (data.attributes) {
          const extractedColors = extractColorsFromAttributes(data.attributes)
          setColors(extractedColors)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
        console.error('获取元数据错误:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMetadata()
  }, [tokenId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">错误</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <Link href="/" className="inline-block mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  if (!metadata) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">{metadata.name}</h1>
          <div className="mt-3 max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 dark:text-gray-300">{metadata.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* NFT图像 */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-lg aspect-square overflow-hidden rounded-xl shadow-lg">
              {/* 使用静态图片替代动态生成的图片 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/nft-1.png" 
                alt={metadata.name}
                className="object-cover w-full h-full"
              />
              
              {/* 图像下边缘的TokenID标识 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 px-4 text-white flex justify-between items-center">
                <span className="font-semibold">TokenID: {tokenId}</span>
              </div>
            </div>
            
            {/* 颜色样本 */}
            <div className="absolute hidden lg:flex flex-col gap-3 left-4 top-1/2 -translate-y-1/2">
              {colors.primary && (
                <div 
                  className="w-8 h-8 rounded-full shadow-lg" 
                  style={{ backgroundColor: colors.primary }}
                  title="主色调"
                ></div>
              )}
              {colors.secondary && (
                <div 
                  className="w-8 h-8 rounded-full shadow-lg" 
                  style={{ backgroundColor: colors.secondary }}
                  title="辅助色调"
                ></div>
              )}
            </div>
          </div>
          
          {/* 元数据和属性 */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-6">NFT 属性</h2>
            
            {/* 颜色样本 (移动端) */}
            <div className="flex gap-4 mb-6 lg:hidden">
              {colors.primary && (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-8 h-8 rounded-full shadow-lg mb-1" 
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                  <span className="text-xs">主色调</span>
                </div>
              )}
              {colors.secondary && (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-8 h-8 rounded-full shadow-lg mb-1" 
                    style={{ backgroundColor: colors.secondary }}
                  ></div>
                  <span className="text-xs">辅助色调</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {metadata.attributes.map((attr, index) => (
                <div 
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">{attr.trait_type}</p>
                  <p className="font-medium mt-1">{attr.value}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 space-y-6">
              <h2 className="text-2xl font-semibold">技术信息</h2>
              
              <div className="space-y-2">
                <p><span className="font-medium">Token ID:</span> {tokenId}</p>
                <p><span className="font-medium">生成算法:</span> 确定性随机</p>
                <p><span className="font-medium">图像格式:</span> 静态PNG</p>
                <p><span className="font-medium">存储方式:</span> 本地存储</p>
              </div>
              
              <div className="pt-6 space-x-4">
                <Link href="/" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  返回首页
                </Link>
                <Link href="/nft-art" className="inline-block px-6 py-3 border border-blue-500 text-blue-500 dark:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors">
                  查看更多NFT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 