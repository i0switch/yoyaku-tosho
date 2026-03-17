/**
 * sample-deck.js
 * 
 * 組み込みレイアウトのサンプルを示す定義ファイル。
 * 実行すると sample-output.pptx が生成されます。
 */

const { renderDeck } = require('../lib/render-engine');
const { validateSlideDefinition } = require('../lib/validate-slide');

const deckDef = {
    author: "Cortex Assistant",
    slides: [
        {
            type: "cover",
            title: "Google Slides Generator",
            subtitle: "AIで資料作成を自動化する魔法のスキル",
            catchphrase: "Create presentations instantly",
            version: "1.0.0"
        },
        {
            type: "section",
            title: "Overview",
            subtitle: "何ができるのか"
        },
        {
            type: "content",
            layout: "kpi-three-col",
            title: "圧倒的な生産性向上",
            content: {
                items: [
                    { label: "作成時間", value: "3秒" },
                    { label: "レイアウト数", value: "47" },
                    { label: "品質ブレ", value: "0%" }
                ]
            }
        },
        {
            type: "ending",
            message: "ご清聴ありがとうございました"
        }
    ]
};

// 1. QA チェック
validateSlideDefinition(deckDef);

// 2. スライド生成
const pres = renderDeck(deckDef);

// 3. PPTX ファイルへの書き出し
pres.writeFile({ fileName: "sample-output.pptx" }).then(() => {
    console.log("✅ sample-output.pptx が生成されました。");
});
