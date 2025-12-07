'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ClientApplication {
  id: string;
  timestamp: string;
  appName: string;
  companyName: string;
  accountEmail: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  platform: 'ios' | 'android' | 'both';
  submittedBy: string;
  iconPath?: string;
  assets?: string[];
  rejectRisk: number; // リジェクトリスク（%）
}

interface RejectHistory {
  id: string;
  timestamp: string;
  reason: string;
  reviewer: string;
  details: string;
}

interface RejectCase {
  id: string;
  appName: string;
  appId: string;
  packageName: string;
  platform: 'Google Play' | 'App Store';
  rejectDate: string;
  status: 'データセーフティ違反' | 'プライバシーポリシー違反' | 'ガイドライン違反' | 'メタデータ違反';
  severity: 'high' | 'medium' | 'low';
  primaryIssue: string;
  details: string;
  actionRequired: string[];
  deadline?: string;
  clientEmail: string;
  companyName: string;
}

const mockApplications: ClientApplication[] = [
  {
    id: 'APP-001',
    timestamp: '2024-10-16 10:30:00',
    appName: 'Easy Recipes',
    companyName: 'CHEFO.Co.,Ltd',
    accountEmail: 'support@fastmedia.jp',
    status: 'pending',
    platform: 'both',
    submittedBy: 'Manami Sonokawa',
    iconPath: '/images/application-agency/clients/easyrecipes/icon.png',
    assets: [
      '/images/application-agency/clients/easyrecipes/asset1.png',
      '/images/application-agency/clients/easyrecipes/asset2.png',
      '/images/application-agency/clients/easyrecipes/asset3.png',
      '/images/application-agency/clients/easyrecipes/asset4.png'
    ],
    rejectRisk: 15
  },
  {
    id: 'APP-002',
    timestamp: '2024-10-16 09:15:00',
    appName: 'Destiny',
    companyName: 'Future Games Inc.',
    accountEmail: 'dev@futuregames.com',
    status: 'in-progress',
    platform: 'both',
    submittedBy: 'Alex Thompson',
    iconPath: '/images/application-agency/clients/destiny/icon.png',
    assets: [
      '/images/application-agency/clients/destiny/asset1.png',
      '/images/application-agency/clients/destiny/asset2.png',
      '/images/application-agency/clients/destiny/asset3.png',
      '/images/application-agency/clients/destiny/asset4.png'
    ],
    rejectRisk: 35
  },
  {
    id: 'APP-003',
    timestamp: '2024-10-15 14:22:00',
    appName: 'Shopping Helper',
    companyName: 'Tech Solutions Inc.',
    accountEmail: 'dev@techsolutions.com',
    status: 'in-progress',
    platform: 'android',
    submittedBy: 'John Smith',
    rejectRisk: 22
  },
  {
    id: 'APP-004',
    timestamp: '2024-10-14 09:15:00',
    appName: 'Fitness Tracker',
    companyName: 'HealthTech Ltd.',
    accountEmail: 'contact@healthtech.com',
    status: 'completed',
    platform: 'ios',
    submittedBy: 'Sarah Johnson',
    rejectRisk: 5
  },
  {
    id: 'APP-005',
    timestamp: '2024-10-13 16:45:00',
    appName: 'News Reader',
    companyName: 'Media Corp.',
    accountEmail: 'info@mediacorp.com',
    status: 'rejected',
    platform: 'both',
    submittedBy: 'Mike Wilson',
    rejectRisk: 75
  }
];

const mockRejectHistory: RejectHistory[] = [
  {
    id: 'REJ-001',
    timestamp: '2024-10-14 11:30:00',
    reason: 'Guideline 4.3 - Design',
    reviewer: 'Apple Review Team',
    details: 'アプリのデザインがAppleのヒューマンインターフェースガイドラインに準拠していません。特にボタンの配置とフォントの使用について改善が必要です。'
  },
  {
    id: 'REJ-002',
    timestamp: '2024-10-12 15:20:00',
    reason: 'Metadata Rejected',
    reviewer: 'Google Play Team',
    details: 'アプリの説明文に不適切な表現が含まれています。また、スクリーンショットがアプリの実際の機能と一致していません。'
  },
  {
    id: 'REJ-003',
    timestamp: '2024-10-10 09:45:00',
    reason: 'Guideline 2.1 - Information Needed',
    reviewer: 'Apple Review Team',
    details: 'アプリの審査に必要な追加情報が不足しています。テストアカウントの情報と、特定機能の動作説明が必要です。'
  }
];

