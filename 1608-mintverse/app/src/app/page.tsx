'use client'

import Empty from '@/components/Empty'
import NFTCard from '@/components/NFTCard'
import Skeleton from '@/components/Skeleton'
import { useNFTList } from '@/hooks/useNFTList'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function RootPage() {
  const { isLoading, nftList, refetch } = useNFTList({
    functionName: 'getAllSellingList',
  })
  const [randomTokenId, setRandomTokenId] = useState(1)

  // 在客户端生成随机tokenId
  useEffect(() => {
    setRandomTokenId(Math.floor(Math.random() * 10) + 1)
  }, [])

  const listRender = () => {
    if (isLoading) {
      return <Skeleton type="card" />
    }

    if (!nftList.length) {
      return (
        <>
          <div className="mb-8 p-6 bg-gray-800 rounded-xl text-center">
            <h2 className="text-2xl font-semibold mb-4">探索生成式NFT艺术</h2>
            <p className="mb-6">
              目前市场上还没有NFT在售，不过您可以先体验我们的生成式NFT艺术预览功能！
            </p>
            <Link 
              href="/nft-art" 
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-full transition-colors inline-block"
            >
              前往NFT艺术展示
            </Link>
          </div>
          <Empty />
        </>
      )
    }

    return (
      <>
        <div className="w-full flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">NFT市场</h2>
          <Link 
            href="/nft-art" 
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-full transition-colors text-sm"
          >
            查看生成式NFT艺术
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-4 max-xl:grid-cols-4">
          {(nftList || []).map(item => (
            <NFTCard key={item.tokenId} {...item} onBought={refetch} />
          ))}
        </div>
      </>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 py-12">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          Mintverse: NFT 去中心化交易平台
        </h1>
        
        <p className="text-xl mb-12 max-w-2xl">
          探索、收集和交易独特的数字艺术品，每个NFT都是基于独特算法生成的视觉艺术品。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">生成式NFT艺术</h2>
            <p className="mb-6">
              体验基于Token ID生成的独特曼陀罗艺术，每个Token ID都会生成确定性的唯一图案。
            </p>
            <Link 
              href={`/preview/${randomTokenId}`} 
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-full transition-colors"
            >
              预览随机NFT
            </Link>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">基于链下生成 + IPFS存储</h2>
            <p className="mb-6">
              我们的NFT结合了链下生成算法和IPFS分布式存储，确保高效生成与永久保存。
            </p>
            <Link 
              href="/docs" 
              className="border border-purple-500 hover:bg-purple-900 text-white py-2 px-6 rounded-full transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5].map((id) => (
            <Link key={id} href={`/preview/${id}`} className="hover:scale-105 transition-transform">
              <div className="relative w-[120px] h-[120px] bg-gray-700 rounded-lg overflow-hidden">
                <Image 
                  src={`/nft-1.png`}
                  alt={`NFT #${id}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                  id={`nft-preview-${id}`}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
