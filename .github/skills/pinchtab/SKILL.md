---
name: pinchtab
description: Control a persistent local Chrome service through Pinchtab when the user needs browser automation, scraping, navigation, form filling, screenshots, or MCP-based browser access that should be shared across Codex, VSCode, and Antigravity.
---

# Pinchtab

Use this skill when browser work should go through the local Pinchtab service instead of a one-shot browser CLI.

## Workspace Entry Point

- Repo: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ\pinchtab`
- Wrapper: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ\pinchtab-cli.cmd`
- Start script: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ\pinchtab-start.ps1`

## Basic Flow

```powershell
powershell -ExecutionPolicy Bypass -File .\pinchtab-start.ps1
.\pinchtab-cli.cmd nav https://example.com
.\pinchtab-cli.cmd snap -i -c
.\pinchtab-cli.cmd click e5
.\pinchtab-cli.cmd text
```

## Shared MCP

VSCode / Antigravity では `.vscode/mcp.json` から `pinchtab mcp` を参照できる。
サーバーを先に起動してから使う。

## Notes

- 既定URLは `http://127.0.0.1:9867`
- ローカル設定は `pinchtab-data\config.json`
- プロファイル永続化があるので、普段使いブラウザとは分けたいときは `pinchtab-data\profiles` を使う
