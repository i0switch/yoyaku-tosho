---
name: style-to-skill-generator
description: バズったポストスタイルを分析し、1回の指示で完全なSkillを作成する。トリガー例：「バズポストを分析してSkillを作って」「このポストスタイルをSkill化して」
---

# style-to-skill-generator

このスキルは、X（旧Twitter）などのバズったポストスタイルを分析し、そのスタイルを再現するための完全なSkillを1回の指示で作成します。

tm-thread-post-generatorタスクで得た教訓を全て組み込み、以下の問題を解決します：

- **YAML混入問題**: references/配下のファイルにYAMLフロントマターが混入する問題を防止
- **情報収集不足**: タスク開始前に全ての必要情報を一括で収集し、手戻りを防止
- **UIとサンドボックスの差異**: キャッシュ問題を早期に診断・解決
- **配信形式の混乱**: skill-creator準拠の正しい配信方法を使用

**最終的なアウトプットは、`/home/ubuntu/skills/{skill-name}/SKILL.md` のパスを添付することで、ユーザーが「マイスキルに追加」ボタンから即座に追加できる完全なSkillです。**

## Workflow

このSkillは以下の6つのフェーズで動作します：

### Phase 1: 事前情報収集（必須）

**目的**: 手戻りを防ぐため、タスク開始前に全ての必要情報を一括で収集

**実行内容**:
1. `workflow-checklist.md` を読み込む
2. チェックリストの全項目をユーザーに一問一答で確認
3. 回答を `{skill-name}_requirements.md` に記録

**チェックリスト項目**:
- 分析対象のURL/ファイル（最低3つ、推奨5-7つ）
- 完全版ポストの数とスレッド数
- 部分版ポストの数とスレッド数
- 抽出する型の数（推奨4-6つ）
- Skill名（kebab-case）
- トリガーフレーズ（2-3個）
- 特別な要件（絵文字、文体、構造など）
- 出力形式の要件

**重要**: 全ての情報が揃うまで次のフェーズに進まない

### Phase 2: ポスト分析

**目的**: 提供されたポストから構造パターンを抽出

**実行内容**:
1. 各ポストをブラウザまたはファイルから取得
2. 冒頭ポストの構造を分析（絵文字、段落構成、接続詞、文末表現）
3. スレッド展開の特徴を分析（番号表記、段落数、具体性、引用、問いかけ）
4. 文体の特徴を分析（口語度、文長、改行頻度、対比構造）
5. 型（パターン）を分類
6. 分析結果を `{skill-name}_analysis.md` に保存

**注意点**:
- 完全版ポストは全スレッドを記録
- 部分版ポストは指定されたスレッド数のみ記録
- 原文をそのまま保存（絵文字、改行、句読点を改変しない）

### Phase 3: Skill設計

**目的**: skill-creator準拠のディレクトリ構成を設計

**実行内容**:
1. `init_skill.py` を実行してSkillディレクトリを作成
2. 不要なファイルを削除（scripts/, templates/, api_reference.md）
3. `post_examples/` ディレクトリを作成
4. 必要なreferenceファイルを決定

**最終的なディレクトリ構成**:
```
{skill-name}/
├── SKILL.md
└── references/
    ├── pattern_guide.md
    └── post_examples/
        ├── {type}_1.md
        ├── {type}_2.md
        └── ...
```

### Phase 4: ファイル作成

**目的**: YAML混入を防ぎ、正確なファイルを作成

