# AI Workspace Organizer - Templates

これらのテンプレートを各フォルダの `CLAUDE.md` や `RULES.md` として使用します。

## 1. CLAUDE.md (Project/Folder Context)

```markdown
# [Project/Client Name] Context

## Overview
このフォルダは [プロジェクト名/顧客名] に関するすべての [ドキュメント/コード] を管理しています。

## Key Objectives
- [目的1]
- [目的2]

## Important Files & Directories
- `docs/`: 契約書・提案書
- `minutes/`: 議事録
- `src/`: ソースコード

## Current Tasks
- [ ] [タスク1]
- [ ] [タスク2]

## Notes for AI
- このフォルダで作業を開始する際は、まず `docs/overview.md` を確認してください。
- 議事録を追加するときは、`YYYY-MM-DD_Topic.md` の形式でお願いします。
```

## 2. .antigravity.md (Antigravity Context)

```markdown
# Antigravity Context: [Project Name]

## Focus Area
[このフォルダでAntigravityが重点的に扱うべき領域]

## Technical Stack
- Frontend: [e.g. React]
- Backend: [e.g. Node.js]

## Project Structure Notes
- [構造上の注意点]

## Custom Instructions
- [Antigravity固有の指示]
```

## 3. .github/copilot-instructions.md (GitHub Copilot)

```markdown
# GitHub Copilot Instructions

## Coding Style
- Follow [Standard/Style Guide].
- Use [Language Features].

## Context
Provide specific instructions for Copilot's code generation in this directory.
```

## 4. RULES.md (Naming & Safety Rules)

```markdown
# Organization Rules

## Naming Conventions
- フォルダ名: `kebab-case` (例: `apex-tech`)
- ファイル名: `YYYY-MM-DD_title` または `snake_case`
- 定例会: `weekly-sync_YYYY-MM-DD`

## Safety & Security
- `.env` や秘密鍵をコミット/アップロードしない。
- 顧客の個人情報をプレーンテキストで保存しない。

## Directory Prohibitions
- `Desktop` に一時ファイル以外の作業用ファイルを置かない。
- `Downloads` に1週間以上ファイルを放置しない。
```
