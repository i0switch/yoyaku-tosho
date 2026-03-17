# Ghost Memory コマンドリファレンス

全コマンドの完全一覧。ベースパス: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ`

---

## 基本コマンド一覧

### recall — 最近の記憶を呼び出す

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory recall
```

- 直近の記憶エントリを一覧表示する
- セッション開始時に毎回実行する（前回の文脈を引き継ぐため）

---

### search — キーワード検索

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory search "検索キーワード"
```

- 過去の記憶からキーワードに合致するものを検索
- 続き物の作業や過去知見が必要なときに使う

例:
```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory search "Stripe"
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory search "スキル設計"
```

---

### add — 記憶を保存する

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory add "内容" カテゴリ "出典"
```

**カテゴリ一覧:**

| カテゴリ | 用途 | 例 |
|---------|------|-----|
| `fact` | 安定した事実・仕様 | "APIのエンドポイントは /v2/users" |
| `episode` | 日付付きのイベント記録 | "2025-03-15 デプロイ完了" |
| `context` | 現在の文脈（短命） | "今週はXスレッド5本の制作中" |
| `preference` | 好み・設定 | "コードはTypeScriptを優先する" |
| `procedure` | 再利用可能な手順 | "Cloudflare更新手順: ..." |

例:
```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory add "StripeのWebhook署名キーはdashboard > Developersで確認" fact "Stripe Docs"
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory add "Xのインプレッション伸ばすには冒頭2行が命" preference "実測"
```

---

### stats — 統計情報の確認

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory stats
```

- 保存されている記憶の総数、カテゴリ別件数を表示

---

## 同期（セッション跨ぎ）

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-sync.ps1
```

- 手動で同期を実行する
- 定期同期は `Ghost Workspace Auto Extract` タスクで自動実行済み

---

## いつ何を保存するか — 判断基準

### 保存すべきもの
- 次のセッションでも使いそうな情報
- 手順・設定・API仕様など「調べ直すコストが高いもの」
- ユーザーの明示的な好み・ルール
- プロジェクトの文脈（何を作っているか、なぜか）

### 保存しないもの
- APIキー、パスワード、秘密情報
- 今回の会話限定の一時的な情報
- コードのパターンや慣習（コードを読めば分かるもの）
- gitログで確認できる変更履歴

---

## 使用フロー（推奨）

```
1. セッション開始 → memory recall で前回の文脈を確認
2. 作業中 → 継続性のある知見があったら memory add
3. 特定の過去情報が必要 → memory search
4. 作業完了前 → 再利用価値が高い内容だけ保存（過多は避ける）
```
