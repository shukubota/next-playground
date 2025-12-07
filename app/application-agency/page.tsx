'use client';

import { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/application-agency/FileUpload';
import AIHintButton from '@/components/application-agency/AIHintButton';

interface FormData {
  accountEmail: string;
  companyName: string;
  promoText: string;
  description: string;
  versionInfo: string;
  keywords: string;
  supportUrl: string;
  marketingUrl: string;
  copyright: string;
  signInInfo: string;
  contactInfo: string;
  memo: string;
  releaseMethod: string;
  resetRating: string;
  appName: string;
  subtitle: string;
  category1: string;
  category2: string;
  distributionCountries: string;
  privacyPolicyUrl: string;
  notes: string;
}

export default function ApplicationForm() {
  const [formData, setFormData] = useState<FormData>({
    accountEmail: '',
    companyName: '',
    promoText: '',
    description: '',
    versionInfo: '',
    keywords: '',
    supportUrl: '',
    marketingUrl: '',
    copyright: '',
    signInInfo: '',
    contactInfo: '',
    memo: '',
    releaseMethod: '自動',
    resetRating: '無し',
    appName: '',
    subtitle: '',
    category1: '',
    category2: '',
    distributionCountries: '変更なし',
    privacyPolicyUrl: '',
    notes: ''
  });

  const [files, setFiles] = useState<{
    screenshots: FileList | null;
    icon: FileList | null;
    apk: FileList | null;
  }>({
    screenshots: null,
    icon: null,
    apk: null
  });

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCheckingRejectRisk, setIsCheckingRejectRisk] = useState(false);
  const [rejectRiskResult, setRejectRiskResult] = useState<string | null>(null);
  const [showRejectRiskModal, setShowRejectRiskModal] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (name: string) => (selectedFiles: FileList | null) => {
    setFiles(prev => ({
      ...prev,
      [name]: selectedFiles
    }));
  };

  const handleAIGenerate = (field: keyof FormData) => (generatedText: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: generatedText
    }));
  };

  const handleGenerateImage = async () => {
    if (!formData.description) {
      alert('アプリの概要を入力してください');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '画像生成に失敗しました');
      }

      const data = await response.json();
      setGeneratedImage(data.image);
    } catch (error) {
      console.error('Image generation error:', error);
      alert(`画像生成エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadGeneratedImage = () => {
    if (!generatedImage) return;
    
    // Convert base64 to blob
    const byteCharacters = atob(generatedImage);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-icon-${Date.now()}.png`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseMarkdown = (markdown: string): string => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3" style="color: #3d3939;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-8 mb-4" style="color: #00a9e0;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-6" style="color: #3d3939;">$1</h1>')
      .replace(/^\* (.*$)/gim, '<div class="ml-4 mb-2">• $1</div>')
      .replace(/^- (.*$)/gim, '<div class="ml-4 mb-2">• $1</div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f4490;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-[#efefef] px-2 py-1 rounded text-sm">$1</code>')
      .replace(/🟢/g, '<span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>')
      .replace(/🟡/g, '<span class="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>')
      .replace(/🔴/g, '<span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>')
      .replace(/💡/g, '<span class="text-blue-500 mr-1">💡</span>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gim, '<p class="mb-4">$1</p>')
      .replace(/<p class="mb-4"><\/p>/g, '')
      .replace(/<p class="mb-4"><div/g, '<div')
      .replace(/<\/div><\/p>/g, '</div>');
  };

  const handleRejectRiskCheck = async () => {
    if (!formData.appName || !formData.description) {
      alert('アプリ名と概要を入力してください');
      return;
    }

    setIsCheckingRejectRisk(true);
    setStreamingContent('');
    setShowRejectRiskModal(true);
    
    try {
      const response = await fetch('/api/reject-risk-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData
        }),
      });

      if (!response.ok) {
        throw new Error('リジェクトリスク分析に失敗しました');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let content = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  content += data.content;
                  setStreamingContent(content);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      setRejectRiskResult(content);
    } catch (error) {
      console.error('Reject risk check error:', error);
      alert(`リジェクトリスク分析エラー: ${error instanceof Error ? error.message : '不明なエラーが発生しました'}`);
      setShowRejectRiskModal(false);
    } finally {
      setIsCheckingRejectRisk(false);
    }
  };

  const fillDemoData = () => {
    const demoData: FormData = {
      accountEmail: 'support@fastmedia.jp',
      companyName: 'CHEFO.Co.,Ltd',
      promoText: '疲労度に合わせてレシピ提案！3工程以内でできる超簡単ごはんを、かわいい動物と。もう献立に悩まない。',
      description: `もう「ごはん、どうしよう…」で悩まない！あなたの疲れに寄り添う、新感覚レシピアプリ。
仕事や家事でヘトヘトな日、ご飯を作る気力なんてない…そんな時、ありませんか？
「今日のラクめし」は、あなたのその日の疲れ度に合わせて最適なレシピを提案してくれる、究極の「お助け」アプリです。

◆◇ アプリの特徴 ◇◆
【あなたの「疲れ度」に合わせたパーソナル提案】
今日のあなたはどのくらい疲れてる？正直な気持ちで選択してください。
選択肢は5段階！
本当はすぐ寝たい: 火も包丁も使いたくない！究極の「のせるだけ」「混ぜるだけ」レシピ
レンジなら使えそう: 電子レンジにお任せ！温めるだけで完成するお手軽メニュー
包丁も使えそう: ちょっとだけなら頑張れる！包丁を使って切るだけ、あとは火にかけるだけレシピ
コンロを使ってもいい: 少しは動ける！簡単な炒め物や煮込み料理で気分転換レシピ
調理工程が複雑でも頑張れる: 明日の私に期待！手の込んだ料理で自分を労わるご褒美レシピ
あなたの疲れ度にぴったりのレシピを瞬時に表示します。

【3工程以内で完成！超簡単レシピの宝庫】
「調理工程が複雑でも頑張れる」以外の疲れ度を選択した場合、全てのレシピが3工程以内で調理できるよう工夫されています。
複雑な手順や大量の洗い物とはもうお別れ。最短で美味しいご飯にたどり着けます。

【癒しの動物アドバイザー】
アプリには、ゆるくて可愛い動物たちがアドバイザーとして登場！
・いたずら好きなきつね
・甘えん坊のうさぎ
・のんびりやさんのくま
・クールなふくろう
彼らがあなたの疲れを労り、優しくレシピを案内してくれます。彼らのコメントにも注目！

◆◇ こんな方におすすめ！ ◇◆
仕事や家事で毎日忙しい方
献立を考えるのが面倒な方
自炊したいけど、調理に時間をかけたくない方
簡単でおいしいレシピを知りたい方


◆◇ さらに楽しむ (アプリ内課金) ◇◆
基本機能だけでも十分お楽しみいただけますが、課金することで以下の特典が得られます。
レシピ数アップ: より多くのレシピから選べるようになります。
アレンジレシピ追加: 同じ食材でも飽きない、ひと工夫加えたバリエーションレシピが閲覧可能に。
今日のご飯、もう悩まない！「今日のラクめし」があなたの食卓を優しくサポートします。`,
      versionInfo: 'アプリの内部処理を一部変更しました。',
      keywords: '簡単レシピ,時短ごはん,疲労回復,おつかれ,献立,ラクめし,癒し,初心者向け,料理',
      supportUrl: 'https://yappli.co.jp/',
      marketingUrl: 'https://yappli.co.jp/',
      copyright: 'CHEFO.Co.,Ltd',
      signInInfo: `ID：yappli1234
PASS：yappli1234`,
      contactInfo: `お名前（英語表記）：Manami Sonokawa
電話番号：+81-3-6866-5730
メールアドレス：support@yappli.co.jp`,
      memo: '',
      releaseMethod: '自動',
      resetRating: '無し',
      appName: 'Easy Recipes',
      subtitle: '寄り添う動物たちと作る癒しレシピ',
      category1: 'フード／ドリンク',
      category2: 'ライフスタイル',
      distributionCountries: '変更なし',
      privacyPolicyUrl: 'https://yappli.co.jp/',
      notes: '特にありません。'
    };

    setFormData(demoData);
  };

  const downloadCSV = () => {
    const csvContent = [
      ['', ''],
      ['申請用アカウント', formData.accountEmail],
      ['App Store 会社名', formData.companyName],
      ['プロモーション用テキスト　※任意', formData.promoText],
      ['概要', formData.description],
      ['このバージョンの最新情報\n※指定文言がある場合はご記載ください。', formData.versionInfo],
      ['キーワード', formData.keywords],
      ['サポートURL', formData.supportUrl],
      ['マーケティングURL　※任意', formData.marketingUrl],
      ['著作権', formData.copyright],
      ['サインイン情報　※任意', formData.signInInfo],
      ['連絡先情報', formData.contactInfo],
      ['メモ　※任意', formData.memo],
      ['公開方法（自動 or 手動）', formData.releaseMethod],
      ['iOS App Store評価概要のリセット', formData.resetRating],
      ['アプリ名', formData.appName],
      ['サブタイトル　※任意', formData.subtitle],
      ['カテゴリ①', formData.category1],
      ['カテゴリ②　※任意', formData.category2],
      ['アプリの配信国\n※変更がある場合のみご記載ください。', formData.distributionCountries],
      ['プライバシーポリシーURL', formData.privacyPolicyUrl],
      ['その他特記事項があればご記載ください。', formData.notes]
    ];

    const csvString = csvContent.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `application-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    downloadCSV();
    alert('申請情報をCSVファイルとしてダウンロードしました。ありがとうございます。');
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#efefef'}}>
      {/* Header */}
      <header style={{backgroundColor: '#00a9e0'}} className="shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/application-agency/lp" className="flex items-center">
              <img 
                src="/images/application-agency/logo.png" 
                alt="アプリ申請代行" 
                className="h-12"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={fillDemoData}
                type="button"
                className="text-sm underline transition duration-200 text-white hover:text-gray-200"
              >
                デモデータ入力
              </button>
              <Link
                href="/application-agency/lp"
                className="transition duration-200 text-white hover:text-gray-200"
              >
                サービス詳細に戻る
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#3d3939'}}>
            申請情報入力
          </h1>
          <p className="text-xl" style={{color: '#aaabab'}}>
            アプリストア申請に必要な情報をご入力ください
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-10">
          <form onSubmit={handleSubmit} className="space-y-16">
            {/* 基本情報 */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#00a9e0'}}></span>
                基本情報
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label htmlFor="accountEmail" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    申請用アカウント（メールアドレス） *
                  </label>
                  <input
                    type="email"
                    id="accountEmail"
                    name="accountEmail"
                    value={formData.accountEmail}
                    onChange={handleInputChange}
                    placeholder="support@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    App Store 会社名 *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Example Co.,Ltd"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="appName" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  アプリ名 *
                </label>
                <input
                  type="text"
                  id="appName"
                  name="appName"
                  value={formData.appName}
                  onChange={handleInputChange}
                  placeholder="Easy Recipes"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2 mt-8">
                <label htmlFor="subtitle" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  サブタイトル（任意）
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="寄り添う動物たちと作る癒しレシピ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400"
                />
              </div>
            </section>

            {/* アプリ説明 */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#00a9e0'}}></span>
                アプリ説明
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="promoText" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    プロモーション用テキスト（任意）
                  </label>
                  <AIHintButton
                    onGenerate={handleAIGenerate('promoText')}
                    context={formData}
                    fieldType="promoText"
                    disabled={!formData.appName}
                  />
                </div>
                <textarea
                  id="promoText"
                  name="promoText"
                  value={formData.promoText}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="疲労度に合わせてレシピ提案！3工程以内でできる超簡単ごはんを、かわいい動物と。もう献立に悩まない。"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
                {!formData.appName ? (
                  <p className="text-xs text-[#aaabab] mt-1">
                    AIヒントを使用するには、アプリ名を先に入力してください
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="description" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    概要 *
                  </label>
                  <AIHintButton
                    onGenerate={handleAIGenerate('description')}
                    context={formData}
                    fieldType="description"
                    disabled={!formData.appName}
                  />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={10}
                  placeholder="もう「ごはん、どうしよう…」で悩まない！あなたの疲れに寄り添う、新感覚レシピアプリ。"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
                <p className="text-sm text-[#aaabab] mt-2">
                  アプリの特徴、機能、対象ユーザーなどを詳しく記載してください
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="versionInfo" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    このバージョンの最新情報
                  </label>
                  <AIHintButton
                    onGenerate={handleAIGenerate('versionInfo')}
                    context={formData}
                    fieldType="versionInfo"
                    disabled={!formData.appName}
                  />
                </div>
                <textarea
                  id="versionInfo"
                  name="versionInfo"
                  value={formData.versionInfo}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="アプリの内部処理を一部変更しました。"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
              </div>
            </section>

            {/* カテゴリ・キーワード */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#00a9e0'}}></span>
                カテゴリ・キーワード
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label htmlFor="category1" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    カテゴリ① *
                  </label>
                  <select
                    id="category1"
                    name="category1"
                    value={formData.category1}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  >
                    <option value="">選択してください</option>
                    <option value="フード／ドリンク">フード／ドリンク</option>
                    <option value="ライフスタイル">ライフスタイル</option>
                    <option value="ゲーム">ゲーム</option>
                    <option value="ビジネス">ビジネス</option>
                    <option value="教育">教育</option>
                    <option value="エンターテイメント">エンターテイメント</option>
                    <option value="ヘルスケア／フィットネス">ヘルスケア／フィットネス</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category2" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    カテゴリ②（任意）
                  </label>
                  <select
                    id="category2"
                    name="category2"
                    value={formData.category2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  >
                    <option value="">選択してください</option>
                    <option value="フード／ドリンク">フード／ドリンク</option>
                    <option value="ライフスタイル">ライフスタイル</option>
                    <option value="ゲーム">ゲーム</option>
                    <option value="ビジネス">ビジネス</option>
                    <option value="教育">教育</option>
                    <option value="エンターテイメント">エンターテイメント</option>
                    <option value="ヘルスケア／フィットネス">ヘルスケア／フィットネス</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="keywords" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    キーワード *
                  </label>
                  <AIHintButton
                    onGenerate={handleAIGenerate('keywords')}
                    context={formData}
                    fieldType="keywords"
                    disabled={!formData.appName}
                  />
                </div>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="簡単レシピ,時短ごはん,疲労回復,おつかれ,献立,ラクめし,癒し,初心者向け,料理"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400"
                />
                <p className="text-sm text-[#aaabab] mt-2">
                  カンマ区切りで入力してください（検索で見つけやすくするキーワード）
                </p>
              </div>
            </section>

            {/* URL・連絡先情報 */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#00a9e0'}}></span>
                URL・連絡先情報
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label htmlFor="supportUrl" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    サポートURL *
                  </label>
                  <input
                    type="url"
                    id="supportUrl"
                    name="supportUrl"
                    value={formData.supportUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/support"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="marketingUrl" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    マーケティングURL（任意）
                  </label>
                  <input
                    type="url"
                    id="marketingUrl"
                    name="marketingUrl"
                    value={formData.marketingUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="privacyPolicyUrl" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  プライバシーポリシーURL *
                </label>
                <input
                  type="url"
                  id="privacyPolicyUrl"
                  name="privacyPolicyUrl"
                  value={formData.privacyPolicyUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/privacy"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2 mt-8">
                <label htmlFor="contactInfo" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  連絡先情報 *
                </label>
                <textarea
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder={`お名前（英語表記）：Taro Yamada\n電話番号：+81-3-1234-5678\nメールアドレス：support@example.com`}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="memo" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  メモ（任意）
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="その他、申請に関する特記事項があればご記載ください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
              </div>
            </section>

            {/* ファイル */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#3c82b6'}}></span>
                ファイル
              </h2>
              
              <div className="space-y-10">
                <div className="space-y-6">
                  <FileUpload
                    id="icon"
                    name="icon"
                    accept=".png"
                    required
                    label="アプリアイコン（512x512px PNG形式）"
                    description="正方形のPNG形式で、512x512ピクセル以上の高解像度アイコンをアップロードしてください"
                    onFileChange={handleFileChange('icon')}
                  />
                  
                  {/* アイコン生成提案 */}
                  <div className="rounded-lg p-4 border-2 border-dashed" style={{borderColor: '#d1eaf8', backgroundColor: '#f8fcff'}}>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#d1eaf8'}}>
                        <span className="text-xl">🎨</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold mb-2" style={{color: '#0f4490'}}>
                          アイコン画像の用意はまだですか？
                        </h4>
                        <p className="text-sm mb-3" style={{color: '#3d3939'}}>
                          アプリの説明文からAIがアイコンを自動生成します。手軽にプロフェッショナルなアイコンを作成できます。
                        </p>
                        <button
                          type="button"
                          onClick={() => handleGenerateImage()}
                          disabled={!formData.description || isGeneratingImage}
                          className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
                          style={{backgroundColor: '#30acab'}}
                          onMouseEnter={(e) => !(e.target as HTMLButtonElement).disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#00579c')}
                          onMouseLeave={(e) => !(e.target as HTMLButtonElement).disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#30acab')}
                        >
                          {isGeneratingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>AI生成中...</span>
                            </>
                          ) : (
                            <>
                              <span>🎨</span>
                              <span>AIでアイコンを作成してみる</span>
                            </>
                          )}
                        </button>
                        {!formData.description && (
                          <p className="text-xs mt-2" style={{color: '#aaabab'}}>
                            ※ アプリの概要を入力すると利用できます
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 生成された画像の表示 */}
                  {generatedImage && (
                    <div className="rounded-lg p-6 border" style={{borderColor: '#30acab', backgroundColor: '#f0fffe'}}>
                      <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-5 h-5" style={{color: '#30acab'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h4 className="font-semibold" style={{color: '#0f4490'}}>AIアイコン生成完了</h4>
                      </div>
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <img
                            src={`data:image/png;base64,${generatedImage}`}
                            alt="Generated app icon"
                            className="w-32 h-32 object-cover rounded-xl border-2 shadow-lg"
                            style={{borderColor: '#30acab'}}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm mb-4" style={{color: '#3d3939'}}>
                            アプリの説明から自動生成されたアイコンです。気に入ったらダウンロードしてアプリアイコンとして使用できます。
                          </p>
                          <div className="space-x-3">
                            <button
                              type="button"
                              onClick={() => downloadGeneratedImage()}
                              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                              style={{backgroundColor: '#00a9e0'}}
                              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#155fad'}
                              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00a9e0'}
                            >
                              📥 ダウンロード
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGenerateImage()}
                              disabled={isGeneratingImage}
                              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200"
                              style={{color: '#3d3939', borderColor: '#aaabab'}}
                              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#efefef'}
                              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                            >
                              🔄 再生成
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <FileUpload
                  id="screenshots"
                  name="screenshots"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  required
                  label="スクリーンショット（複数選択可）"
                  description="3-10枚のスクリーンショットをアップロードしてください。縦長（9:16）の比率が推奨されます"
                  onFileChange={handleFileChange('screenshots')}
                />
                
                <FileUpload
                  id="apk"
                  name="apk"
                  accept=".apk,.aab"
                  required
                  label="APK/AABファイル"
                  description="Androidアプリのパッケージファイル（APKまたはAAB形式）をアップロードしてください"
                  onFileChange={handleFileChange('apk')}
                />
              </div>
            </section>

            {/* その他設定 */}
            <section>
              <h2 className="text-2xl font-semibold mb-8 border-b border-gray-200 pb-3 flex items-center" style={{color: '#3d3939'}}>
                <span className="w-2 h-6 rounded-full mr-3" style={{backgroundColor: '#3c82b6'}}></span>
                その他設定
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label htmlFor="releaseMethod" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    公開方法 *
                  </label>
                  <select
                    id="releaseMethod"
                    name="releaseMethod"
                    value={formData.releaseMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  >
                    <option value="自動">自動</option>
                    <option value="手動">手動</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="distributionCountries" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                    アプリの配信国
                  </label>
                  <input
                    type="text"
                    id="distributionCountries"
                    name="distributionCountries"
                    value={formData.distributionCountries}
                    onChange={handleInputChange}
                    placeholder="変更なし"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400"
                    style={{borderColor: '#aaabab'}}
                    onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                    onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="copyright" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  著作権 *
                </label>
                <input
                  type="text"
                  id="copyright"
                  name="copyright"
                  value={formData.copyright}
                  onChange={handleInputChange}
                  placeholder="Example Co.,Ltd"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:border-gray-400"
                />
              </div>

              <div className="space-y-2 mt-8">
                <label htmlFor="signInInfo" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  サインイン情報（任意）
                </label>
                <textarea
                  id="signInInfo"
                  name="signInInfo"
                  value={formData.signInInfo}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder={`ID：testuser\nPASS：testpass123`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
                <p className="text-sm text-[#aaabab] mt-2">
                  審査用のテストアカウント情報（必要な場合のみ）
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-semibold" style={{color: '#3d3939'}}>
                  その他特記事項
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="審査時に注意していただきたい点や、その他ご要望があればご記載ください"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 resize-none"
                  style={{borderColor: '#aaabab'}}
                  onFocus={(e) => {e.target.style.borderColor = '#00a9e0'; e.target.style.boxShadow = '0 0 0 2px rgba(0, 169, 224, 0.2)'}}
                  onBlur={(e) => {e.target.style.borderColor = '#aaabab'; e.target.style.boxShadow = 'none'}}
                />
              </div>
            </section>

            {/* リジェクトリスクチェック・送信ボタン */}
            <div className="border-t-2 border-gray-200 pt-12 space-y-6">
              <button
                type="button"
                onClick={handleRejectRiskCheck}
                disabled={!formData.appName || !formData.description || isCheckingRejectRisk}
                className="w-full text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                style={{backgroundColor: '#30acab'}}
                onMouseEnter={(e) => !(e.target as HTMLButtonElement).disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#00579c')}
                onMouseLeave={(e) => !(e.target as HTMLButtonElement).disabled && ((e.target as HTMLButtonElement).style.backgroundColor = '#30acab')}
              >
                {isCheckingRejectRisk ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>リジェクトリスク分析中...</span>
                  </div>
                ) : (
                  <>🔍 リジェクトリスクチェック</>
                )}
              </button>
              
              <button
                id="submit-button"
                type="submit"
                className="w-full text-white py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                style={{backgroundColor: '#00a9e0'}}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#155fad'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00a9e0'}
              >
📁 申請情報をダウンロード（CSV形式）
              </button>
              <div className="rounded-lg p-4 text-center" style={{backgroundColor: '#d1eaf8', borderColor: '#7fc5da', border: '1px solid'}}>
                <p className="text-sm leading-relaxed" style={{color: '#3d3939'}}>
                  💡 <strong>おすすめ：</strong>リジェクトリスクをチェックしてから申請情報をダウンロードすることをお勧めします。<br />
                  ダウンロード後、弊社担当者より確認のご連絡をいたします。
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* リジェクトリスク結果モーダル */}
      {showRejectRiskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" style={{backgroundColor: '#ffffff'}}>
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between" style={{borderColor: '#efefef'}}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#d1eaf8'}}>
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{color: '#3d3939'}}>リジェクトリスク分析レポート</h2>
                  <p className="text-sm" style={{color: '#aaabab'}}>リアルタイム分析結果</p>
                </div>
              </div>
              {isCheckingRejectRisk && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{borderColor: '#00a9e0'}}></div>
                  <span className="text-sm" style={{color: '#3d3939'}}>分析中...</span>
                </div>
              )}
              <button
                onClick={() => setShowRejectRiskModal(false)}
                className="p-2 rounded-full hover:bg-[#efefef] transition duration-200"
                style={{color: '#aaabab'}}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isCheckingRejectRisk && streamingContent ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 p-4 rounded-r-lg" style={{backgroundColor: '#d1eaf8', borderColor: '#00a9e0'}}>
                    <div className="flex items-center">
                      <div className="animate-pulse w-2 h-2 rounded-full mr-2" style={{backgroundColor: '#00a9e0'}}></div>
                      <p className="text-sm font-medium" style={{color: '#0f4490'}}>分析進行中 - AIが詳細なリスク評価を実行しています</p>
                    </div>
                  </div>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(streamingContent)
                    }}
                  />
                  <div className="flex items-center space-x-2 mt-4">
                    <div className="w-1 h-1 rounded-full animate-bounce" style={{backgroundColor: '#00a9e0'}}></div>
                    <div className="w-1 h-1 rounded-full animate-bounce" style={{backgroundColor: '#00a9e0', animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 rounded-full animate-bounce" style={{backgroundColor: '#00a9e0', animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : rejectRiskResult ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border-l-4 p-4 rounded-r-lg" style={{backgroundColor: '#d1eaf8', borderColor: '#30acab'}}>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" style={{color: '#30acab'}} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium" style={{color: '#0f4490'}}>分析完了 - 詳細なリスク評価が生成されました</p>
                    </div>
                  </div>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: parseMarkdown(rejectRiskResult)
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#00a9e0'}}></div>
                    <p className="text-lg font-medium" style={{color: '#3d3939'}}>分析を開始しています...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 border-t flex justify-between items-center" style={{borderColor: '#efefef', backgroundColor: '#fafafa'}}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: isCheckingRejectRisk ? '#00a9e0' : '#30acab'}}></div>
                <span className="text-sm" style={{color: '#aaabab'}}>
                  {isCheckingRejectRisk ? 'リアルタイム分析中' : '分析完了'}
                </span>
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => setShowRejectRiskModal(false)}
                  className="px-6 py-2 rounded-lg transition duration-200 border"
                  style={{color: '#3d3939', borderColor: '#aaabab'}}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#efefef'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
                >
                  閉じる
                </button>
                {!isCheckingRejectRisk && (
                  <button
                    onClick={() => {
                      setShowRejectRiskModal(false);
                      document.getElementById('submit-button')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2 rounded-lg text-white transition duration-200"
                    style={{backgroundColor: '#00a9e0'}}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#155fad'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00a9e0'}
                  >
                    申請情報をダウンロードへ進む
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}