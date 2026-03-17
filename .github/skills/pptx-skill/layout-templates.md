# Layout Templates Catalog

This document lists the available 47 layout templates in `render-engine.js` and their expected JSON `content` structure.

## Core Layouts
1. **kpi-three-col**
   - Expected: `{ items: [{ label: string, value: string } * 3] }`
2. **doughnut-three-col**
   - Expected: `{ charts: [{ title: string, labels: string[], values: number[] } * 3] }`
3. **two-col-text-chart**
   - Expected: `{ left: { heading, body, callout }, right: { chartType, data } }`
4. **case-two-col**
   - Expected: `{ companyName, info: [{key, value}], metrics: [{key, value}], highlights: [{label, content}] }`
5. **qa-grid**
   - Expected: `{ items: [{ q: string, a: string } * 4] }`
6. **pricing-table**
   - Expected: `{ headers: [], rows: [] }`
7. **step-flow**
   - Expected: `{ steps: [{ label, description, duration } * 6] }`
8. **logo-wall**
   - Expected: `{ logos: [{ name, path } * N] }`
9. **comparison-table**
   - Expected: `{ beforeTitle, afterTitle, rows: [{ category, before, after }] }`
10. **timeline**
    - Expected: `{ items: [{ date, title, description } * 6] }`
11. **quote**
    - Expected: `{ text, author, role, company }`

*(See `lib/render-engine.js` for the complete list of all 47 layouts and their structure requirements.)*