const mockRejectCases: RejectCase[] = [
  {
    id: 'REJ-CASE-001',
    appName: 'プロフーズ公式アプリ',
    appId: 'APP-006',
    packageName: 'li.yapp.app7799C191',
    platform: 'Google Play',
    rejectDate: '2024-10-03',
    status: 'データセーフティ違反',
    severity: 'high',
    primaryIssue: 'データ セーフティ フォームが無効',
    details: 'アプリのデータ セーフティ フォームで収集することが開示されていないユーザーデータ（位置情報 - 正確な位置情報）が、デバイスから転送されていることを検出しました。サードパーティのライブラリまたは SDK を通じて収集、処理されるデータも含まれます。',
    actionRequired: [
      'Google Play Console でフォームを更新し、位置情報の収集を申告',
      '該当するユーザーデータを収集する機能と帰属コードのうち不要なものをアプリから削除',
      'ポリシーを遵守していない APK があればすべて無効化',
      '新しいリリースを作成し、遵守している APK をアップロード'
    ],
    deadline: '2024-10-03',
    clientEmail: 'support@profoods.jp',
    companyName: 'PRO FOODS, KK'
  },
  {
    id: 'REJ-CASE-002',
    appName: 'Haneda Airport',
    appId: 'APP-007',
    packageName: 'li.yapp.appFB3BFC33',
    platform: 'Google Play',
    rejectDate: '2024-10-15',
    status: 'プライバシーポリシー違反',
    severity: 'high',
    primaryIssue: 'プライバシー ポリシーが無効',
    details: 'プライバシー ポリシーが必要なポリシー要件を満たしていません。どの国からもアクセスでき、アクセス制限のない一般公開の有効な URL（PDF は不可）で参照できる必要があります。また、編集やコメントの追加、ファイルの自動ダウンロードができないようにする必要があります。',
    actionRequired: [
      'プライバシー ポリシーを追加または更新',
      '有効な URL でアクセス可能であることを確認（PDF は不可）',
      '編集不可となっていることを確認',
      'アプリに適用されていることを確認',
      'ユーザーのプライバシーについて明確に規定',
      'Google Play Console でアプリのストアの掲載情報ページからリンク',
      'アプリ内からもリンク'
    ],
    clientEmail: 'dev@haneda-airport.jp',
    companyName: 'HANEDA / Tokyo International Airport'
  },
  {
    id: 'REJ-CASE-003',
    appName: 'Shopping Helper',
    appId: 'APP-003',
    packageName: 'com.techsolutions.shopping',
    platform: 'App Store',
    rejectDate: '2024-10-12',
    status: 'ガイドライン違反',
    severity: 'medium',
    primaryIssue: 'Guideline 4.3 - Design',
    details: 'アプリのデザインがAppleのヒューマンインターフェースガイドラインに準拠していません。特にボタンの配置とフォントの使用について改善が必要です。',
    actionRequired: [
      'Appleのヒューマンインターフェースガイドラインに準拠したデザインに修正',
      'ボタンの配置を適切に調整',
      'フォントの使用を改善',
      '修正版のアプリを再提出'
    ],
    clientEmail: 'dev@techsolutions.com',
    companyName: 'Tech Solutions Inc.'
  }
];

