# スキル検索ガイド

インストール済みスキルの探し方・発見方法。

---

## スキル一覧の確認方法

```bash
# インストール済みスキル一覧
ls ~/.claude/skills/
ls ./.agent/skills/      # プロジェクトローカル

# スキルの内容確認
cat ~/.claude/skills/<skill-name>/SKILL.md
```

---

## カテゴリ別スキルマップ

| カテゴリ | スキル名 |
|---------|---------|
| X/SNSコンテンツ | x-article-writer-v0, tm-thread-post-generator, ritsuto-style-generator, x-thumbnail-prompts-v2, infographic-prompt-generator-v2, x-content-suite |
| ドキュメント作成 | docx, pdf, xlsx, pptx, doc-coauthoring |
| ブラウザ自動化 | agent-browser, pinchtab, logged-in-google-chrome-skill |
| ビジュアル・デザイン | canvas-design, algorithmic-art, slack-gif-creator, theme-factory, brand-guidelines |
| 開発支援 | claude-api, mcp-builder, web-artifacts-builder, frontend-design |
| テスト・デバッグ | systematic-debugging, verification-before-completion, webapp-testing |
| スキル管理 | skill-creator, skills-generator-main, style-to-skill-generator |
| メモリ・知識管理 | ghost-memory, notebooklm-manager |
| ワークスペース管理 | ai-workspace-organizer, philosophy-first-agent-config |
| AI強化 | ai-power-prompts, meta-step-prompting, pua |

---

## 「こんなことしたいけどスキルある？」判断フロー

```
Xに投稿するものを作りたい → x-content-suite
Wordファイルを作りたい → docx
PDFを操作したい → pdf
Excelを操作したい → xlsx
スライドを作りたい → pptx
ブラウザを操作したい → agent-browser
コードのバグを直したい → systematic-debugging
スキルを作りたい/改善したい → skill-creator
記憶を保存したい → ghost-memory
フォルダを整理したい → ai-workspace-organizer
```

---

## スキルが見つからない場合

1. `skill-creator` スキルで新しいスキルを作る
2. `skills-generator-main` スキルでスキルを生成する
3. Anthropic公式スキルマーケットプレイスを確認する
