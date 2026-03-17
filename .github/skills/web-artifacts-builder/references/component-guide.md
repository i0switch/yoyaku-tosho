# Web Artifacts Component Guide

shadcn/ui + React + Tailwind CSS のコンポーネント選択ガイド。

---

## よく使うshadcn/uiコンポーネント

| コンポーネント | 用途 | import |
|-------------|------|--------|
| Button | ボタン | `import { Button } from "@/components/ui/button"` |
| Card | カード | `import { Card, CardContent, CardHeader } from "@/components/ui/card"` |
| Input | テキスト入力 | `import { Input } from "@/components/ui/input"` |
| Table | テーブル | `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"` |
| Badge | バッジ | `import { Badge } from "@/components/ui/badge"` |
| Select | ドロップダウン | `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"` |
| Dialog | モーダル | `import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"` |
| Tabs | タブ | `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"` |
| Progress | プログレスバー | `import { Progress } from "@/components/ui/progress"` |
| Tooltip | ツールチップ | `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"` |

---

## ダッシュボードの基本構成パターン

```jsx
// 統計カード + テーブル + グラフの基本レイアウト
<div className="p-6 space-y-6">
  {/* 統計カード行 */}
  <div className="grid grid-cols-4 gap-4">
    <Card>
      <CardHeader><CardTitle>総売上</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold">¥1.2M</p></CardContent>
    </Card>
    {/* ... */}
  </div>

  {/* メインコンテンツ */}
  <div className="grid grid-cols-3 gap-4">
    <div className="col-span-2">
      {/* グラフエリア */}
    </div>
    <div>
      {/* サイドバー */}
    </div>
  </div>
</div>
```

---

## Tailwind CSS よく使うクラス

| 目的 | クラス |
|------|--------|
| フレックス中央揃え | `flex items-center justify-center` |
| グリッドレイアウト | `grid grid-cols-3 gap-4` |
| カードスタイル | `rounded-lg border bg-card shadow-sm p-4` |
| ホバーエフェクト | `hover:bg-accent transition-colors` |
| テキストスタイル | `text-sm text-muted-foreground` |
| レスポンシブ | `md:grid-cols-2 lg:grid-cols-3` |
| 全幅ボタン | `w-full` |

---

## このスキルを使う判断基準

| 条件 | 選択 |
|------|------|
| shadcn/ui・状態管理・ルーティングが必要 | **web-artifacts-builder（このスキル）** |
| シンプルなHTML/CSS/JSの1ファイル | frontend-design スキル |
| ランディングページ・静的デザイン | frontend-design スキル |
