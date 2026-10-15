// Sanity check on real sites: which issues do the new geometry checks (types 5-8) add on top of the old audit?
// Usage: node real_sites.cjs <playwright module path> <index.ts path> <url>...
const { chromium } = require(process.argv[2]);
const fs = require("fs");
const src = fs.readFileSync(process.argv[3], "utf8");
const domScript = src.match(/const domScript = `([\s\S]*?)`;/)[1].replace(/\\\\/g, "\\");
const domScriptNoCap = domScript.replace("return issues.slice(0, 15);", "return issues;");
const NEW = ["text_overflow", "clipped_text", "fixed_cover", "element_overlap"];
(async () => {
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  for (const url of process.argv.slice(4)) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    try {
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await p.waitForTimeout(2500);
      const t0 = Date.now();
      const issues = await p.evaluate(domScriptNoCap); // uncapped so the 15-issue limit cannot hide new-type findings
      const ms = Date.now() - t0;
      const added = issues.filter((i) => NEW.includes(i.type) || i.type === "audit_error");
      console.log(url, `audit ${ms}ms`, "old-type issues:", issues.length - added.length, "new-type:", added.length);
      for (const i of added) console.log("   ", i.type, i.selector, "—", i.detail);
    } catch (e) { console.log(url, "ERR", String(e).slice(0, 80)); }
    await p.close();
  }
  await b.close();
})();
