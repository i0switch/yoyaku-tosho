---
name: pptx-skill
description: Automatically generates Google Slides (PPTX) with brand guidelines from text/JSON.
---

# Google Slides Generator (pptx-skill)

## Overview
This skill generates complete, brand-compliant Google Slides (PPTX format) from JSON content definitions. It leverages a robust layout engine with 47 predefined slide templates.

## Directory Structure
- `lib/render-engine.js`: The core layout factory (47 slide types).
- `lib/shared.js`: The central brand repository (colors, fonts, base components). **Customize this file** for your brand!
- `lib/validate-slide.js`: A mock automated QA script.
- `package.json`: Contains the required `pptxgenjs` dependency.

## Usage Workflow
1. **Understand Request**: When the user asks to "make slides" or "create a presentation", analyze their topic and desired output.
2. **Draft Content**: Create the JSON structure `deckDef` consisting of various slide types (`cover`, `section`, `content`, etc.) and mapped to appropriate `layout` strings (e.g., `kpi-three-col`, `two-col-text-chart`).
3. **Execute**: Write a temporary Node.js script that requires `lib/render-engine.js`, passes the `deckDef` to `renderDeck()`, and calls `.writeFile({ fileName: "Output.pptx" })`.
4. **Iterate**: If the user desires edits, modify the JSON definition and re-run.
5. **Brand Customization**: Prompt the user to modify `lib/shared.js` and provide images for the `assets/` directory to match their company brand.

## Example Temporary Script
```javascript
const { renderDeck } = require('./lib/render-engine');
const deckDef = {
  author: "Cortex",
  slides: [
    { type: "cover", title: "Monthly Report", subtitle: "2026/03", catchphrase: "Growing Together" },
    { type: "content", layout: "kpi-three-col", title: "Highlights", content: { items: [{label: "Users", value:"10K"}] } }
  ]
};

const pres = renderDeck(deckDef);
pres.writeFile({ fileName: "GeneratedSlides.pptx" }).then(() => console.log("Done"));
```
