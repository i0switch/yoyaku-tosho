# XLSX Library Selection Guide

pandas vs openpyxl の判断基準と頻出パターン。

---

## ライブラリ選択フローチャート

```
やりたいことは何？
│
├─ データ分析・集計・フィルタ → pandas
├─ セルの書式・色・スタイル変更 → openpyxl
├─ 数式を保持したまま編集 → openpyxl
├─ 大量データの高速処理 → pandas
├─ 既存Excelの見た目を保つ → openpyxl
├─ グラフ生成 → openpyxl（または xlsxwriter）
├─ CSVからExcelへ変換 → pandas
└─ LibreOfficeで数式を再計算 → scripts/recalc.py
```

---

## pandas — データ操作・分析系

### 読み込み

```python
import pandas as pd

# 基本
df = pd.read_excel("data.xlsx")

# シート指定
df = pd.read_excel("data.xlsx", sheet_name="Sheet2")

# 全シートを辞書で
dfs = pd.read_excel("data.xlsx", sheet_name=None)

# ヘッダー行の指定
df = pd.read_excel("data.xlsx", header=2)  # 3行目をヘッダーに

# 特定列のみ
df = pd.read_excel("data.xlsx", usecols="A:D")
```

### 書き出し

```python
# 基本
df.to_excel("output.xlsx", index=False)

# 複数シートへ
with pd.ExcelWriter("output.xlsx") as writer:
    df1.to_excel(writer, sheet_name="売上", index=False)
    df2.to_excel(writer, sheet_name="費用", index=False)

# 既存ファイルにシート追加
with pd.ExcelWriter("output.xlsx", mode="a", engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="新シート", index=False)
```

### よく使う操作

```python
# フィルタ
df_filtered = df[df["売上"] > 1000000]

# 集計
df_sum = df.groupby("カテゴリ")["売上"].sum().reset_index()

# 欠損値処理
df.fillna(0, inplace=True)
df.dropna(subset=["必須列"], inplace=True)

# 列追加
df["利益率"] = df["利益"] / df["売上"]

# ソート
df.sort_values("売上", ascending=False, inplace=True)
```

---

## openpyxl — 書式・スタイル・数式系

### 基本読み書き

```python
from openpyxl import load_workbook

wb = load_workbook("template.xlsx")
ws = wb.active

# セル書き込み
ws["A1"] = "タイトル"
ws.cell(row=2, column=1, value="データ")

# 保存
wb.save("output.xlsx")
```

### スタイル設定

```python
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# フォント
ws["A1"].font = Font(bold=True, size=14, color="FF0000")

# 背景色
ws["A1"].fill = PatternFill(fill_type="solid", fgColor="E8F4F8")

# 中央揃え
ws["A1"].alignment = Alignment(horizontal="center", vertical="center")

# 罫線
thin = Side(style="thin")
ws["A1"].border = Border(left=thin, right=thin, top=thin, bottom=thin)
```

### 数式

```python
# 数式はそのまま文字列で設定
ws["C2"] = "=A2+B2"
ws["C3"] = "=SUM(A1:A10)"
ws["D2"] = "=IF(C2>1000000,\"達成\",\"未達\")"

# 数式の再計算は LibreOffice が必要
# scripts/recalc.py を使う
```

### 列幅・行高

```python
ws.column_dimensions["A"].width = 20
ws.row_dimensions[1].height = 30
```

### セル結合

```python
ws.merge_cells("A1:D1")
ws["A1"] = "結合タイトル"
ws["A1"].alignment = Alignment(horizontal="center")
```

---

## recalc.py — 数式の再計算

pandas は数式の値を読み込めない（セルに `0` や空白として見える）。
数式の結果が必要なときは LibreOffice で計算してから読む。

```bash
# 数式を計算した値で保存
python scripts/recalc.py input.xlsx output.xlsx
```

---

## よくある罠

| 罠 | 症状 | 対処 |
|----|------|------|
| pandas で数式セルが `0` | 数式の計算値が取れない | recalc.py → 再read |
| openpyxl で既存書式が消える | `load_workbook()` 後に上書き | `data_only=False` で読む |
| 日付が数値になる | Excelのシリアル値 | `pd.to_datetime()` または `openpyxl` の `number_format` |
| 大量データが遅い | openpyxlの全読み込み | `read_only=True` モード使用 |
| CSVの文字コード | 日本語が化ける | `encoding="utf-8-sig"` または `encoding="shift_jis"` |
