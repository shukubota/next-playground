# AI News Aggregation App - Phase1 仕様書

## 概要
AI関連ニュースに特化した自動ニュース収集アプリケーション。BraveのMCPクライアントを使用して朝の情報収集を自動化。

## 仕様

### page
```
/dev-news
```
のpathにpageを作成する。

## Phase1 最小機能

### 1. 自動AI関連ニュース収集
- **対象カテゴリ**: AI/MLのみ
- **自動収集クエリ**:
  - "AI news today"
  - "machine learning updates"
  - "ChatGPT OpenAI news"
  - "Claude Anthropic news"
  - "Gemini Google AI"
  - "AI breakthrough today"
  - "artificial intelligence latest"

### 2. MCP統合 (Brave検索による自動収集)
- **Brave Search MCP**
  - 複数クエリの並列実行
  - AIニュース記事の自動検索・取得
  - 結果の統合とサマリ生成
  - 約5分での完了を目標

### 3. 基本UI（ワンクリック操作）
- **メインページ** (`/app/dev-news/page.tsx`)
  - 「今日のAIニュースを収集」ボタン
  - 収集進行状況の表示
  - 収集結果サマリ一覧表示
  - 記事タイトル、URL、要約、重要度表示

## 技術アーキテクチャ (Phase1)

### フロントエンド
- **App Router構造**
  - `/app/dev-news/page.tsx` - メインページ

- **コンポーネント**
  - `CollectionButton` - ニュース収集開始ボタン
  - `ProgressIndicator` - 収集進行状況表示
  - `NewsSummaryList` - 収集結果サマリ表示
  - `NewsItem` - 個別ニュース記事表示

### バックエンド
- **APIルート**
  - `/api/dev-news/collect` - 自動ニュース収集エンドポイント
  - `/api/dev-news/status` - 収集進行状況確認エンドポイント

### MCP統合
- **Brave Search MCP**による並列収集
- 複数クエリの同時実行
- 結果の統合とフィルタリング
- 今後: Playwright MCPなど追加予定

## 実装タスク

### 1. ページ再設計
- `/app/dev-news/page.tsx` の自動収集UI実装
- ワンクリック操作とプログレス表示

### 2. MCP統合強化
- Brave Search MCP並列実行設定
- 自動収集API実装
- 進行状況管理機能

## 技術スタック (最小構成)
- **フロントエンド**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **MCP**: Brave Search MCP
- **API**: Next.js API Routes

