<#
.SYNOPSIS
    AI駆動OSワークスペースを自動構築するスクリプト

.DESCRIPTION
    ai-workspace-organizer スキルの Phase 2〜3 を自動実行します。
    ホームディレクトリ配下に AI First なフォルダ構造を作成し、
    各フォルダに CLAUDE.md（文脈ファイル）を配置します。

.PARAMETER RootPath
    作成するワークスペースのルートパス。デフォルト: $HOME

.PARAMETER DryRun
    -DryRun を指定すると、実際には作成せずに何が作られるかだけ表示します。

.EXAMPLE
    # 実行（デフォルトは $HOME 直下）
    powershell -ExecutionPolicy Bypass -File .\setup-workspace.ps1

    # ドライラン（実際には作成しない）
    powershell -ExecutionPolicy Bypass -File .\setup-workspace.ps1 -DryRun

    # 別のパスに作成
    powershell -ExecutionPolicy Bypass -File .\setup-workspace.ps1 -RootPath "C:\Users\me\workspace"
#>

param(
    [string]$RootPath = $HOME,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ============================================================
# フォルダ構造定義
# ============================================================

$Folders = @(
    "work",      # 事業ドキュメント・クライアント案件
    "dev",       # 開発プロジェクト・コードリポジトリ
    "content",   # SNS・メディア制作物
    "agents",    # AIエージェント本体・スキル
    "archive",   # 退避・長期保管データ
    "tmp"        # 一時ファイル（定期削除対象）
)

# 各フォルダの CLAUDE.md テンプレート
$ClaudeMdTemplates = @{
    "work" = @"
# work/

## このフォルダの役割
事業ドキュメント・クライアント案件・契約書・請求書を管理する。

## 構造ルール
- クライアント別に `client-{名前}/` フォルダを作成する
- `client-{名前}/` 内は `docs/`, `contracts/`, `deliverables/` で整理する
- ファイル名は `YYYY-MM-DD_説明.拡張子` 形式を使う

## AIへの指示
- このフォルダ内のファイルは機密情報を含む可能性がある
- 削除・移動の前に必ずユーザーに確認する
- 契約書・請求書は絶対に編集しない（コピーを作ってから編集）
"@

    "dev" = @"
# dev/

## このフォルダの役割
開発プロジェクト・コードリポジトリを管理する。

## 構造ルール
- プロジェクト別に `{プロジェクト名}/` フォルダを作成する
- 各プロジェクトには `README.md` と `.gitignore` を置く
- ビルド成果物（`dist/`, `build/`, `node_modules/`）はコミットしない

## AIへの指示
- コードを変更する前に現在のブランチを確認する
- `main`/`master` への直接プッシュは禁止。PRを使う
- 実行前に `.env` ファイルの存在を確認する（秘密情報のリーク防止）
"@

    "content" = @"
# content/

## このフォルダの役割
SNS投稿・記事・画像・動画など、メディア制作物を管理する。

## 構造ルール
- プラットフォーム別: `x/`, `youtube/`, `instagram/` 等
- 年月別: `2025-03/` 形式でサブフォルダを作る
- 画像は `assets/` にまとめる

## AIへの指示
- 投稿前のコンテンツと投稿済みコンテンツを `drafts/` と `published/` で分ける
- 画像ファイルは直接編集せず、コピーを作ってから加工する
"@

    "agents" = @"
# agents/

## このフォルダの役割
AIエージェント本体・スキル・プロンプト・設定ファイルを管理する。

## 構造ルール
- エージェント別に `{エージェント名}/` フォルダを作成する
- 各エージェントに `SKILL.md` または `AGENTS.md` を置く
- 設定ファイル（APIキー等）は `.env` に書いて `.gitignore` に追加する

## AIへの指示
- スキルを変更したら CHANGELOG.md を更新する
- APIキー・シークレットは絶対にファイルに平文で書かない
- スキルの削除前には `archive/` にバックアップする
"@

    "archive" = @"
# archive/

## このフォルダの役割
使用頻度が低くなったファイルの長期保管場所。削除はしない。

## 構造ルール
- `YYYY-MM/` 形式でサブフォルダを作り、退避した日付で管理する
- 元のフォルダ構造を維持する（`archive/2025-03/work/old-project/`）

## AIへの指示
- archive 内のファイルは原則として読み取り専用として扱う
- ここへの移動はユーザーが明示的に指示した場合のみ実行する
"@

    "tmp" = @"
# tmp/

## このフォルダの役割
作業中の一時ファイル。定期的に削除される前提で使う。

## 構造ルール
- 30日以上更新されていないファイルは定期的に削除する
- 重要なものは適切なフォルダに移動してから削除する

## AIへの指示
- tmp 内のファイルは重要でない可能性が高い
- 削除前に一度ファイル名と更新日を確認する
"@
}

# ============================================================
# ユーティリティ関数
# ============================================================

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "  ▶ $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Skip {
    param([string]$Message)
    Write-Host "  - $Message (既存・スキップ)" -ForegroundColor DarkGray
}

