# Pinchtab コマンドリファレンス

ベースパス: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ`

---

## 起動・停止

```powershell
# Pinchtabサービスを起動
powershell -ExecutionPolicy Bypass -File .\pinchtab-start.ps1

# Pinchtabサービスを停止
powershell -ExecutionPolicy Bypass -File .\pinchtab-stop.ps1
```

---

## 基本操作（pinchtab-cli.cmd）

```cmd
# ページを開く
.\pinchtab-cli.cmd open https://example.com

# スナップショット取得（インタラクティブ要素一覧）
.\pinchtab-cli.cmd snapshot -i

# スクリーンショット
.\pinchtab-cli.cmd screenshot

# クリック
.\pinchtab-cli.cmd click @e1

# テキスト入力
.\pinchtab-cli.cmd fill @e2 "入力テキスト"

# 現在のURLを取得
.\pinchtab-cli.cmd get url
```

---

## agent-browser vs pinchtab の使い分け

| 状況 | 使うツール |
|------|-----------|
| VSCode・Codex・Antigravity で共有したいブラウザセッション | **pinchtab** |
| 単発の1回限りの操作 | **agent-browser** (`.\agent-browser-cli.cmd`) |
| Googleアカウントにログイン済みで操作したい | **pinchtab** または **logged-in-google-chrome-skill** |
| MCP経由でブラウザアクセスしたい | **pinchtab** |

---

## よくある使用フロー

```powershell
# 1. サービス起動
powershell -ExecutionPolicy Bypass -File .\pinchtab-start.ps1

# 2. ページを開く
.\pinchtab-cli.cmd open https://target-site.com

# 3. 要素を特定
.\pinchtab-cli.cmd snapshot -i
# → @e1, @e2 等の参照が返る

# 4. 操作
.\pinchtab-cli.cmd fill @e1 "username"
.\pinchtab-cli.cmd fill @e2 "password"
.\pinchtab-cli.cmd click @e3

# 5. 結果確認
.\pinchtab-cli.cmd screenshot
```
