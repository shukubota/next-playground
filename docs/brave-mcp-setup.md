# Brave Search MCP セットアップガイド

AI News Aggregator で Brave Search MCP を使用するためのセットアップ方法

## 前提条件

1. **Brave Search API Key** の取得
   - [Brave Search API](https://brave.com/search/api/) にアクセス
   - アカウント登録してAPI Keyを取得

2. **direnv** のインストール
   ```bash
   # macOS
   brew install direnv

   # Ubuntu/Debian
   sudo apt install direnv
   ```

3. **MCP Server** のインストール
   ```bash
   npm install -g @modelcontextprotocol/server-brave-search
   ```

## セットアップ手順

### 1. 環境変数の設定

`.envrc` ファイルを編集し、Brave API Keyを設定：

```bash
# .envrc
export BRAVE_API_KEY="your-actual-brave-api-key-here"
export MCP_SERVER_URL="brave-search"
export NODE_ENV="development"
export NEXT_PUBLIC_APP_NAME="AI News Aggregator"
```

### 2. direnv の有効化

```bash
# プロジェクトディレクトリで実行
direnv allow
```

### 3. 動作確認

開発サーバーを起動：

```bash
npm run dev
```

ブラウザで `http://localhost:3006/dev-news` にアクセスし、
「今日のAIニュースを収集」ボタンをクリック。

## トラブルシューティング

### API Key未設定の場合

環境変数 `BRAVE_API_KEY` が設定されていない場合、フォールバックメッセージが表示されます：

```
API Key設定が必要です
Brave Search APIを使用するにはAPI Keyの設定が必要です。
```

### レート制限エラーの場合

検索を連続実行するとレート制限に達する場合があります：

```
検索制限に達しました - 少し時間をおいて再試行してください
Brave Search APIのレート制限に達しました。1分ほど待ってから再度お試しください。
```

**対処法:**
- 1-2分待ってから再試行
- 連続してボタンを押さない
- API使用量を Brave Search Dashboard で確認

### MCP接続エラーの場合

MCP サーバーへの接続に失敗した場合：

1. **MCP Server の存在確認**
   ```bash
   npx @modelcontextprotocol/server-brave-search --help
   ```

2. **API Key の確認**
   ```bash
   echo $BRAVE_API_KEY
   ```

3. **ログの確認**
   - ブラウザの開発者ツールでConsoleログを確認
   - サーバーコンソールでエラーメッセージを確認

4. **レート制限の回避**
   - アプリは自動的に2秒間隔で順次検索実行
   - 並列実行を避けてAPI負荷を軽減

## 実装詳細

### アーキテクチャ

```
Next.js API Route → MCP Client → Brave Search MCP Server → Brave Search API
```

### 主要ファイル

- `lib/mcp-client.ts` - MCP Client実装
- `lib/news-processor.ts` - 検索結果処理ロジック
- `app/api/dev-news/collect/route.ts` - APIエンドポイント
- `.envrc` - 環境変数設定

### 検索クエリ

以下の7つのクエリを並列実行：

1. "AI news today"
2. "machine learning updates"
3. "ChatGPT OpenAI news"
4. "Claude Anthropic news"
5. "Gemini Google AI"
6. "AI breakthrough today"
7. "artificial intelligence latest"

### 重要度判定

検索結果は以下の基準で重要度を自動判定：

- **高**: GPT-5、Claude、Gemini、breakthrough、OpenAI等のキーワード
- **中**: updates、improvement、Microsoft、Meta、NVIDIA等のキーワード
- **低**: その他

## カスタマイズ

### 検索クエリの変更

`lib/news-processor.ts` の `AI_NEWS_QUERIES` を編集：

```typescript
export const AI_NEWS_QUERIES = [
  'your custom query 1',
  'your custom query 2',
  // ...
] as const;
```

### 重要度判定の調整

`lib/news-processor.ts` の keyword配列を編集：

```typescript
const HIGH_IMPORTANCE_KEYWORDS = [
  'custom-high-keyword',
  // ...
];
```

## 本番環境

本番環境では以下の環境変数を設定：

```bash
BRAVE_API_KEY=your-production-api-key
NODE_ENV=production
```

Vercel等のデプロイメントプラットフォームの環境変数設定画面で設定してください。