# PDF Common Patterns

頻出操作のコピペ用スニペット集。pypdf / pdfplumber / reportlab ベース。

---

## ライブラリ選択ガイド

| やりたいこと | 使うライブラリ |
|------------|-------------|
| 結合・分割・回転 | pypdf |
| テキスト抽出（高精度） | pdfplumber |
| 表の抽出 | pdfplumber |
| 新規PDF作成 | reportlab |
| フォーム入力 | pdfrw / pypdf |
| 暗号化・復号 | pypdf |
| OCR（スキャンPDF） | pytesseract + pdf2image |
| 透かし追加 | pypdf（overlay） |

---

## 1. テキスト全文抽出

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

print(full_text)
```

---

## 2. 特定ページ範囲のテキスト抽出

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    # ページ3〜5を取得（0始まり）
    for page in pdf.pages[2:5]:
        print(f"--- Page {page.page_number} ---")
        print(page.extract_text())
```

---

## 3. テーブル抽出

```python
import pdfplumber
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    tables = page.extract_tables()

    for i, table in enumerate(tables):
        df = pd.DataFrame(table[1:], columns=table[0])
        print(f"Table {i+1}:")
        print(df)
```

---

## 4. PDF結合

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for path in ["part1.pdf", "part2.pdf", "part3.pdf"]:
    reader = PdfReader(path)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as f:
    writer.write(f)
```

---

## 5. ページ分割（1ページ1ファイル）

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    w = PdfWriter()
    w.add_page(page)
    with open(f"page_{i+1:03d}.pdf", "wb") as f:
        w.write(f)
```

---

## 6. 特定ページ範囲を抽出

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages[2:7]:  # 3〜7ページ目
    writer.add_page(page)

with open("extracted.pdf", "wb") as f:
    writer.write(f)
```

---

## 7. ページ回転

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.rotate(90)  # 90, 180, 270
    writer.add_page(page)

with open("rotated.pdf", "wb") as f:
    writer.write(f)
```

---

## 8. 透かし（ウォーターマーク）追加

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as f:
    writer.write(f)
```

---

## 9. パスワード保護

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
writer.append_pages_from_reader(reader)
writer.encrypt("user_password", "owner_password")

with open("protected.pdf", "wb") as f:
    writer.write(f)
```

---

## 10. 暗号化PDFを復号

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("protected.pdf")
if reader.is_encrypted:
    reader.decrypt("password")

writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)

with open("decrypted.pdf", "wb") as f:
    writer.write(f)
```

---

## 11. 画像を抽出

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
for i, page in enumerate(reader.pages):
    for j, img in enumerate(page.images):
        with open(f"image_p{i+1}_{j+1}.{img.name.split('.')[-1]}", "wb") as f:
            f.write(img.data)
```

---

## 12. OCR（スキャンPDF → テキスト化）

```python
from pdf2image import convert_from_path
import pytesseract

images = convert_from_path("scanned.pdf", dpi=300)
text = ""
for img in images:
    text += pytesseract.image_to_string(img, lang="jpn+eng")

print(text)
```

---

## 13. HTMLからPDF生成

```python
from weasyprint import HTML

HTML(string="<h1>タイトル</h1><p>本文</p>").write_pdf("output.pdf")
# またはURLから
HTML(url="https://example.com").write_pdf("output.pdf")
```

---

## 14. reportlabで新規PDF作成

```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

c = canvas.Canvas("output.pdf", pagesize=A4)
width, height = A4

c.setFont("Helvetica", 16)
c.drawString(72, height - 72, "タイトル")
c.setFont("Helvetica", 12)
c.drawString(72, height - 120, "本文テキスト")
c.save()
```

---

## 15. メタデータ取得・更新

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
print(reader.metadata)

writer = PdfWriter()
writer.append_pages_from_reader(reader)
writer.add_metadata({
    "/Title": "文書タイトル",
    "/Author": "著者名",
    "/Subject": "概要",
})
with open("output.pdf", "wb") as f:
    writer.write(f)
```

---

## よくあるエラー

| エラー | 原因 | 対処 |
|--------|------|------|
| `PdfReadError: EOF marker not found` | 破損PDF | 修復ツールで試す / 別の方法で取得 |
| テキスト抽出が空 | スキャンPDF | OCR（#12）を使う |
| 文字化け | 日本語フォント埋め込みなし | pdfplumber で試す / OCR |
| `PasswordBypass` | パスワード付きPDF | `decrypt()` を先に呼ぶ（#10） |
