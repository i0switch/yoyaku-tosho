# Frontend Design System Reference

プロダクショングレードのUIを作るための設計原則とスニペット。

---

## カラーシステム（Tailwind CSS）

```css
/* カスタムカラー（tailwind.config.jsに追加） */
colors: {
  brand: {
    50:  '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',  /* メインブランドカラー */
    900: '#1e3a8a',
  },
  neutral: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827',
  }
}
```

---

## レスポンシブブレークポイント

| ブレークポイント | 幅 | 対象デバイス |
|--------------|-----|-----------|
| `sm:` | 640px+ | スマートフォン横向き |
| `md:` | 768px+ | タブレット |
| `lg:` | 1024px+ | ノートPC |
| `xl:` | 1280px+ | デスクトップ |

```jsx
// モバイルファーストのグリッド例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## コンポーネント設計パターン

### カード（汎用）
```jsx
function Card({ title, description, cta }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {cta && (
        <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
          {cta} →
        </button>
      )}
    </div>
  );
}
```

### ナビゲーションバー
```jsx
<nav className="flex items-center justify-between px-6 py-4 border-b">
  <div className="font-bold text-xl">Logo</div>
  <div className="hidden md:flex gap-6 text-sm text-gray-600">
    <a href="#" className="hover:text-gray-900">機能</a>
    <a href="#" className="hover:text-gray-900">料金</a>
  </div>
  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
    始める
  </button>
</nav>
```

---

## アニメーション（Tailwind）

```jsx
/* フェードイン */
className="animate-fade-in opacity-0 transition-opacity duration-500"

/* ホバー時のスケール */
className="hover:scale-105 transition-transform duration-200"

/* スライドイン */
className="translate-y-4 opacity-0 transition-all duration-300 [&.visible]:translate-y-0 [&.visible]:opacity-100"
```

---

## アクセシビリティ必須チェック

- [ ] 画像に `alt` テキストが設定されている
- [ ] フォームに `label` が関連付けられている
- [ ] インタラクティブ要素はキーボードで操作できる
- [ ] カラーコントラスト比が 4.5:1 以上
- [ ] フォーカスリングが表示される（`focus-visible:ring-2`）