export default function AdminDashboard() {
  const [selectedApplication, setSelectedApplication] = useState<ClientApplication | null>(null);
  const [showRejectHistory, setShowRejectHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'revenue' | 'reject-response'>('dashboard');
  const [selectedRejectCase, setSelectedRejectCase] = useState<RejectCase | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);

  // 売上予測データ（モック）
  const revenueData = [
    { month: '1月', revenue: 45000, applications: 9 },
    { month: '2月', revenue: 67000, applications: 13 },
    { month: '3月', revenue: 89000, applications: 18 },
    { month: '4月', revenue: 52000, applications: 10 },
    { month: '5月', revenue: 78000, applications: 15 },
    { month: '6月', revenue: 95000, applications: 19 },
    { month: '7月', revenue: 112000, applications: 22 },
    { month: '8月', revenue: 98000, applications: 20 },
    { month: '9月', revenue: 134000, applications: 27 },
    { month: '10月', revenue: 156000, applications: 31 },
    { month: '11月', revenue: 189000, applications: 38 },
    { month: '12月', revenue: 223000, applications: 45 }
  ];

  const getApplicationStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'text-white',
      completed: 'text-white',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: '申請待ち',
      'in-progress': '審査中',
      completed: '完了',
      rejected: '却下'
    };

    const getStatusStyle = (status: string) => {
      if (status === 'in-progress') {
        return { backgroundColor: '#00a9e0', color: 'white' };
      } else if (status === 'completed') {
        return { backgroundColor: '#30acab', color: 'white' };
      }
      return {};
    };

    return (
      <span 
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}
        style={getStatusStyle(status)}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPlatformBadge = (platform: string) => {
    const styles = {
      ios: 'bg-[#efefef] text-[#3d3939]',
      android: 'text-white',
      both: 'text-white'
    };
    
    const labels = {
      ios: 'iOS',
      android: 'Android',
      both: 'iOS・Android'
    };

    const getPlatformStyle = (platform: string) => {
      if (platform === 'android') {
        return { backgroundColor: '#30acab', color: 'white' };
      } else if (platform === 'both') {
        return { backgroundColor: '#00a9e0', color: 'white' };
      }
      return {};
    };

    return (
      <span 
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[platform as keyof typeof styles]}`}
        style={getPlatformStyle(platform)}
      >
        {labels[platform as keyof typeof labels]}
      </span>
    );
  };


  const filteredApplications = statusFilter === 'all' 
    ? mockApplications 
    : mockApplications.filter(app => app.status === statusFilter);

  const generateClientEmail = async (rejectCase: RejectCase) => {
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `以下のアプリ申請リジェクト情報を基に、クライアント向けの丁寧で分かりやすいメール文面を作成してください。

アプリ名: ${rejectCase.appName}
会社名: ${rejectCase.companyName}
パッケージ名: ${rejectCase.packageName}
プラットフォーム: ${rejectCase.platform}
リジェクト理由: ${rejectCase.primaryIssue}
詳細: ${rejectCase.details}
必要な対応: ${rejectCase.actionRequired.join(', ')}
期限: ${rejectCase.deadline || 'なし'}

要件:
- 件名から本文まで完全なメール形式で作成
- 丁寧で分かりやすい日本語
- 専門用語は分かりやすく説明
- 具体的な対応手順を明記
- 期限がある場合は強調
- 署名部分も含める
- クライアントが安心できるような文面
- アプリ申請代行サービスからの連絡として自然な内容`
        }),
      });

      if (!response.ok) {
        throw new Error('AI生成に失敗しました');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI生成エラー:', error);
      // フォールバック用のテンプレート
      return `件名: 【重要】${rejectCase.appName} - ${rejectCase.platform}申請に関する対応のお願い

${rejectCase.companyName}　ご担当者様

いつもお世話になっております。
アプリ申請代行サービスです。

このたび、貴社のアプリ「${rejectCase.appName}」について、
${rejectCase.platform}より申請が却下されました。

【却下理由】
${rejectCase.primaryIssue}

【詳細内容】
${rejectCase.details}

【必要な対応事項】
${rejectCase.actionRequired.map((action, index) => `${index + 1}. ${action}`).join('\n')}

${rejectCase.deadline ? `【対応期限】\n${rejectCase.deadline}まで\n` : ''}

弊社にて再申請の準備を整えておりますので、
修正版をお送りいただけますでしょうか。

ご不明な点がございましたら、お気軽にお問い合わせください。

--
アプリ申請代行サービス
担当: 申請サポートチーム
メール: support@app-agency.jp
電話: 03-1234-5678`;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      high: { backgroundColor: '#e74c3c', color: 'white' },
      medium: { backgroundColor: '#00a9e0', color: 'white' },
      low: { backgroundColor: '#30acab', color: 'white' }
    };
    
    const labels = {
      high: '緊急',
      medium: '中',
      low: '低'
    };

    return (
      <span 
        className="px-2 py-1 text-xs font-medium rounded-full"
        style={styles[severity as keyof typeof styles]}
      >
        {labels[severity as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'データセーフティ違反': { backgroundColor: '#e74c3c', color: 'white' },
      'プライバシーポリシー違反': { backgroundColor: '#f39c12', color: 'white' },
      'ガイドライン違反': { backgroundColor: '#9b59b6', color: 'white' },
      'メタデータ違反': { backgroundColor: '#34495e', color: 'white' }
    };

    return (
      <span 
        className="px-2 py-1 text-xs font-medium rounded-full"
        style={styles[status as keyof typeof styles]}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#efefef]">
      {/* Header */}
      <header style={{backgroundColor: '#00a9e0'}} className="shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/application-agency/logo.png" 
                alt="アプリ申請代行" 
                className="h-12"
              />
              <h1 className="text-2xl font-bold text-white">管理画面</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    activeTab === 'dashboard' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  ダッシュボード
                </button>
                <button
                  onClick={() => setActiveTab('reject-response')}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    activeTab === 'reject-response' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  リジェクト対応
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    activeTab === 'revenue' 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:text-gray-200'
                  }`}
                >
                  売上管理
                </button>
              </div>
              <button
                onClick={() => setShowRejectHistory(!showRejectHistory)}
                className="text-white px-4 py-2 rounded-lg transition duration-200"
                style={{backgroundColor: '#30acab'}}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00579c'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#30acab'}
              >
                却下履歴を表示
              </button>
              <Link
                href="/application-agency/lp"
                className="text-white hover:text-gray-200"
              >
                サービスページ
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#3d3939] mb-2">総申請数</h3>
            <p className="text-3xl font-bold text-[#3d3939]">{mockApplications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#3d3939] mb-2">申請待ち</h3>
            <p className="text-3xl font-bold text-[#3d3939]">
              {mockApplications.filter(app => app.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#3d3939] mb-2">審査中</h3>
            <p className="text-3xl font-bold text-[#3d3939]">
              {mockApplications.filter(app => app.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-[#3d3939] mb-2">完了</h3>
            <p className="text-3xl font-bold text-[#3d3939]">
              {mockApplications.filter(app => app.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="statusFilter" className="text-sm font-medium text-[#3d3939]">
              ステータス絞り込み:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="pending">申請待ち</option>
              <option value="in-progress">審査中</option>
              <option value="completed">完了</option>
              <option value="rejected">却下</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#3d3939]">クライアント申請一覧</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#efefef]">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d3939]">アプリ名</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d3939]">会社名</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#3d3939]">ステータス</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#3d3939]">プラットフォーム</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#3d3939]">リジェクトリスク</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d3939]">申請日時</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="cursor-pointer hover:bg-[#efefef] transition duration-200"
                        style={selectedApplication?.id === app.id ? {
                          backgroundColor: '#f0f9ff'
                        } : {}}
                        onClick={() => setSelectedApplication(app)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {app.iconPath && (
                              <img
                                src={app.iconPath}
                                alt={`${app.appName} icon`}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-[#3d3939]">{app.appName}</div>
                              <div className="text-xs text-[#aaabab]">{app.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-[#3d3939]">{app.companyName}</div>
                          <div className="text-xs text-[#aaabab]">{app.submittedBy}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getApplicationStatusBadge(app.status)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getPlatformBadge(app.platform)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span 
                              className="text-lg font-bold"
                              style={{
                                color: app.rejectRisk <= 20 ? '#30acab' : 
                                       app.rejectRisk <= 50 ? '#00a9e0' : '#e74c3c'
                              }}
                            >
                              {app.rejectRisk}%
                            </span>
                            <span className="text-xs text-[#aaabab]">
                              {app.rejectRisk <= 20 ? '低リスク' : 
                               app.rejectRisk <= 50 ? '中リスク' : '高リスク'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-[#3d3939]">{app.timestamp}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Application Detail */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#3d3939]">申請詳細</h2>
              </div>
              <div className="p-6">
                {selectedApplication ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        {selectedApplication.iconPath && (
                          <img
                            src={selectedApplication.iconPath}
                            alt={`${selectedApplication.appName} icon`}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-[#3d3939]">
                            {selectedApplication.appName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getApplicationStatusBadge(selectedApplication.status)}
                            {getPlatformBadge(selectedApplication.platform)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[#3d3939]">申請ID</label>
                        <p className="text-sm text-[#3d3939]">{selectedApplication.id}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#3d3939]">会社名</label>
                        <p className="text-sm text-[#3d3939]">{selectedApplication.companyName}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#3d3939]">申請者メール</label>
                        <p className="text-sm text-[#3d3939]">{selectedApplication.accountEmail}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#3d3939]">申請者名</label>
                        <p className="text-sm text-[#3d3939]">{selectedApplication.submittedBy}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#3d3939]">申請日時</label>
                        <p className="text-sm text-[#3d3939]">{selectedApplication.timestamp}</p>
                      </div>
                    </div>

                    {selectedApplication.assets && selectedApplication.assets.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-semibold text-[#3d3939] mb-3">アプリアセット</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedApplication.assets.map((asset, index) => (
                            <img
                              key={index}
                              src={asset}
                              alt={`${selectedApplication.appName} asset ${index + 1}`}
                              className="w-full h-24 object-cover rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-md font-semibold text-[#3d3939] mb-3">リジェクトリスク分析</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#aaabab]">現在のリスクレベル:</span>
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-lg font-bold"
                              style={{
                                color: selectedApplication.rejectRisk <= 20 ? '#30acab' : 
                                       selectedApplication.rejectRisk <= 50 ? '#00a9e0' : '#e74c3c'
                              }}
                            >
                              {selectedApplication.rejectRisk}%
                            </span>
                            <span className="text-xs text-[#aaabab]">
                              {selectedApplication.rejectRisk <= 20 ? '低リスク' : 
                               selectedApplication.rejectRisk <= 50 ? '中リスク' : '高リスク'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-[#aaabab]">主要リスク要因:</div>
                          <div className="text-sm text-[#3d3939]">
                            {selectedApplication.rejectRisk <= 20 ? (
                              <ul className="space-y-1">
                                <li>• アプリガイドライン準拠度: 高</li>
                                <li>• メタデータ品質: 良好</li>
                                <li>• 過去の申請実績: 良好</li>
                              </ul>
                            ) : selectedApplication.rejectRisk <= 50 ? (
                              <ul className="space-y-1">
                                <li>• UI/UXガイドライン: 要確認</li>
                                <li>• アプリ説明文: 軽微な修正推奨</li>
                                <li>• スクリーンショット: 品質向上推奨</li>
                              </ul>
                            ) : (
                              <ul className="space-y-1">
                                <li>• ガイドライン違反の可能性: 高</li>
                                <li>• メタデータ不備: 修正必須</li>
                                <li>• 審査対策: 事前対応必要</li>
                              </ul>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 rounded-lg" style={{backgroundColor: '#efefef'}}>
                          <div className="text-sm text-[#3d3939]">
                            <strong>推奨アクション:</strong>
                          </div>
                          <div className="text-sm text-[#aaabab] mt-1">
                            {selectedApplication.rejectRisk <= 20 ? 
                              '現状のまま申請を進めることをお勧めします。' :
                              selectedApplication.rejectRisk <= 50 ?
                              '軽微な修正後の申請をお勧めします。' :
                              '詳細な審査対策を実施後の申請をお勧めします。'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#aaabab] text-center py-8">
                    申請を選択してください
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-8">
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-[#3d3939] mb-2">今年の総売上</h3>
                <p className="text-3xl font-bold" style={{color: '#30acab'}}>
                  ¥{revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-[#3d3939] mb-2">今月の売上</h3>
                <p className="text-3xl font-bold" style={{color: '#00a9e0'}}>
                  ¥{revenueData[9].revenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-[#3d3939] mb-2">平均案件単価</h3>
                <p className="text-3xl font-bold" style={{color: '#3d3939'}}>
                  ¥{Math.round(revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.reduce((sum, item) => sum + item.applications, 0)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#3d3939] mb-6">月別売上予測</h3>
              <div className="flex items-end justify-between h-64 space-x-2">
                {revenueData.map((item, index) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                  const height = (item.revenue / maxRevenue) * 200;
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                      <div className="text-xs text-[#aaabab] text-center">
                        ¥{(item.revenue / 1000).toFixed(0)}k
                      </div>
                      <div 
                        className="w-full rounded-t-md transition-all duration-300 hover:opacity-80"
                        style={{
                          height: `${height}px`,
                          backgroundColor: index < 10 ? '#00a9e0' : '#30acab'
                        }}
                        title={`${item.month}: ¥${item.revenue.toLocaleString()}`}
                      ></div>
                      <div className="text-xs text-[#3d3939] text-center font-medium">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: '#00a9e0'}}></div>
                  <span className="text-sm text-[#3d3939]">実績</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{backgroundColor: '#30acab'}}></div>
                  <span className="text-sm text-[#3d3939]">予測</span>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-[#3d3939] mb-6">詳細データ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-[#3d3939]">月</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#3d3939]">売上</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#3d3939]">申請数</th>
                      <th className="text-right py-3 px-4 font-semibold text-[#3d3939]">平均単価</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-[#efefef]">
                        <td className="py-3 px-4 text-[#3d3939]">{item.month}</td>
                        <td className="py-3 px-4 text-right font-medium" style={{color: '#00a9e0'}}>
                          ¥{item.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-[#3d3939]">{item.applications}</td>
                        <td className="py-3 px-4 text-right text-[#3d3939]">
                          ¥{Math.round(item.revenue / item.applications).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reject-response' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reject Cases List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#3d3939]">リジェクト案件一覧</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {mockRejectCases.map((rejectCase) => (
                      <div
                        key={rejectCase.id}
                        className={`p-6 cursor-pointer hover:bg-[#efefef] transition duration-200 ${
                          selectedRejectCase?.id === rejectCase.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedRejectCase(rejectCase)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-[#3d3939]">{rejectCase.appName}</h3>
                              {getSeverityBadge(rejectCase.severity)}
                              {getStatusBadge(rejectCase.status)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-4 text-sm text-[#aaabab]">
                                <span>プラットフォーム: {rejectCase.platform}</span>
                                <span>却下日: {rejectCase.rejectDate}</span>
                              </div>
                              <div className="text-sm text-[#3d3939]">
                                <strong>問題:</strong> {rejectCase.primaryIssue}
                              </div>
                              <div className="text-sm text-[#aaabab]">
                                会社: {rejectCase.companyName}
                              </div>
                              {rejectCase.deadline && (
                                <div className="text-sm text-red-600">
                                  <strong>期限:</strong> {rejectCase.deadline}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reject Case Detail */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#3d3939]">案件詳細</h2>
                  </div>
                  <div className="p-6">
                    {selectedRejectCase ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-[#3d3939] mb-2">
                            {selectedRejectCase.appName}
                          </h3>
                          <div className="flex items-center space-x-2 mb-4">
                            {getSeverityBadge(selectedRejectCase.severity)}
                            {getStatusBadge(selectedRejectCase.status)}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-[#3d3939]">パッケージ名</label>
                            <p className="text-sm text-[#aaabab]">{selectedRejectCase.packageName}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#3d3939]">プラットフォーム</label>
                            <p className="text-sm text-[#aaabab]">{selectedRejectCase.platform}</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-[#3d3939]">却下日</label>
                            <p className="text-sm text-[#aaabab]">{selectedRejectCase.rejectDate}</p>
                          </div>

                          {selectedRejectCase.deadline && (
                            <div>
                              <label className="block text-sm font-medium text-[#3d3939]">対応期限</label>
                              <p className="text-sm text-red-600">{selectedRejectCase.deadline}</p>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-md font-semibold text-[#3d3939] mb-3">問題詳細</h4>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-sm font-medium text-[#3d3939]">主要問題</label>
                              <p className="text-sm text-[#aaabab]">{selectedRejectCase.primaryIssue}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#3d3939]">詳細説明</label>
                              <p className="text-sm text-[#aaabab]">{selectedRejectCase.details}</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-md font-semibold text-[#3d3939] mb-3">必要な対応</h4>
                          <ul className="space-y-1">
                            {selectedRejectCase.actionRequired.map((action, index) => (
                              <li key={index} className="text-sm text-[#aaabab]">
                                {index + 1}. {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-md font-semibold text-[#3d3939] mb-3">クライアント対応</h4>
                          <button
                            onClick={async () => {
                              setIsGeneratingEmail(true);
                              try {
                                const email = await generateClientEmail(selectedRejectCase);
                                setGeneratedEmail(email);
                              } catch (error) {
                                console.error('メール生成エラー:', error);
                                alert('メール生成に失敗しました。再度お試しください。');
                              } finally {
                                setIsGeneratingEmail(false);
                              }
                            }}
                            disabled={isGeneratingEmail}
                            className="w-full text-white px-4 py-2 rounded-lg transition duration-200 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{backgroundColor: isGeneratingEmail ? '#aaabab' : '#00a9e0'}}
                            onMouseEnter={(e) => {
                              if (!isGeneratingEmail) {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#0d7cae';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isGeneratingEmail) {
                                (e.target as HTMLButtonElement).style.backgroundColor = '#00a9e0';
                              }
                            }}
                          >
                            {isGeneratingEmail ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>AI生成中...</span>
                              </div>
                            ) : (
                              'AI でクライアント向けメール生成'
                            )}
                          </button>
                          
                          {generatedEmail && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-[#3d3939] mb-2">
                                生成されたメール（クライアント宛）
                              </label>
                              <textarea
                                value={generatedEmail}
                                onChange={(e) => setGeneratedEmail(e.target.value)}
                                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                readOnly={false}
                              />
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedEmail);
                                    alert('メール内容をクリップボードにコピーしました');
                                  }}
                                  className="flex-1 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
                                  style={{backgroundColor: '#30acab'}}
                                >
                                  クリップボードにコピー
                                </button>
                                <button
                                  onClick={() => {
                                    const subject = encodeURIComponent(`【重要】${selectedRejectCase.appName} - ${selectedRejectCase.platform}申請に関する対応のお願い`);
                                    const body = encodeURIComponent(generatedEmail);
                                    window.open(`mailto:${selectedRejectCase.clientEmail}?subject=${subject}&body=${body}`);
                                  }}
                                  className="flex-1 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
                                  style={{backgroundColor: '#3d3939'}}
                                >
                                  メーラーで開く
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[#aaabab] text-center py-8">
                        案件を選択してください
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject History Modal */}
        {showRejectHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#3d3939]">却下履歴</h2>
                <button
                  onClick={() => setShowRejectHistory(false)}
                  className="text-gray-400 hover:text-[#aaabab]"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {mockRejectHistory.map((reject) => (
                    <div key={reject.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-red-800">{reject.reason}</h3>
                        <span className="text-sm text-red-600">{reject.timestamp}</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2">審査者: {reject.reviewer}</p>
                      <p className="text-sm text-[#3d3939]">{reject.details}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-[#efefef]">
                <button
                  onClick={() => setShowRejectHistory(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}