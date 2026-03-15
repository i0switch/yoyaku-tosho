# ARCHITECTURE

## 全体構成
CLIアプリとして実装する。

入力:
- posts.md
- auth state
- CLI 引数
- config file

出力:
- 実行ログ
- スクリーンショット
- 処理サマリー

## モジュール構成

### 1. cli
責務:
- CLI引数の解釈
- 実行開始
- 実行結果表示

想定ファイル:
- src/cli/index.ts

### 2. config
責務:
- デフォルト設定読み込み
- 環境変数読み込み
- config マージ

想定ファイル:
- src/config/defaultConfig.ts
- src/config/loadConfig.ts

### 3. domain
責務:
- Post
- ScheduleSlot
- RunResult
- AppConfig
などの型定義

想定ファイル:
- src/domain/types.ts

### 4. data
責務:
- CSV/JSON の読み込み
- 入力バリデーション
- 正規化

想定ファイル:
- src/services/loadPosts.ts
- src/services/validatePosts.ts

### 5. scheduler
責務:
- 投稿数に応じて予約枠を生成
- 日時上書きがある投稿を優先
- 過去時刻をスキップ

想定ファイル:
- src/services/generateSchedule.ts

### 6. playwright/xClient
責務:
- ブラウザ起動
- auth state 読み込み
- 投稿画面遷移
- 本文入力
- 画像添付
- 予約ダイアログ入力
- 予約保存

想定ファイル:
- src/playwright/browser.ts
- src/playwright/xSelectors.ts
- src/playwright/xScheduler.ts

### 7. logging
責務:
- JSONログ
- human readable ログ
- screenshot 保存
- summary 生成

想定ファイル:
- src/utils/logger.ts

## データフロー
1. CLI が起動
2. 設定ファイルと引数を読み込む
3. 投稿データをロード
4. バリデーション
5. スケジュール生成
6. dry-run の場合はここで終了
7. Playwright で X を開く
8. 各投稿を順に予約保存
9. 結果を記録
10. サマリーを表示

## エラー戦略
- 入力不備: 実行前に fail fast
- X画面要素未取得: スクリーンショット後停止
- 認証要求: 停止
- 画像ファイルなし: その投稿のみ失敗またはスキップ
- 予約保存ボタン押下失敗: リトライは最大1回まで

## 設計原則
- セレクタを散らさない
- UI依存箇所を1モジュールに閉じ込める
- ドメインロジックとブラウザ操作を分離する
- dry-run でも本番と同じスケジュール計算を使う