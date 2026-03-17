---
name: x-content-suite
description: X（旧Twitter）コンテンツ制作の統合ハブ。記事・サムネ・スレッド・インフォグラフィック・スタイル別スレッドをワンストップで提供。「X用コンテンツを作って」「X記事とサムネをセットで」「スレッドと画像プロンプトを両方」「Xに投稿するものを全部作って」「コンテンツ一式まとめて」など、複数コンテンツをまとめて依頼された場合に使う。単一コンテンツのみの場合は各スキル（x-article-writer-v0, x-thumbnail-prompts-v2, tm-thread-post-generator, infographic-prompt-generator-v2, ritsuto-style-generator）を直接使う。
---

# X Content Suite — コンテンツ制作統合ハブ

Xコンテンツ制作に必要な5スキルを組み合わせて、一括または組み合わせで提供する。

---

## 利用可能なスキル一覧

| スキル | 用途 | トリガーワード例 |
|--------|------|--------------|
| x-article-writer-v0 | X長文記事（5型×3トーン） | 「記事」「アーティクル」「長文」 |
| x-thumbnail-prompts-v2 | サムネイル画像プロンプト3パターン | 「サムネ」「サムネイル」「画像プロンプト」 |
| tm-thread-post-generator | tetumemoスタイルのスレッド | 「スレッド」「連続投稿」「tetumemo」 |
| infographic-prompt-generator-v2 | インフォグラフィックYAML | 「インフォグラフィック」「図解」「YAML」 |
| ritsuto-style-generator | リツトスタイルスレッド | 「リツト風」「損失回避」「ネガティブフック」 |

---

## 判定ロジック

ユーザーのリクエストを受け取ったら、以下の順序で判定する:

### Step 1: 組み合わせリクエストか？

以下のような複数コンテンツを求めている場合は Step 2 へ:
- 「記事とサムネをセットで」
- 「スレッドと画像プロンプトを両方」
- 「コンテンツ一式まとめて」
- 「全部作って」

単一コンテンツのみなら、対応するスキルを直接使って終了。

### Step 2: 必要なコンテンツを確認

指定がなければ確認する:

```
以下のコンテンツのうち、今回作成するものを教えてください:
□ X長文記事（x-article-writer-v0）
□ サムネイル画像プロンプト（x-thumbnail-prompts-v2）
□ スレッド・tetumemoスタイル（tm-thread-post-generator）
□ インフォグラフィックYAML（infographic-prompt-generator-v2）
□ リツトスタイルスレッド（ritsuto-style-generator）
□ すべて
```

### Step 3: 共通素材を確認

複数スキルで共通して必要な素材を一度だけ確認する:

```
以下を教えてください（全スキルで共有します）:
1. トピック・テーマ
2. 元ネタ（URL・メモ・記事・データ等）があれば貼り付けてください
3. ターゲット読者は誰ですか？
```

### Step 4: 順次生成

確認が取れたら、選択されたスキルを順番に実行する。
各スキルの出力は独立したセクション（`---` 区切り）で提供する。

**推奨実行順序**:
1. x-article-writer-v0（記事が基盤素材になるため）
2. tm-thread-post-generator または ritsuto-style-generator
3. x-thumbnail-prompts-v2（記事・スレッドから生成するため）
4. infographic-prompt-generator-v2（記事・スレッドから生成するため）

---

## 出力フォーマット（複数コンテンツの場合）

```
# X Content Suite 出力

## 📝 X長文記事
[x-article-writer-v0 の出力]

---

## 🧵 スレッド
[tm-thread-post-generator の出力]

---

## 🖼️ サムネイル画像プロンプト
[x-thumbnail-prompts-v2 の出力]

---

## 📊 インフォグラフィック
[infographic-prompt-generator-v2 の出力]
```

---

## 各スキルの詳細

各スキルの詳細な仕様・設計ルールは、それぞれのスキルファイルを参照:
- `x-article-writer-v0/SKILL.md` — 5型（社会経済分析/歴史メタファー/ビジネス戦略/変革/教育）× 3トーン
- `tm-thread-post-generator/SKILL.md` — 6つの型からAI自動選択
- `x-thumbnail-prompts-v2/SKILL.md` — 16:9 / 5:2比率 / 3パターンYAML
- `infographic-prompt-generator-v2/SKILL.md` — シンプルモード（デフォルト）/ 詳細モード
- `ritsuto-style-generator/SKILL.md` — 損失回避フック / MPを削らない比喩
