/**
 * validate-slide.js
 * 
 * 生成されたスライド定義 (deckDef) の品質チェックを行う。
 * 目安となる文字数超過、必須フィールドの不足などを警告する。
 */

function validateSlideDefinition(deckDef) {
    const warnings = [];

    if (!deckDef.slides || deckDef.slides.length === 0) {
        warnings.push("デッキにスライドが含まれていません。");
        return warnings;
    }

    deckDef.slides.forEach((slide, idx) => {
        const slideNum = idx + 1;

        // 必須フィールドの確認
        if (slide.type === "content" && !slide.layout) {
            warnings.push(`スライド ${slideNum}: layout が指定されていません。`);
        }

        // 文字数・コントラストの簡易推定アラート
        if (slide.title && slide.title.length > 50) {
            warnings.push(`スライド ${slideNum}: タイトルが長すぎます（推奨50文字以内）。はみ出す可能性があります。`);
        }

        // コンテンツ特有の警告
        if (slide.content) {
            const { content } = slide;

            if (slide.layout === "qa-grid" && content.items && content.items.length > 4) {
                warnings.push(`スライド ${slideNum} (qa-grid): アイテム数が4つを超えています。描画されない項目があります。`);
            }

            if (slide.layout === "three-column" && content.columns && content.columns.length > 3) {
                warnings.push(`スライド ${slideNum} (three-column): カラム数が3つを超えています。`);
            }
        }
    });

    if (warnings.length > 0) {
        console.warn("=== Slide QA Warnings ===");
        warnings.forEach(w => console.warn("・" + w));
    } else {
        console.log("Slide QA Passed: 問題は見つかりませんでした。");
    }

    return warnings;
}

module.exports = { validateSlideDefinition };
