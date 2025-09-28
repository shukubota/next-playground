## 概要
ユーザーがブラウザ画面からテキストを入力し、AIエージェントがそのテキストに基づいて応答を生成するプロトタイプアプリケーションです。
ただし、ClaudeやGemini等のインターフェイスは使わないで、応答に対して独自のvalidationを行い表示する。

## セットアップ

### 環境変数の設定
`.envrc` ファイルに必要な環境変数が定義されています。direnvを使用する場合:

```bash
# direnvを有効化
direnv allow

# または手動で環境変数を読み込み
source .envrc
```

### Google Cloud認証
Vertex AI経由でClaudeを使用するため、Google Cloud認証が必要です:

```bash
# 方法1: Application Default Credentials (推奨)
gcloud auth application-default login

# 方法2: サービスアカウントキー
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### 開発サーバー起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3006/ai-agent-prototype` でアクセス可能です。

## 仕様

### AIエージェント
**Claude Sonnet 4** をGoogle Cloud Vertex AI経由で使用。

設定値:
- **プロジェクトID**: `tmp-rnd-ai`
- **リージョン**: `us-east5`
- **モデル**: `claude-sonnet-4@20250514`
- **フォールバックモデル**: `claude-3-5-haiku@20241022`

.claude/setting.local.jsonの中身は
```json
{
  "model": "claude-sonnet-4@20250514",
  "env": {
    "CLAUDE_CODE_USE_VERTEX": "true",
    "CLOUD_ML_REGION": "us-east5",
    "ANTHROPIC_VERTEX_PROJECT_ID": "projectID",
    "ANTHROPIC_MODEL": "claude-sonnet-4@20250514",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-5-haiku@20241022"
  },
  "permissions": {
    "allow": [],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(rm -rf ~/*)",
      "Bash(rm -rf /*)",
      "Bash(sudo rm:*)"
    ]
  }
}
```

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS (Spotify風デザイン)
- **状態管理**: useSWR
- **AI API**: Google Cloud Vertex AI + Anthropic Claude
- **バリデーション**: 独自レスポンス検証システム

### アーキテクチャ

#### View層 (`/components/ai-agent-prototype/`)
- シンプルなReactコンポーネント
- Spotify風デザインシステム
- Tailwind CSSによる実装
- レスポンシブ対応

#### Hooks層 (`/hooks/`)
- `useAIAgent.ts`: useSWR mutationでAPI通信
- メッセージ履歴管理
- エラーハンドリング
- ローディング状態管理

#### API層 (`/app/api/ai-agent/`)
- Google Cloud AI Platform client使用
- Vertex AI経由でClaude呼び出し
- レスポンスバリデーション
- エラーフォールバック

### 独自バリデーション機能
- **文字数制限**: 10-5000文字
- **コンテンツフィルタリング**: 不適切コンテンツ検出
- **レスポンス時間測定**: パフォーマンス監視
- **エラーハンドリング**: 詳細なエラー情報表示

### 主要機能
- リアルタイムAI応答生成
- メッセージ履歴表示
- バリデーション結果表示
- エラー時フォールバック
- レスポンス時間とモデル情報表示
- Spotify風ダークテーマUI