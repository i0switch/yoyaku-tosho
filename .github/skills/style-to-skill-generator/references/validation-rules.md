# 自動検証ルール

このファイルは、Skill作成後に実行すべき自動検証ルールとコマンドを提供します。

## 検証の目的

1. **YAML混入を検出**: references/配下のファイルにYAMLフロントマターが含まれていないことを確認
2. **冒頭ポストの確認**: post_examplesファイルに正しい原文が含まれていることを確認
3. **Skill構造の検証**: skill-creator準拠の構造になっていることを確認

## 検証タイミング

**必須**: 以下のタイミングで必ず検証を実行

1. 全てのファイル作成直後
2. ユーザーに配信する前
3. ユーザーが問題を指摘した場合

## 検証項目

### 1. YAML混入チェック

**目的**: references/配下のファイルにYAMLフロントマターが含まれていないことを確認

**コマンド**:
```bash
# nameフィールドの検出
grep -rn "^name:" /home/ubuntu/skills/{skill-name}/references/

# descriptionフィールドの検出
grep -rn "^description:" /home/ubuntu/skills/{skill-name}/references/

# YAMLブロック開始の検出
grep -rn "^---$" /home/ubuntu/skills/{skill-name}/references/
```

**期待される結果**:
- 何も表示されない（空の出力）
- これは「YAMLが見つからなかった」ことを意味する

**問題がある場合の出力例**:
```
/home/ubuntu/skills/tm-thread-post-generator/references/post_examples/storytelling_1.md:1:---
/home/ubuntu/skills/tm-thread-post-generator/references/post_examples/storytelling_1.md:2:name: tm-thread-post-generator
```

**対処方法**:
- 該当ファイルを開いてYAMLフロントマターを削除
- または、ファイルを完全に削除して再作成

---

### 2. 冒頭ポスト確認

**目的**: post_examplesファイルに正しい原文が含まれていることを確認

**コマンド**:
```bash
for file in /home/ubuntu/skills/{skill-name}/references/post_examples/*.md; do
  echo "=== $(basename $file) ==="
  head -15 "$file"
  echo ""
done
```

**期待される結果**:
- 各ファイルの冒頭15行が表示される
- 1行目: `# [型名] 実例[番号]: [タイトル]`
- 3行目: `## 冒頭ポスト`
- 5行目: ` ``` `（コードブロック開始）
- 6行目以降: 実際のポスト原文（絵文字、改行を含む）

**問題がある場合の出力例**:
```
=== storytelling_1.md ===
---
name: tm-thread-post-generator
description: ...
---
```

**対処方法**:
- YAMLフロントマターを削除
- 正しいテンプレートを使用して再作成

---

### 3. ファイル数の確認

**目的**: 必要なファイルが全て作成されていることを確認

**コマンド**:
```bash
tree /home/ubuntu/skills/{skill-name}/
```

**期待される結果**:
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

**確認事項**:
- SKILL.mdが存在する
- references/pattern_guide.mdが存在する
- references/post_examples/に型ごとのファイルが存在する
- 不要なファイル（scripts/, templates/など）が残っていない

---

### 4. skill-creator検証

**目的**: skill-creator準拠の構造になっていることを確認

**コマンド**:
```bash
python3.11 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py {skill-name}
```

**期待される結果**:
```
🔍 Validating skill at: /home/ubuntu/skills/{skill-name}
Skill is valid!
```

**問題がある場合の出力例**:
```
Error: SKILL.md is missing YAML frontmatter
Error: Required field 'name' not found in YAML frontmatter
```

**対処方法**:
- エラーメッセージに従ってSKILL.mdを修正
- YAMLフロントマターの形式を確認

---

### 5. SKILL.md YAMLフロントマター確認

**目的**: SKILL.mdに正しいYAMLフロントマターが含まれていることを確認

**コマンド**:
```bash
head -10 /home/ubuntu/skills/{skill-name}/SKILL.md
```

**期待される結果**:
```
---
name: {skill-name}
description: {詳細な説明}
---

# {Skill名}
```

**確認事項**:
- 1行目: `---`
- 2行目: `name: {skill-name}`（kebab-case）
- 3行目: `description: {説明}`（1-2文）
- 4行目: `---`
- 5行目: 空行
- 6行目: `# {Skill名}`

---

## 検証結果の提示

検証完了後、ユーザーに以下の形式で結果を提示する：

```
✅ 検証完了

1. YAML混入チェック: 問題なし
   - references/配下のファイルにYAMLフロントマターは含まれていません

2. 冒頭ポスト確認: 問題なし
   - 全てのpost_examplesファイルに正しい原文が含まれています
   - 以下がstorytelling_1.mdの冒頭部分です：
   
   [head -15の出力を貼り付け]

3. ファイル数確認: 問題なし
   - 必要なファイルが全て作成されています
   - 不要なファイルは削除されています

4. skill-creator検証: 通過
   - Skill構造は正しく設計されています

5. SKILL.md確認: 問題なし
   - YAMLフロントマターが正しく含まれています
```

---

