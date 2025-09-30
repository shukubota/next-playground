# Claude Chat with Tools

このディレクトリには、Claudeが自分でツールを選択して使用できる2つの実装方式があります。

## 実装方式

### 1. **Tools API方式** (推奨)
- **ファイル**: `index-with-tools.js`
- **方式**: Vertex AI Claude APIのTools機能を使用
- **特徴**: Claudeが必要に応じてConfluence検索ツールを自動選択

### 2. **MCP Server方式**
- **ファイル**: `mcp-server.js`
- **方式**: Model Context Protocol Serverとして実装
- **特徴**: 外部MCPクライアントから利用可能

## 使用方法

### Tools API方式での実行
```bash
# 環境変数設定
export ANTHROPIC_VERTEX_PROJECT_ID="your-project-id"
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_MODEL="claude-sonnet-4@20250514"

# Atlassian設定
export ATLASSIAN_API_TOKEN="your_api_token"
export ATLASSIAN_EMAIL="your@email.com"
export ATLASSIAN_DOMAIN="fastmedia"

# 実行
node index-with-tools.js
```

### MCP Server方式での実行
```bash
# MCPサーバーとして起動
npm run mcp-server

# 別のターミナルでMCPクライアントから利用
```

## 動作の違い

### 旧実装 (`index.js`)
```
ユーザー入力 → キーワード判定 → Confluence検索 → Claude呼び出し
```

### 新実装 (`index-with-tools.js`)
```
ユーザー入力 → Claude判断 → (必要に応じて)Confluence検索ツール使用 → 回答
```

## Claudeが使用可能なツール

### `search_confluence`
- **説明**: Atlassian Confluenceでコンテンツを検索
- **パラメータ**:
  - `query` (required): 検索クエリ
  - `limit` (optional): 結果の最大数 (デフォルト: 3)
- **使用例**: 「claude関連のドキュメントを探して」→ Claudeが自動的にこのツールを使用

## 利点

1. **インテリジェントな判断**: Claudeが文脈に応じてツール使用を決定
2. **自然な対話**: キーワードに依存しない柔軟な検索
3. **ツールチェーン**: 複数のツールを組み合わせた複雑なタスクに対応
4. **エラーハンドリング**: ツール実行エラーも含めてClaudeが適切に処理