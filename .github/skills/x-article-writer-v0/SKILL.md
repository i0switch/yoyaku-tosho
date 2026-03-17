---
name: x-article-writer-v0
description: Xプラットフォームに最適化された高品質記事を生成・添削するスキル。X公式ガイドライン準拠、5つの記事型（社会経済分析、歴史メタファー、ビジネス戦略、ステップバイステップ変革、段階的フレームワーク教育）と3つのトーン（friendly、professional、storytelling）に対応。トリガー：「X複合記事スキルを使って」。入力：Deep Research結果、論文、記事、文字起こし等。出力：記事本文＋タイトル案5つ。添削モードあり。
---

# X複合記事ライタースキル V0

## 概要

このスキルは、Xプラットフォームに最適化された高品質な長文記事を生成・添削します。

**主な機能：**
- 記事生成（5つの型 × 3つのトーン）
- 記事添削・改善提案
- X公式ガイドライン準拠チェック

**トリガー：** 「X複合記事スキルを使って」

## 使用ワークフロー

### 1. 記事生成モード

```
入力受付
  ↓
X公式ガイドライン読み込み (references/x-official-guidelines.md)
  ↓
型の自動選択または指定
  ├─ 社会経済分析型 (references/article-frameworks/socioeconomic-analysis.md)
  ├─ 歴史メタファー型 (references/article-frameworks/historical-metaphor.md)
  ├─ ビジネス戦略型 (references/article-frameworks/business-strategy.md)
  ├─ ステップバイステップ変革型 (references/article-frameworks/step-by-step-transformation.md)
  └─ 段階的フレームワーク教育型 (references/article-frameworks/progressive-framework-teaching.md)
  ↓
必要に応じて構成テクニック参照
  ├─ マイクロストーリー (references/composition-techniques/microstory.md)
  ├─ ピラミッド原理 (references/composition-techniques/pyramid-principle.md)
  └─ クロスドメイン合成 (references/composition-techniques/cross-domain-synthesis.md)
  ↓
トーン適用 (デフォルト: friendly)
  ├─ friendly (references/tone-styles/friendly.md)
  ├─ professional (references/tone-styles/professional.md)
  ├─ storytelling (references/tone-styles/storytelling.md)
  ├─ original (references/tone-styles/original-samples.md)
  └─ neutral (references/tone-styles/neutral.md)
  ↓
writing-techniques適用 (references/writing-techniques.md)
  ↓
記事生成 + タイトル案5つ
```

### 2. 添削モード

ユーザーが既存記事を提供した場合：

```
記事分析
  ↓
X公式ガイドライン準拠チェック
  ↓
問題点と改善点をセットで提示
  ↓
「→ 改善しますか？」と確認
  ↓
Yes → 改善版記事生成
```

## 入力パターン

以下のいずれかを受け付け：
- Deep Researchの結果
- ユーザーの考え・思考
- 記事のソース（URL可）
- 論文
- 文字起こし
- その他のコンテンツ

## 出力形式

```markdown
# [タイトル]

[記事本文 - Markdown形式]

---
【使用した設定】
型: ○○型
トーン: friendly（またはユーザー指定）
構成テクニック: ○○

【タイトル案】
1. ○○
2. ○○
3. ○○
4. ○○
5. ○○
```

## 型選択ガイド

| 入力内容 | 推奨型 |
|---------|--------|
| 社会・経済トレンド分析、世代間格差、投資テーマ | 社会経済分析型 |
| 歴史的事例と現代の類推、技術革新の影響 | 歴史メタファー型 |
| ビジネス機会、競合分析、戦略提案 | ビジネス戦略型 |
| 自己啓発、行動変容、実践プロトコル | ステップバイステップ変革型 |
| フレームワーク解説、段階的学習内容 | 段階的フレームワーク教育型 |

**型の自動選択：** ユーザーが型を指定しない場合、入力内容から最適な型を自動選択

## トーン選択ガイド

| トーン | 特徴 | 使用場面 |
|--------|------|----------|
| **friendly**（デフォルト） | 親しみやすく共感的、平易な言葉 | 一般読者向け、わかりやすさ重視 |
| **professional** | 客観的で論理的、データ重視 | ビジネス・分析記事、専門的内容 |
| **storytelling** | 実践的で物語性、体験重視 | ケーススタディ、実践レポート |
| **original** | サンプル記事のオリジナルトーン | 記事型に忠実 |
| **neutral** | 標準的、バランス型 | フォーマルな文書 |

**トーン指定方法：** 「professionalトーンで」「storytellingで」など

## 重要な注意事項

### X公式ガイドライン遵守
- 短い段落（最大2〜4行）
- 3～5段落ごとに小見出し
- 箇条書きと番号付きリスト活用
- 重要な洞察を**太字**
- 1段落につき1つのアイデア

### マークダウン構造
各型には固有のマークダウン構造があり、必ず遵守すること

### 禁止事項
- 体言止めの過度な使用（friendlyトーン時）
- 型とトーンの不適切な組み合わせ

## トラブルシューティング

**入力が不明確な場合：**
→ ユーザーに型・トーンの希望を確認

**複数の型が該当する場合：**
→ 最も近い型を選択し、理由を簡潔に説明

**トーン指定が曖昧な場合：**
→ デフォルト（friendly）を使用
