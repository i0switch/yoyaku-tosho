---
name: ghost-memory
description: Use when the user wants to save, search, recall, or inspect long-term memory in the local ghost workspace memory system.
---

# Ghost Memory

Use this skill when the task is about cross-session memory, workspace memory search, recall, or storing reusable facts/processes in `ghost`.

## Workspace Location

- Ghost root: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ\ghost`
- Shared wrapper: `C:\Users\i0swi\OneDrive\デスクトップ\ナレッジ\ghost-cli.ps1`

## Commands

Run commands from the workspace root with:

```powershell
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory stats
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory recall
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory search "query"
powershell -ExecutionPolicy Bypass -File .\ghost-cli.ps1 memory add "content" fact "source"
powershell -ExecutionPolicy Bypass -File .\ghost-sync.ps1
```

## Categories

- `fact`: stable facts
- `episode`: dated events
- `context`: short-lived current context
- `preference`: likes/dislikes
- `procedure`: reusable steps

## Safety

- Do not store secrets, passwords, API keys, or private tokens
- Confirm before writing sensitive personal information
- Prefer `search` or `recall` before adding duplicate memory
- 定期同期は `ghost-sync.ps1` と `Ghost Workspace Auto Extract` タスクで回る
