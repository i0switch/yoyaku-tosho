# 画像素材フォルダ (assets)

このディレクトリには、スライド生成時に使用される自社ブランドの画像素材を格納してください。  
`lib/render-engine.js` と `lib/shared.js` でこれらの画像を参照します。

## 用意する画像素材
*   `logo-dark.png` : 白または明るい背景で使用するロゴ
*   `logo-light.png` : 暗い背景用の白色ロゴ
*   `bg-gradient-cover.png` : 表紙スライド用背景画像 (16:9, 推奨 2540 x 1429)
*   `bg-gradient-section.png` : セクション区切り用背景画像 (16:9)
*   `bg-gradient-ending.png` : 最終ページ用背景画像 (16:9)

> **ヒント:** カスタム画像を配置することで、AI が出力するスライドが瞬時に自社ブランド仕様に切り替わります。