## 検証スクリプト（オプション）

以下のスクリプトを作成して、検証を自動化することもできます。

**ファイル名**: `validate_skill.sh`
**場所**: `/home/ubuntu/`

```bash
#!/bin/bash

SKILL_NAME=$1

if [ -z "$SKILL_NAME" ]; then
  echo "Usage: $0 <skill-name>"
  exit 1
fi

SKILL_DIR="/home/ubuntu/skills/$SKILL_NAME"

if [ ! -d "$SKILL_DIR" ]; then
  echo "Error: Skill directory not found: $SKILL_DIR"
  exit 1
fi

echo "🔍 Validating skill: $SKILL_NAME"
echo ""

# 1. YAML混入チェック
echo "1. YAML混入チェック"
YAML_COUNT=$(grep -rn "^name:\|^description:\|^---$" "$SKILL_DIR/references/" | wc -l)
if [ "$YAML_COUNT" -eq 0 ]; then
  echo "   ✅ 問題なし"
else
  echo "   ❌ YAMLフロントマターが検出されました:"
  grep -rn "^name:\|^description:\|^---$" "$SKILL_DIR/references/"
fi
echo ""

# 2. 冒頭ポスト確認
echo "2. 冒頭ポスト確認"
POST_EXAMPLES_DIR="$SKILL_DIR/references/post_examples"
if [ -d "$POST_EXAMPLES_DIR" ]; then
  POST_COUNT=$(ls -1 "$POST_EXAMPLES_DIR"/*.md 2>/dev/null | wc -l)
  echo "   ファイル数: $POST_COUNT"
  for file in "$POST_EXAMPLES_DIR"/*.md; do
    if [ -f "$file" ]; then
      echo "   - $(basename $file)"
      # 冒頭5行を確認
      head -5 "$file" | grep -q "^# " && echo "     ✅ タイトルあり" || echo "     ❌ タイトルなし"
      head -10 "$file" | grep -q "^## 冒頭ポスト" && echo "     ✅ 冒頭ポストセクションあり" || echo "     ❌ 冒頭ポストセクションなし"
    fi
  done
else
  echo "   ❌ post_examplesディレクトリが見つかりません"
fi
echo ""

# 3. ファイル構造確認
echo "3. ファイル構造確認"
tree "$SKILL_DIR"
echo ""

# 4. skill-creator検証
echo "4. skill-creator検証"
python3.11 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py "$SKILL_NAME"
echo ""

# 5. SKILL.md YAMLフロントマター確認
echo "5. SKILL.md YAMLフロントマター確認"
head -10 "$SKILL_DIR/SKILL.md"
echo ""

echo "✅ 検証完了"
```

**使用方法**:
```bash
chmod +x /home/ubuntu/validate_skill.sh
/home/ubuntu/validate_skill.sh {skill-name}
```

---

## トラブルシューティング

### 問題: YAMLが検出された

**症状**:
```bash
$ grep -rn "^name:" /home/ubuntu/skills/{skill-name}/references/
/home/ubuntu/skills/{skill-name}/references/post_examples/storytelling_1.md:2:name: {skill-name}
```

**原因**:
- post_examplesファイルにYAMLフロントマターが含まれている

**解決方法**:
1. 該当ファイルを開く
2. YAMLフロントマター（`---` から `---` まで）を削除
3. 冒頭が `# [型名] 実例[番号]: [タイトル]` で始まることを確認
4. 再度検証を実行

### 問題: 冒頭ポストに原文がない

**症状**:
```bash
$ head -15 /home/ubuntu/skills/{skill-name}/references/post_examples/storytelling_1.md
# ストーリーテリング型 実例1

## 冒頭ポスト

```
name: {skill-name}
description: ...
```
```

**原因**:
- 冒頭ポストのコードブロック内にYAMLが含まれている
- 実際のポスト原文が含まれていない

**解決方法**:
1. ファイルを開く
2. コードブロック内のYAMLを削除
3. 実際のポスト原文を貼り付け
4. 再度検証を実行

### 問題: skill-creator検証が失敗

**症状**:
```bash
$ python3.11 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py {skill-name}
Error: SKILL.md is missing YAML frontmatter
```

**原因**:
- SKILL.mdにYAMLフロントマターが含まれていない

**解決方法**:
1. SKILL.mdを開く
2. 冒頭にYAMLフロントマターを追加:
   ```markdown
   ---
   name: {skill-name}
   description: {説明}
   ---
   ```
3. 再度検証を実行

---

## 検証チェックリスト

タスク完了前に以下を全て確認：

```
□ 1. YAML混入チェックを実行し、何も検出されなかった
□ 2. 冒頭ポスト確認を実行し、全てのファイルに正しい原文が含まれている
□ 3. ファイル数確認を実行し、必要なファイルが全て存在する
□ 4. skill-creator検証を実行し、"Skill is valid!" が表示された
□ 5. SKILL.md確認を実行し、YAMLフロントマターが正しく含まれている
□ 6. 検証結果をユーザーに提示した
```

全てにチェックが入ったら、配信フェーズに進む。
