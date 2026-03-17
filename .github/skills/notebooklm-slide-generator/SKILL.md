---
name: notebooklm-slide-generator
description: ユーザーから提供された情報を元にスライドを設計し、NotebookLMでスライドを生成してリンクで納品する
---
# NotebookLMスライド生成スキル
ユーザーから提供された情報（テキスト、URL、Googleドライブファイル等）を元にスライド構成を設計し、NotebookLMのスライド生成機能で高品質なプレゼン資料を作成する。
## 全体フロー
① 情報の受領と整理
② スライド設計書の作成 → ユーザー承認
③ NotebookLMでスライド生成（1指示 = 1ノートブック）
④ NotebookLMのリンクで納品
## MCP連携
NotebookLM MCPサーバー（notebooklm）を使用してNotebookLMをAPIから操作する。
### 認証
1. 初回/認証切れ時: ターミナルで nlm login を実行
2. トークンリフレッシュ: mcp_notebooklm_refresh_auth を呼び出す
3. 認証確認: mcp_notebooklm_notebook_list で認証状態をテスト
認証エラー（Authentication expired）が出たらブラウザ操作にフォールバックすること。
### 主要MCP API
- mcp_notebooklm_notebook_create(title): ノートブック作成
- mcp_notebooklm_source_add(notebook_id, source_type, text/url/...): ソース追加
- mcp_notebooklm_studio_create(notebook_id, artifact_type="slide_deck", ...): スライド生成
- mcp_notebooklm_studio_status(notebook_id): 生成状況確認
- mcp_notebooklm_refresh_auth(): 認証リフレッシュ
### MCP APIによるスライド生成フロー
1. mcp_notebooklm_refresh_auth()
2. mcp_notebooklm_notebook_create(title="プレゼン名")
3. mcp_notebooklm_source_add(notebook_id, source_type="text", text="設計書+元データ+デザイン指示", title="スライドソース", wait=True)
4. mcp_notebooklm_studio_create(notebook_id, artifact_type="slide_deck", slide_format="detailed_deck", language="ja", focus_prompt="デザイン指示", confirm=True)
5. mcp_notebooklm_studio_status(notebook_id) で completed を確認
6. 納品: https://notebooklm.google.com/notebook/[notebook_id]
### ソース追加の種類
- テキスト: source_type="text", text="内容", title="タイトル"
- URL: source_type="url", url="https://..."
- 複数URL: source_type="url", urls=["url1", "url2"]
- Googleドライブ: source_type="drive", document_id="ID", doc_type="doc|slides|sheets|pdf"
- ローカルファイル: source_type="file", file_path="/path/to/file"
## ブラウザ操作（MCP認証エラー時のフォールバック）
1. https://notebooklm.google.com/ を開く
2. 「ノートブックを作成」→「ソースを追加」→「コピーしたテキスト」
3. JavaScriptで入力: textarea.value = 'テキスト'; textarea.dispatchEvent(new Event('input', { bubbles: true }));
4. 「挿入」→ Studioパネル「スライド資料」→ 生成
## ステップ1: 情報の受領と整理
- テキスト: ユーザーから直接提供
- URL: read_url_content で取得
- スプレッドシート: ブラウザでログインして読み取り
- Googleドライブ: MCP source_add またはブラウザ経由
## ステップ2: スライド設計
設計書を作成（構成・各スライドの内容・デザイン指示）し、ユーザー承認を得る。
## ステップ3: NotebookLMでスライド生成
重要原則: 1指示 = 1ノートブック（スライド1枚ごとに分けない）
MCP APIまたはブラウザで、ノートブック作成→ソース追加→スライド生成。
## ステップ4: リンクで納品
https://notebooklm.google.com/notebook/[notebook_id] をユーザーに共有。
## 注意事項
- 1指示1ノートブック: スライド1枚ごとに分けない
- 設計書の承認: 生成前にユーザー承認を必ず得る
- MCP認証エラー: 頻繁に切れる。ブラウザ操作にフォールバック
- PDFダウンロード不可: 自動化ブラウザではPDF保存不可。手動DLを案内
- 1日の生成上限: 再生成を繰り返すと上限に達する
