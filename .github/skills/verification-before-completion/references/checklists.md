# 完了前検証チェックリスト

ドメイン別の検証コマンドと確認項目。「完了」と言う前に必ず実行する。

---

## Web / フロントエンド

```bash
# ビルドが通るか
npm run build

# テストが通るか
npm test

# TypeScript型エラーがないか
npx tsc --noEmit

# Lintエラーがないか
npm run lint

# 実際のブラウザで動作確認
# → webapp-testing スキルを使う
```

確認項目:
- [ ] ビルドエラーゼロ
- [ ] テスト全部グリーン
- [ ] コンソールエラーなし
- [ ] 主要ブラウザで表示確認（Chrome/Firefox）
- [ ] レスポンシブ対応確認

---

## Python / バックエンド

```bash
# テストが通るか
pytest -v

# 型チェック
mypy .

# Lintチェック
ruff check . または flake8 .

# 実際に動かして確認
python main.py
# または
curl http://localhost:8000/health
```

確認項目:
- [ ] テスト全部グリーン
- [ ] 型エラーなし
- [ ] インポートエラーなし
- [ ] 環境変数が設定されているか確認（.env）
- [ ] 本番と開発で設定が分離されているか

---

## API / エンドポイント

```bash
# ヘルスチェック
curl -s http://localhost:PORT/health | jq .

# 主要エンドポイントの動作確認
curl -X GET http://localhost:PORT/api/resource
curl -X POST http://localhost:PORT/api/resource \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# 認証が必要なエンドポイント
curl -H "Authorization: Bearer TOKEN" http://localhost:PORT/api/protected
```

確認項目:
- [ ] 200系レスポンスが返る
- [ ] エラーケース（400/401/404/500）が適切に返る
- [ ] レスポンスのJSONスキーマが仕様通り
- [ ] 認証・認可が正しく動いている

---

## データベース / マイグレーション

```bash
# マイグレーションが適用できるか（ドライラン）
python manage.py migrate --check  # Django
npx prisma migrate status         # Prisma

# マイグレーション適用
python manage.py migrate
npx prisma migrate dev

# データの整合性確認
SELECT COUNT(*) FROM affected_table;
```

確認項目:
- [ ] マイグレーション前後でデータ件数が正しい
- [ ] 外部キー制約が壊れていない
- [ ] インデックスが正しく作られている
- [ ] ロールバック手順を確認した

---

## ファイル生成（docx / pdf / xlsx / pptx）

```bash
# ファイルが実際に存在するか
ls -lh output.*

# ファイルが壊れていないか（ゼロバイトでないか）
[ -s output.docx ] && echo "OK" || echo "EMPTY FILE"

# バリデーション（docx）
python scripts/office/validate.py output.docx

# 変換テスト（LibreOfficeで開けるか）
python scripts/office/soffice.py --headless --convert-to pdf output.docx
```

確認項目:
- [ ] ファイルが存在し、ゼロバイトでない
- [ ] バリデーションエラーなし
- [ ] 実際にアプリケーションで開いて内容確認
- [ ] 文字化けなし（日本語が正しく表示されるか）

---

## Git / コミット前

```bash
# 変更内容の確認
git diff --stat
git diff

# ステージングの確認
git status

# 機密情報が含まれていないか
git diff --staged | grep -i "password\|secret\|token\|api_key"

# テスト実行
<言語別テストコマンド>
```

確認項目:
- [ ] 意図した変更のみがステージングされている
- [ ] 機密情報（APIキー・パスワード）が含まれていない
- [ ] .envファイルがコミットに含まれていない
- [ ] テストが全部グリーン
