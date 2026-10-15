const { chromium } = require(process.argv[2]);
const path = require("path");
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1800 } });
  for (const n of process.argv.slice(3)) { await p.goto("file://" + path.resolve(n + ".html")); await p.screenshot({ path: n + ".png", fullPage: true }); }
  await b.close(); })();
