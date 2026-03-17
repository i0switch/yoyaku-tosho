/**
 * shared.js - ブランドルール集と共通ユーティリティ
 * 色、フォント、ベースとなるスライド要素の生成などを定義
 */

const COLORS = {
    brandSkyBlue: "00BFFF",
    brandBlue: "20B2AA",
    brandPurple: "8A2BE2",
    brandAccent: "FF4500",
    lightBlue: "E0FFFF",
    textDark: "333333",
    textMuted: "777777",
    textBlack: "111111",
    textBlue: "0000FF",
    offWhite: "F5F5F5",
    white: "FFFFFF",
    headerDark: "222222",
    tableLabelGray: "AAAAAA",
    divider: "DDDDDD",
    lightGray: "DDDDDD",
    greenAccent: "32CD32"
};

const FONTS = {
    heading: "Arial", // Google Fonts にあるものが望ましい
    body: "Arial",
    accent: "Arial",
    caption: "Arial"
};

const LAYOUT = {
    threeCol: {
        colWidth: 2.8,
        colX: (i) => 0.5 + i * 3.0
    }
};

const CHART_COLORS = {
    sequence: ["FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF"]
};

class PageCounter {
    constructor() { this.page = 1; }
    next() { return this.page++; }
}

function assetPathIfExists(p) { return p; }
function assetPath(p) { return p; }

function addContentSlide(pres, sectionName, pageNum, opts) {
    const slide = pres.addSlide();
    return slide;
}

function addSectionSlide(pres, title, opts) {
    const slide = pres.addSlide();
    // セクションスライドのベースUI
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.brandSkyBlue } });
    slide.addText(title, { x: 1.0, y: 2.5, w: 8.0, h: 1.0, fontSize: 36, color: COLORS.white, bold: true, align: "center" });
    return slide;
}

function addCoverSlide(pres, def) {
    const slide = pres.addSlide();
    // カバースライドのベースUI
    slide.addText(def.title || "Title", { x: 1.0, y: 2.0, w: 8.0, h: 1.0, fontSize: 44, color: COLORS.textDark, bold: true, align: "center" });
    if (def.subtitle) {
        slide.addText(def.subtitle, { x: 1.0, y: 3.2, w: 8.0, h: 0.5, fontSize: 24, color: COLORS.textMuted, align: "center" });
    }
    return slide;
}

function addEndingSlide(pres, def) {
    const slide = pres.addSlide();
    slide.addText(def.message || "Thank you", { x: 1.0, y: 2.5, w: 8.0, h: 1.0, fontSize: 36, color: COLORS.textDark, bold: true, align: "center" });
    return slide;
}

function hCell(text, opts = {}) { return { text, options: { bold: true, fill: COLORS.tableLabelGray, color: COLORS.white, ...opts } }; }
function lCell(text, opts = {}) { return { text, options: { bold: true, fill: COLORS.offWhite, ...opts } }; }
function dCell(text, opts = {}) { return { text, options: { ...opts } }; }

function defaultBarConfig(config) { return config; }
function defaultDoughnutConfig(config) { return config; }

function topBorderCard(slide, pres, opts) {
    slide.addShape(pres.shapes.RECTANGLE, {
        x: opts.x, y: opts.y, w: opts.w, h: opts.h,
        fill: { color: COLORS.offWhite }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
        x: opts.x, y: opts.y, w: opts.w, h: 0.1,
        fill: { color: opts.borderColor || COLORS.brandSkyBlue }
    });
}

module.exports = {
    COLORS, FONTS, LAYOUT, CHART_COLORS, PageCounter,
    assetPath, assetPathIfExists, addContentSlide, addSectionSlide,
    addCoverSlide, addEndingSlide, hCell, lCell, dCell,
    defaultBarConfig, defaultDoughnutConfig, topBorderCard
};