# ============================================================
# メイン処理
# ============================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  AI Workspace Organizer - Setup Script   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "  [DRY RUN MODE] 実際には何も作成しません" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "  ルートパス: $RootPath" -ForegroundColor White
Write-Host ""

# Phase 2: ベース構造の構築
Write-Host "Phase 2: フォルダ構造の構築" -ForegroundColor Cyan
Write-Host "─────────────────────────────" -ForegroundColor DarkGray

foreach ($folder in $Folders) {
    $folderPath = Join-Path $RootPath $folder

    if (Test-Path $folderPath) {
        Write-Skip $folder
    } else {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        }
        Write-Success "作成: $folder/"
    }
}

Write-Host ""

# Phase 3: 文脈ファイルの設定
Write-Host "Phase 3: CLAUDE.md（文脈ファイル）の配置" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray

foreach ($folder in $Folders) {
    $claudeMdPath = Join-Path $RootPath $folder "CLAUDE.md"
    $template = $ClaudeMdTemplates[$folder]

    if ($null -eq $template) { continue }

    if (Test-Path $claudeMdPath) {
        Write-Skip "$folder/CLAUDE.md"
    } else {
        if (-not $DryRun) {
            Set-Content -Path $claudeMdPath -Value $template -Encoding UTF8
        }
        Write-Success "作成: $folder/CLAUDE.md"
    }
}

# ルートの CLAUDE.md
$rootClaudeMd = Join-Path $RootPath "CLAUDE.md"
$rootTemplate = @"
# ワークスペースルート

## フォルダ構造

| フォルダ | 用途 |
|---------|------|
| work/   | 事業ドキュメント・クライアント案件 |
| dev/    | 開発プロジェクト・コードリポジトリ |
| content/ | SNS・メディア制作物 |
| agents/ | AIエージェント本体・スキル |
| archive/ | 退避・長期保管データ |
| tmp/    | 一時ファイル（30日で削除） |

## AIへの基本ルール
1. ファイルを削除する前に必ずユーザーに確認する
2. 秘密情報（APIキー・パスワード）は平文で保存しない
3. 大きな変更（フォルダ移動・リネーム）は事前にユーザーへ計画を共有する
4. 不明なファイルがあっても勝手に削除しない
"@

if (Test-Path $rootClaudeMd) {
    Write-Skip "CLAUDE.md（ルート）"
} else {
    if (-not $DryRun) {
        Set-Content -Path $rootClaudeMd -Value $rootTemplate -Encoding UTF8
    }
    Write-Success "作成: CLAUDE.md（ルート）"
}

Write-Host ""

# 完了メッセージ
Write-Host "─────────────────────────────" -ForegroundColor DarkGray
if ($DryRun) {
    Write-Host "  [DRY RUN] 上記が実際に作成されます。" -ForegroundColor Yellow
    Write-Host "  実際に実行するには -DryRun フラグを外してください。" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ セットアップ完了！" -ForegroundColor Green
    Write-Host ""
    Write-Host "  次のステップ:" -ForegroundColor White
    Write-Host "  1. 各フォルダの CLAUDE.md を開いてカスタマイズする" -ForegroundColor DarkGray
    Write-Host "  2. 既存のファイルを適切なフォルダに移動する" -ForegroundColor DarkGray
    Write-Host "  3. Downloads/ の肥大化を防ぐ自動仕分けを設定する" -ForegroundColor DarkGray
}
Write-Host ""
