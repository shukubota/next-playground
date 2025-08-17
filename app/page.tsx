'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-6">Next.js Playground</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/*<Link href="/mahjong-trainer" className="block">*/}
        {/*  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">*/}
        {/*    <h2 className="text-xl font-semibold mb-2">麻雀牌理トレーニング</h2>*/}
        {/*    <p className="text-gray-600">基本的な麻雀の牌効率と何切る問題を練習できるトレーニングアプリ</p>*/}
        {/*  </div>*/}
        {/*</Link>*/}
        
        {/*<Link href="/osho-shutsujin" className="block">*/}
        {/*  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">*/}
        {/*    <h2 className="text-xl font-semibold mb-2">王将出陣</h2>*/}
        {/*    <p className="text-gray-600">王将を目標位置に移動させる将棋パズルゲーム</p>*/}
        {/*  </div>*/}
        {/*</Link>*/}
        
        {/*<Link href="/othello-claude3" className="block">*/}
        {/*  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">*/}
        {/*    <h2 className="text-xl font-semibold mb-2">Othello Game (Claude3)</h2>*/}
        {/*    <p className="text-gray-600">Claude3を使ったオセロ</p>*/}
        {/*  </div>*/}
        {/*</Link>*/}
        
        <Link href="/performance" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Performance Demo</h2>
            <p className="text-gray-600">Reactのパフォーマンス最適化のデモ</p>
          </div>
        </Link>
        
        <Link href="/gtm-test" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">GTM Test</h2>
            <p className="text-gray-600">Google Tag Managerの動作テスト用ページ</p>
          </div>
        </Link>
      </div>
    </div>
  );
}