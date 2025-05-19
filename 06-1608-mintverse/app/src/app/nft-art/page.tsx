'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * NFT艺术展示页面
 * 展示多个生成式NFT的示例和技术说明
 */
export default function NFTArtPage() {
  const [customTokenId, setCustomTokenId] = useState('');
  
  // 预设展示的tokenId数组
  const showcaseTokenIds = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">生成式NFT艺术</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            每个NFT图像都是使用确定性算法根据唯一的Token ID生成的。相同的Token ID始终会生成完全相同的图像。
          </p>
        </div>
        
        {/* 自定义Token ID输入 */}
        <div className="max-w-md mx-auto mb-16 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">试试不同的Token ID</h2>
          <div className="flex">
            <input
              type="number"
              value={customTokenId}
              onChange={(e) => setCustomTokenId(e.target.value)}
              placeholder="输入Token ID (1-1000)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              min="1"
              max="1000"
            />
            <Link
              href={customTokenId ? `/preview/${customTokenId}` : '#'}
              className={`px-6 py-2 bg-blue-500 text-white rounded-r-lg ${!customTokenId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              onClick={(e) => !customTokenId && e.preventDefault()}
            >
              查看
            </Link>
          </div>
        </div>
        
        {/* NFT展示网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-16">
          {showcaseTokenIds.map((id) => (
            <Link key={id} href={`/preview/${id}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg transition-transform group-hover:scale-[1.02]">
                {/* 使用静态图片替代动态生成的图片 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/nft-1.png"
                  alt={`NFT #${id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <div className="p-4 w-full">
                    <h3 className="text-white text-lg font-semibold">NFT #{id}</h3>
                    <p className="text-gray-200 text-sm">点击查看详情</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* 技术说明 */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6">技术说明</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">确定性生成算法</h3>
              <p className="text-gray-600 dark:text-gray-300">
                我们使用确定性随机数生成器 (PRNG)，以Token ID作为种子来生成图像。
                这确保了相同的Token ID将始终生成完全相同的图像，无论何时何地渲染。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">静态图片展示</h3>
              <p className="text-gray-600 dark:text-gray-300">
                当前版本使用静态图片展示NFT示例，实际应用时可以替换为动态生成的图像或IPFS存储的内容。
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">元数据生成</h3>
              <p className="text-gray-600 dark:text-gray-300">
                NFT元数据仍然是按需生成的，第一次请求时会生成并缓存。
                这种方法避免了预先计算所有可能的NFT属性，同时保证了确定性结果。
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 