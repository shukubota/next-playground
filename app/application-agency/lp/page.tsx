'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header style={{backgroundColor: '#00a9e0'}} className="shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img 
                src="/images/application-agency/logo.png" 
                alt="アプリ申請代行" 
                className="h-12"
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-white hover:text-gray-200">サービス</a>
              <a href="#pricing" className="text-white hover:text-gray-200">料金</a>
              <a href="#faq" className="text-white hover:text-gray-200">FAQ</a>
              <a href="#contact" className="text-white hover:text-gray-200">お問い合わせ</a>
            </div>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">メニューを開く</span>
              <div className="w-6 h-6 flex flex-col justify-center">
                <span className="block w-full h-0.5 bg-gray-600 mb-1"></span>
                <span className="block w-full h-0.5 bg-gray-600 mb-1"></span>
                <span className="block w-full h-0.5 bg-gray-600"></span>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#3d3939] mb-6">
              モバイルアプリの<br />
              <span className="text-blue-600">申請代行サービス</span>
            </h1>
            <p className="text-xl text-[#aaabab] mb-8 max-w-3xl mx-auto">
              Apple App Store・Google Play Storeへの申請を専門チームが代行。<br />
              複雑な申請プロセスから解放され、アプリ開発に集中できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/application-agency"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                申請を依頼する
              </Link>
              <a
                href="#services"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-200"
              >
                サービス詳細
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d3939] mb-4">
              提供サービス
            </h2>
            <p className="text-xl text-[#aaabab]">
              Apple・Googleへの申請プロセスを完全サポート
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#3d3939] mb-4">Apple App Store申請</h3>
              <p className="text-[#aaabab]">
                App Store Connectでの申請から審査対応まで、Appleの厳格なガイドラインに基づいて代行いたします。
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#3d3939] mb-4">Google Play申請</h3>
              <p className="text-[#aaabab]">
                Google Play Consoleでの申請プロセスを熟知した専門チームが、スムーズな公開をサポートします。
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#3d3939] mb-4">迅速対応</h3>
              <p className="text-[#aaabab]">
                申請から公開まで最短での対応を心がけ、お客様のビジネススケジュールに合わせてサポートいたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#efefef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d3939] mb-4">
              料金プラン
            </h2>
            <p className="text-xl text-[#aaabab]">
              シンプルで分かりやすい料金体系
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-[#3d3939] mb-4">ベーシック</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#3d3939]">¥50,000</span>
                <span className="text-[#aaabab]">/プラットフォーム</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  申請代行（1プラットフォーム）
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  基本的な審査対応
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  メールサポート
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200">
                選択する
              </button>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-xl shadow-lg border-2 border-blue-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-[#3d3939] px-4 py-1 rounded-full text-sm font-semibold">
                  おすすめ
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">スタンダード</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">¥80,000</span>
                <span className="text-blue-100">/両プラットフォーム</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-100 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">申請代行（両プラットフォーム）</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-100 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">詳細な審査対応</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-blue-100 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">電話・メールサポート</span>
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-[#efefef] transition duration-200">
                選択する
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <h3 className="text-xl font-semibold text-[#3d3939] mb-4">プレミアム</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#3d3939]">¥120,000</span>
                <span className="text-[#aaabab]">/両プラットフォーム</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  申請代行（両プラットフォーム）
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  全面的な審査対応
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  専任担当者制
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  アップデート対応（3回まで）
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200">
                選択する
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d3939] mb-4">
              よくある質問
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-[#3d3939] mb-3">
                申請にはどのくらいの期間がかかりますか？
              </h3>
              <p className="text-[#aaabab]">
                通常、Apple App Storeは1-7日、Google Play Storeは1-3日程度で審査が完了します。ただし、アプリの内容や時期により変動する場合があります。
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-[#3d3939] mb-3">
                申請が却下された場合はどうなりますか？
              </h3>
              <p className="text-[#aaabab]">
                却下された場合は、その理由を詳しく分析し、修正点をご提案いたします。修正後の再申請も料金に含まれております。
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-[#3d3939] mb-3">
                どのような情報を提供する必要がありますか？
              </h3>
              <p className="text-[#aaabab]">
                アプリファイル（APK/IPA）、アプリ説明文、スクリーンショット、アイコン、開発者情報などが必要です。詳細は申請フォームでご確認いただけます。
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-[#3d3939] mb-3">
                途中でキャンセルはできますか？
              </h3>
              <p className="text-[#aaabab]">
                申請開始前であればキャンセル可能です。申請開始後のキャンセルについては、進捗状況に応じて一部返金いたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#efefef]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d3939] mb-4">
              お問い合わせ
            </h2>
            <p className="text-xl text-[#aaabab]">
              ご質問やご相談がございましたら、お気軽にお問い合わせください
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#3d3939] mb-2">
                    お名前 *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#3d3939] mb-2">
                    メールアドレス *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-[#3d3939] mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#3d3939] mb-2">
                  お問い合わせ内容 *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                送信する
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">アプリ申請代行</h3>
              <p className="text-gray-400">
                プロフェッショナルなアプリ申請代行サービス
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Apple App Store申請</a></li>
                <li><a href="#" className="hover:text-white">Google Play申請</a></li>
                <li><a href="#" className="hover:text-white">審査対応</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">会社概要</a></li>
                <li><a href="#" className="hover:text-white">利用規約</a></li>
                <li><a href="#" className="hover:text-white">プライバシーポリシー</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4">お問い合わせ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>メール: info@example.com</li>
                <li>電話: 03-1234-5678</li>
                <li>営業時間: 平日 9:00-18:00</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 アプリ申請代行. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}