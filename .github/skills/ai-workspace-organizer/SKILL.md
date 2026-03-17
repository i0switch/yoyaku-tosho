---
name: ai-workspace-organizer
description: AIが自律的に理解・操作できる「AI駆動OS」的なフォルダ構造を構築・維持する。
---

# ai-workspace-organizer

このスキルは、茶恩（@masahirochaen）氏が提唱する「AI時代はフォルダ整理が命」という設計思想に基づき、あなたのMac/PC環境をAI（Claude Codeなど）が即座に文脈を理解し、自律的に操作できる「AI駆動OS」へと昇華させます。

## Core Principles

1. **AI First**: 「人間が探しやすい」ではなく「AIが文脈を即座に理解できる」構造を最優先する。
2. **Context Layering**: `CLAUDE.md` を各階層に配置し、AIに「地図」と「文脈」を自動で提供する。
3. **Strict Naming**: `RULES.md` により命名規則を徹底し、AIによる誤操作や情報の散逸を防ぐ。
4. **Automation**: 散らからないための自動化スクリプト（cron/カスタムスキル）を組み込む。

## Workflow

### Phase 1: 現状診断 (Diagnosis)
現在のフォルダ構造と散らかり具合を確認します。
- `ls -R` または `tree` で構造を把握。
- `Desktop` や `Downloads` の肥大化状況を確認。

### Phase 2: ベース構造の構築 (Base Structure)
以下のトップレベルフォルダ（`~/work/` 等）を作成し、ファイルを移動します。
- `~/work/`: 事業ドキュメント
- `~/dev/`: 開発プロジェクト
- `~/content/`: SNS・メディア制作物
- `~/agents/`: AIエージェント本体
- `~/archive/`: 退避データ

### Phase 3: 文脈ファイルの設定 (Contextualization)
各階層に `CLAUDE.md`, `.antigravity.md`, `.github/copilot-instructions.md`, `RULES.md` を配置します。
- `references/templates.md` から各AIツールに最適なテンプレートを適用。
- 顧客フォルダやプロジェクトフォルダごとに個別のコンテキストを書き込みます。

### Phase 4: 自動化スクリプトの導入 (Automation)

**ワークスペースの即時構築（推奨）:**
```powershell
# ドライラン（何が作られるか確認）
powershell -ExecutionPolicy Bypass -File ".agent\skills\ai-workspace-organizer\scripts\setup-workspace.ps1" -DryRun

# 実際にセットアップ実行
powershell -ExecutionPolicy Bypass -File ".agent\skills\ai-workspace-organizer\scripts\setup-workspace.ps1"

# 別のパスに作成する場合
powershell -ExecutionPolicy Bypass -File ".agent\skills\ai-workspace-organizer\scripts\setup-workspace.ps1" -RootPath "D:\workspace"
```

スクリプトが行うこと:
- `work/`, `dev/`, `content/`, `agents/`, `archive/`, `tmp/` フォルダを作成
- 各フォルダに `CLAUDE.md`（AIへの文脈ファイル）を自動配置
- ルートに `CLAUDE.md`（全体のフォルダマップ）を配置

**既存ファイルの自動仕分け:**
- `references/scripts/organizer_scripts.py` を使用した自動仕分けの実行。
- 定期的なクリーンアップのための cron 設定の提案。

## Reference Files

- [templates.md](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-workspace-organizer/references/templates.md): CLAUDE.md / .antigravity.md / .github/copilot-instructions.md / RULES.md のテンプレート集
- [organizer_scripts.py](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-workspace-organizer/references/scripts/organizer_scripts.py): 整理用Pythonスクリプト
- [setup-workspace.ps1](scripts/setup-workspace.ps1): ワークスペース構造を自動構築するPowerShellスクリプト

## Success Criteria

1. ホームディレクトリ直下が上記6つのフォルダに整理されている。
2. 主要なフォルダに `CLAUDE.md` や `.antigravity.md` 等が配置され、AIがそのフォルダの役割を即座に説明できる。
3. `Downloads` 等の「ゴミ溜め」にならないための仕組みが稼働している。
