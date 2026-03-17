# DOCX Common Patterns

頻出20パターンの定型コードスニペット。コピペして即使えるように設計。

---

## 1. 見出し付きドキュメント基本構成

```javascript
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ text: "タイトル", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "サブタイトル", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ children: [new TextRun("本文テキスト")] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => fs.writeFileSync("output.docx", buf));
```

---

## 2. 太字・斜体・下線・色付きテキスト

```javascript
new Paragraph({
  children: [
    new TextRun({ text: "太字", bold: true }),
    new TextRun({ text: " / ", }),
    new TextRun({ text: "斜体", italics: true }),
    new TextRun({ text: " / ", }),
    new TextRun({ text: "下線", underline: {} }),
    new TextRun({ text: " / ", }),
    new TextRun({ text: "赤文字", color: "FF0000" }),
  ]
})
```

---

## 3. 箇条書きリスト

```javascript
const { NumberingLevel, LevelFormat } = require('docx');

// 番号なしリスト（•）
new Paragraph({
  text: "項目A",
  bullet: { level: 0 }
})

// 番号付きリスト（1. 2. 3.）
// numbering設定をDocumentに追加してから参照
new Paragraph({
  text: "手順1",
  numbering: { reference: "my-numbering", level: 0 }
})
```

---

## 4. シンプルテーブル

```javascript
const { Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("ヘッダー1")] }),
        new TableCell({ children: [new Paragraph("ヘッダー2")] }),
      ]
    }),
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("データ1")] }),
        new TableCell({ children: [new Paragraph("データ2")] }),
      ]
    }),
  ]
})
```

---

## 5. ページ設定（A4 縦）

```javascript
const { PageSize, PageOrientation } = require('docx');

new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4 in twips
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 2.5cm
      }
    },
    children: [/* ... */]
  }]
})
```

---

## 6. ヘッダー・フッター

```javascript
const { Header, Footer, PageNumber, NumberFormat } = require('docx');

new Document({
  sections: [{
    headers: {
      default: new Header({
        children: [new Paragraph({ text: "会社名 | 機密文書" })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun("Page "),
            new TextRun({ children: [PageNumber.CURRENT] }),
            new TextRun(" of "),
            new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
          ]
        })]
      })
    },
    children: [/* ... */]
  }]
})
```

---

## 7. 目次（Table of Contents）

```javascript
const { TableOfContents } = require('docx');

// 目次を挿入（Wordで開くと自動更新される）
new TableOfContents("目次", {
  hyperlink: true,
  headingStyleRange: "1-3",
})
```

---

## 8. 画像の挿入

```javascript
const { ImageRun } = require('docx');

new Paragraph({
  children: [
    new ImageRun({
      data: fs.readFileSync("image.png"),
      transformation: { width: 400, height: 300 }
    })
  ]
})
```

---

## 9. ハイパーリンク

```javascript
const { ExternalHyperlink } = require('docx');

new Paragraph({
  children: [
    new ExternalHyperlink({
      children: [new TextRun({ text: "リンクテキスト", style: "Hyperlink" })],
      link: "https://example.com"
    })
  ]
})
```

---

## 10. 改ページ

```javascript
const { PageBreak } = require('docx');

new Paragraph({
  children: [new PageBreak()]
})
```

---

## 11. セル結合テーブル（colspan）

```javascript
const { VerticalMergeType } = require('docx');

new TableRow({
  children: [
    new TableCell({
      children: [new Paragraph("結合セル")],
      columnSpan: 2  // 横方向2セル結合
    }),
    new TableCell({ children: [new Paragraph("通常")] }),
  ]
})
```

---

## 12. テキストの配置（中央・右寄せ）

```javascript
const { AlignmentType } = require('docx');

new Paragraph({ text: "中央寄せ", alignment: AlignmentType.CENTER })
new Paragraph({ text: "右寄せ", alignment: AlignmentType.RIGHT })
new Paragraph({ text: "両端揃え", alignment: AlignmentType.JUSTIFIED })
```

---

## 13. インデント

```javascript
new Paragraph({
  text: "インデントされたテキスト",
  indent: { left: 720 }  // 720 twips = 1.27cm
})
```

---

## 14. 複数セクション（段組みなど）

```javascript
const { SectionType } = require('docx');

new Document({
  sections: [
    { children: [/* セクション1 */] },
    {
      properties: { type: SectionType.CONTINUOUS },
      children: [/* セクション2: 連続（改ページなし） */]
    },
  ]
})
```

---

## 15. 既存ファイルを読んでテキスト抽出

```bash
pandoc --track-changes=all input.docx -o output.md
```

---

## 16. 既存ファイルを解凍してXML編集→再パック

```bash
python scripts/office/unpack.py document.docx unpacked/
# XMLを編集...
python scripts/office/pack.py unpacked/ output.docx
python scripts/office/validate.py output.docx
```

---

## 17. フォント・フォントサイズ

```javascript
new TextRun({
  text: "カスタムフォント",
  font: "Noto Sans JP",
  size: 28  // 14pt = 28 half-points
})
```

---

## 18. 表の背景色（行ごとのストライプ）

```javascript
const { ShadingType } = require('docx');

new TableCell({
  shading: { fill: "E8F4F8", type: ShadingType.SOLID },
  children: [new Paragraph("背景色付きセル")]
})
```

---

## 19. コメント（レビュー用）

```javascript
const { CommentRangeStart, CommentRangeEnd, CommentReference } = require('docx');

// Document の comments プロパティにコメントを登録してから参照
```

---

## 20. ファイルサイズ確認・バリデーション

```bash
# バリデーション（XML整合性チェック）
python scripts/office/validate.py output.docx

# ファイルサイズ確認
ls -lh output.docx

# Wordで開けるか確認（ヘッドレス変換テスト）
python scripts/office/soffice.py --headless --convert-to pdf output.docx
```

---

## パターン選択ガイド

| やりたいこと | 使うパターン |
|------------|------------|
| ゼロから文書作成 | #1 + 必要なパターン |
| 既存ファイル編集 | #16（XML直編集） |
| 表を含む資料 | #4 + #11 + #18 |
| 報告書・議事録 | #1 + #3 + #6 + #7 |
| ロゴ入りレターヘッド | #6 + #8 + #9 |
