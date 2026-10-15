// Local render check: screenshot every page at 1280 width (same as eye) and report scroll width.
const { chromium } = require(process.argv[2]);
const fs = require("fs"), path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1600 } });
  const out = {};
  for (const f of fs.readdirSync("pages").filter((x) => x.endsWith(".html")).sort()) {
    await p.goto("file://" + path.resolve("pages", f));
    out[f] = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }));
    await p.screenshot({ path: "shots/" + f.replace(".html", ".png") });
  }
  console.log(JSON.stringify(out));
  await b.close();
})();
