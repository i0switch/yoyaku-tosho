---
name: ai-power-prompts
description: ユーザーが記事作成、キャッチコピー作成、アイデア出しなどのタスクを依頼した際に、AIが成果物の質を劇的に高める「本気出すプロンプト15選」を適用します。コピーライティング、マーケティング、コンテンツ制作の文脈で強力に機能します。ユーザーが「本気出して」「刺さるコピーを作って」「惹きつけるアイデアを」といったニュアンスを含んでいる場合に必ず使用してください。
---

# AI Power Prompts (AIが本気出すプロンプト15選)

このスキルは、Xで話題になった「AIが本気出すプロンプト15選」を元に、特定のタスク（記事作成、コピー制作など）に対して最も効果的なプロンプトパターンを提案・適用するものです。

## 当スキルの動作フロー (Hybrid Proposal)

1.  **分析**: ユーザーの依頼内容（対象、目的、ターゲット）を分析します。
2.  **提案**: `references/` 内の15パターンから、現在のタスクに最も適していると思われる候補を1つ〜3つ選び、その理由と共にユーザーに提案します。
3.  **適用**: ユーザーがパターンを選択したら、該当するテンプレートを読み込み、プレースホルダ（`{{TARGET}}`など）を埋めてタスクを実行します。

## 15のプロンプトパターン
詳細は各リファレンスファイルを参照してください：
- [1. 禁止命令](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/1-forbidden-command.md)
- [2. 数字](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/2-numbers.md)
- [3. 問いかけ](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/3-question.md)
- [4. 意外性](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/4-unexpectedness.md)
- [5. 感情ワード](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/5-emotion-words.md)
- [6. ストーリー風](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/6-story.md)
- [7. ターゲット限定](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/7-target-locking.md)
- [8. 失敗談](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/8-failure-story.md)
- [9. 比較](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/9-comparison.md)
- [10. 秘密](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/10-secrets.md)
- [11. 時間軸](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/11-urgency.md)
- [12. 擬音](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/12-onomatopoeia.md)
- [13. 自虐](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/13-self-deprecation.md)
- [14. データ風](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/14-data.md)
- [15. 呼びかけ](file:///c:/Users/i0swi/OneDrive/デスクトップ/ナレッジ/.agents/skills/ai-power-prompts/references/15-direct-call.md)
