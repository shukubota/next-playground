## 仕様
```bash
node index.js
```
で実行できるscriptである。

prompt.txtの内容をClaudeに送り、返答を得る。

結果を標準出力する。

### 環境変数
```bash
export CLAUDE_CODE_USE_VERTEX
export CLOUD_ML_REGION
export ANTHROPIC_VERTEX_PROJECT_ID
export ANTHROPIC_MODEL
export ANTHROPIC_SMALL_FAST_MODEL
```
に設定したモデルをvertexAIで利用する。

## 参考情報
../app/ai-agent-prototypeにclaudeにアクセスするコードがある。
ただし、これは参考にするだけで依存してはいけない。

## ライブラリ
scripts/claude-chat/package.json
に定義し、必要なライブラリをinstallする。
