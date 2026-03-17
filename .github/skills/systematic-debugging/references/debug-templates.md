# Language-Specific Debug Templates

言語・環境別のデバッグテンプレート。Phase 1（根本原因調査）で使用。

---

## Python

### エラーが発生したとき

```bash
# 1. スタックトレース全文を確認（省略されていたら）
python -m traceback script.py 2>&1 | head -100

# 2. 詳細なエラー情報
import traceback
traceback.print_exc()

# 3. 変数の状態確認
import pdb; pdb.set_trace()  # ブレークポイント（Python 3.7+は breakpoint()）
```

### よくあるエラーパターン

| エラー | 原因 | 確認コマンド |
|--------|------|------------|
| `ModuleNotFoundError` | パッケージ未インストール | `pip list \| grep <module>` |
| `ImportError` | バージョン不一致 | `pip show <package>` |
| `TypeError: NoneType` | None を演算 | `print(変数)` で None チェック |
| `KeyError` | 辞書のキーなし | `dict.get(key)` を使う |
| `FileNotFoundError` | パスが違う | `os.path.exists(path)` で確認 |
| `UnicodeDecodeError` | 文字コード不一致 | `open(f, encoding='utf-8-sig')` |

### 環境確認

```bash
python --version
pip list
which python
echo $PYTHONPATH
```

---

## JavaScript / TypeScript

### エラーが発生したとき

```bash
# 1. Node.jsのスタックトレース
node --stack-trace-limit=50 script.js

# 2. 型エラーの詳細
tsc --noEmit 2>&1

# 3. デバッガー接続
node --inspect script.js
# → Chrome: chrome://inspect
```

### よくあるエラーパターン

| エラー | 原因 | 対処 |
|--------|------|------|
| `Cannot read property 'x' of undefined` | null/undefined アクセス | Optional chaining `?.` を使う |
| `ENOENT: no such file` | ファイルパスが違う | `path.resolve()` で確認 |
| `EADDRINUSE` | ポート使用中 | `lsof -i :3000` でPIDを確認してkill |
| `SyntaxError: JSON` | JSON形式エラー | JSONLint で確認 |
| TypeScriptの型エラー | 型定義不一致 | `tsc --noEmit` で事前確認 |

### 環境確認

```bash
node --version
npm --version
cat package.json | grep '"version"'
ls node_modules/.bin/ | grep <tool>
```

---

## Go

### エラーが発生したとき

```bash
# 1. 詳細なビルドエラー
go build -v ./... 2>&1

# 2. テスト失敗の詳細
go test -v -run TestName ./...

# 3. レースコンディション確認
go test -race ./...
```

### よくあるエラーパターン

| エラー | 原因 | 対処 |
|--------|------|------|
| `undefined: Foo` | import不足 | `go get` で依存を追加 |
| `cannot use X as type Y` | 型不一致 | 明示的な型変換 |
| `nil pointer dereference` | nilのメソッド呼び出し | nilチェックを追加 |
| `deadlock` | goroutineが全ブロック | `go tool trace` で分析 |

### 環境確認

```bash
go version
go env
go mod tidy
```

---

## SQL / データベース

### クエリが遅い / 結果がおかしいとき

```sql
-- 1. 実行計画を確認
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- 2. インデックス確認
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users';

-- 3. テーブルの行数・サイズ確認
SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;

-- 4. スロークエリ確認（PostgreSQL）
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### よくあるエラーパターン

| エラー | 原因 | 対処 |
|--------|------|------|
| `duplicate key value` | ユニーク制約違反 | UPSERT（INSERT ON CONFLICT）を使う |
| `relation does not exist` | テーブル名・スキーマ違い | `\dt` で一覧確認 |
| `column does not exist` | カラム名誤り | `\d tablename` で確認 |
| 結果が0件 | JOIN条件が厳しすぎる | LEFT JOINで試す |
| N+1問題 | ループ内でクエリ | JOIN or サブクエリで一括取得 |

---

## Bash / Shell

### スクリプトがエラーになるとき

```bash
# 1. デバッグモード
bash -x script.sh 2>&1 | head -100

# 2. strict mode（エラーで即止まる）
set -euo pipefail

# 3. 変数の展開確認
echo "PATH=$PATH"
echo "変数=${変数:-デフォルト値}"

# 4. コマンドの存在確認
command -v docker || echo "docker not found"
```

### よくあるエラーパターン

| エラー | 原因 | 対処 |
|--------|------|------|
| `command not found` | PATHにない | `which コマンド` or `type コマンド` |
| `permission denied` | 実行権限なし | `chmod +x script.sh` |
| 変数が空 | 未設定 or タイポ | `echo ${変数}` で確認 |
| 改行コード問題 | CRLF vs LF | `dos2unix script.sh` |
| `[: unexpected operator` | `[[ ]]` ではなく `[ ]` | `[[ ]]` を使う |

---

## Docker / コンテナ

### コンテナが起動しない / 動作がおかしいとき

```bash
# 1. ログを確認
docker logs <container_id> --tail 100

# 2. コンテナに入って調査
docker exec -it <container_id> /bin/bash

# 3. 環境変数確認
docker inspect <container_id> | jq '.[0].Config.Env'

# 4. ネットワーク確認
docker network ls
docker inspect <network_name>

# 5. ディスク使用量
docker system df
```

### よくあるエラーパターン

| エラー | 原因 | 対処 |
|--------|------|------|
| `port already in use` | ホストのポート競合 | `lsof -i :PORT` で確認 |
| `no space left` | ディスク不足 | `docker system prune` |
| `image not found` | イメージ名・タグ誤り | `docker images` で確認 |
| ヘルスチェック失敗 | アプリ起動が遅い | `--health-start-period` を増やす |

---

## 共通チェックリスト（Phase 1完了条件）

Phase 1が完了したと言えるのは以下をすべて確認したとき:

- [ ] エラーメッセージの全文を読んだ（省略なし）
- [ ] スタックトレースの該当行を確認した
- [ ] 問題を最小構成で再現できた
- [ ] 環境変数・パス・バージョンを確認した
- [ ] 直前の変更内容を `git diff` または変更ログで確認した
- [ ] 同じ症状の既知の問題を検索した