**実行内容**:
1. `file-templates.md` を読み込む
2. テンプレートを厳守してファイルを作成
   - **SKILL.md**: YAMLフロントマター必須
   - **pattern_guide.md**: YAMLフロントマター禁止
   - **post_examples/*.md**: YAMLフロントマター禁止、原文をそのまま記載

**重要な原則**:
- **YAMLフロントマターはSKILL.mdのみ**
- **references/配下のファイルにはYAMLを含めない**
- **post_examplesファイルには原文をそのまま記載**

### Phase 5: 自動検証

**目的**: ファイル作成直後に問題を検出

**実行内容**:
1. `validation-rules.md` を読み込む
2. 以下の検証を実行：
   - YAML混入チェック（`grep -rn "^name:" references/`）
   - 冒頭ポスト確認（`head -15` で各ファイルを確認）
   - ファイル数確認（`tree` でディレクトリ構造を確認）
   - skill-creator検証（`quick_validate.py` を実行）
   - SKILL.md確認（`head -10` でYAMLフロントマターを確認）
3. 検証結果をユーザーに提示

**検証結果の提示形式**:
```
✅ 検証完了

1. YAML混入チェック: 問題なし
2. 冒頭ポスト確認: 問題なし
3. ファイル数確認: 問題なし
4. skill-creator検証: 通過
5. SKILL.md確認: 問題なし
```

### Phase 6: 配信

**目的**: skill-creator準拠の方法でSkillを配信

**実行方法**:
```
message tool で以下のパスを添付:
/home/ubuntu/skills/{skill-name}/SKILL.md
```

**システムの自動処理**:
1. パターン `/home/ubuntu/skills/*/SKILL.md` を検出
2. Skillディレクトリを `.skill` ファイルにパッケージ化
3. フロントエンドに特別なカードとして送信
4. ユーザーは「マイスキルに追加」ボタンで追加可能

**注意**: tar.gzや.skillファイルを手動で作成しない

## Core Principles

### 1. 事前情報収集の徹底

タスク開始前に全ての必要情報を収集し、手戻りを防ぐ。Phase 1のチェックリストを必ず完了してから次のフェーズに進む。

### 2. 厳格なテンプレート使用

YAML混入を防ぐため、各ファイルタイプのテンプレートを厳守する。特に以下を徹底：
- **SKILL.mdのみ**: YAMLフロントマターを含める
- **references/配下**: YAMLフロントマターを絶対に含めない

### 3. 自動検証の実行

ファイル作成直後に必ず検証を実行し、結果をユーザーに提示する。これにより、問題を早期に発見・修正できる。

### 4. UIとサンドボックスの差異を意識

ユーザーが見ている画面（UI）とサンドボックス内のファイルは異なる可能性がある。ユーザーが問題を指摘した場合：
1. サンドボックス内のファイルを確認
2. 問題がない場合、キャッシュクリアを提案
3. それでも問題がある場合、完全削除→再作成

### 5. skill-creator準拠

配信方法、ディレクトリ構成、Progressive Disclosureを厳守する。特に配信時は、SKILL.mdのパスを添付するだけでよい。

### 6. 問題診断の柔軟性

ユーザーが繰り返し同じ問題を指摘する場合、診断方法を変える。同じ確認方法を繰り返さない。

## Reference Files

### workflow-checklist.md

**パス**: `/home/ubuntu/skills/style-to-skill-generator/references/workflow-checklist.md`

**内容**: 段階的なワークフロー（Phase 1-6）と各フェーズのチェックリスト、問題診断フロー

**使用タイミング**: 
- Phase 1開始時に必ず読み込む
- 各フェーズの開始時に該当セクションを参照
- 問題が発生した場合に診断フローを参照

**読み込み方法**:
```
file tool の read action で以下のパスを読み込む:
/home/ubuntu/skills/style-to-skill-generator/references/workflow-checklist.md
```

### file-templates.md

**パス**: `/home/ubuntu/skills/style-to-skill-generator/references/file-templates.md`

**内容**: 各ファイルタイプの厳格なテンプレート（SKILL.md、pattern_guide.md、post_examples/*.md、要件定義ファイル、分析結果ファイル）

**使用タイミング**: Phase 4（ファイル作成）開始時に必ず読み込む

**読み込み方法**:
```
file tool の read action で以下のパスを読み込む:
/home/ubuntu/skills/style-to-skill-generator/references/file-templates.md
```

### validation-rules.md

**パス**: `/home/ubuntu/skills/style-to-skill-generator/references/validation-rules.md`

**内容**: 自動検証ルールとコマンド、検証結果の提示形式

**使用タイミング**: Phase 5（自動検証）開始時に必ず読み込む

**読み込み方法**:
```
file tool の read action で以下のパスを読み込む:
/home/ubuntu/skills/style-to-skill-generator/references/validation-rules.md
```

### troubleshooting.md

**パス**: `/home/ubuntu/skills/style-to-skill-generator/references/troubleshooting.md`

**内容**: 問題診断フロー、よくある問題と解決方法、エスカレーション基準

**使用タイミング**: 
- ユーザーが問題を指摘した場合に必ず読み込む
- ユーザーが2回以上同じ問題を指摘した場合に必ず読み込む

**読み込み方法**:
```
file tool の read action で以下のパスを読み込む:
/home/ubuntu/skills/style-to-skill-generator/references/troubleshooting.md
```

## Progressive Disclosure

このSkillは3レベルの情報開示を実装しています：

### Level 1: SKILL.md（このファイル）

- Skillの目的と概要
- 6つのフェーズの簡潔な説明
- Core Principles
- Reference Filesの一覧

**読み込みタイミング**: タスク開始時

### Level 2: workflow-checklist.md, file-templates.md

- 各フェーズの詳細な手順
- チェックリスト
- テンプレート

**読み込みタイミング**: 各フェーズ開始時

### Level 3: validation-rules.md, troubleshooting.md

- 検証コマンドの詳細
- 問題診断フロー
- トラブルシューティング

**読み込みタイミング**: 検証時、問題発生時

## Output Format

このSkillの最終的なアウトプットは：

1. **完全なSkillディレクトリ**: `/home/ubuntu/skills/{skill-name}/`
2. **SKILL.mdのパス**: message toolで添付
3. **ユーザーの操作**: 「マイスキルに追加」ボタンをクリック

**配信メッセージの例**:
```
✅ {Skill名} Skill が完成しました！

## 検証結果

1. YAML混入チェック: 問題なし
2. 冒頭ポスト確認: 問題なし
3. skill-creator検証: 通過

「マイスキルに追加」ボタンから追加できます。
```

## Important Notes

### ユーザーが問題を指摘した場合

**絶対にやってはいけないこと**:
- 「確認しましたが問題ありません」と繰り返す
- 同じ確認方法を繰り返す
- ユーザーの指摘を無視する

**やるべきこと**:
1. サンドボックス内のファイルを確認
2. 問題がない場合、キャッシュクリアを提案
3. ユーザーが2回以上同じ問題を指摘した場合、別の診断方法を試す
4. `troubleshooting.md` を読み込んで診断フローに従う

### YAML混入を防ぐための徹底

- **SKILL.mdのみ**: YAMLフロントマターを含める
- **references/配下**: YAMLフロントマターを絶対に含めない
- ファイル作成後、必ず `grep -rn "^name:" references/` で確認

### 原文の保持

post_examplesファイルでは、原文を一切改変しない：
- 絵文字をそのまま保持
- 改行をそのまま保持
- 句読点をそのまま保持
- スペースをそのまま保持

### 配信方法

**正しい方法**: SKILL.mdのパスを添付
**間違った方法**: tar.gz、.skill、ディレクトリを手動で作成

## Success Criteria

このSkillが成功したと言えるのは：

1. ユーザーが1回の指示で完了できる
2. YAML混入問題が発生しない（または即座に検出・修正）
3. ユーザーが同じ説明を繰り返す必要がない
4. 配信形式で混乱が生じない
5. skill-creator検証を一発で通過
6. ユーザーが即座に「マイスキルに追加」できる
