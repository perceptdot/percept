// Offline re-measurement of eye's DOM audit on the 50 benchmark pages.
// Runs the exact domScript string from api/src/index.ts in Chromium at eye's desktop viewport (1280x800),
// then merges it with the AI issues that production eye returned for each page (eye/<id>.json),
// mirroring the merge in /v1/eye/check: flagged = DOM issues present OR AI issues present.
// Usage: node dom_bench.cjs <playwright module path> <index.ts path> <out.json>
const { chromium } = require(process.argv[2]);
const fs = require("fs"), path = require("path");

const src = fs.readFileSync(process.argv[3], "utf8");
const m = src.match(/const domScript = `([\s\S]*?)`;/);
if (!m) throw new Error("domScript not found");
const domScript = m[1].replace(/\\\\/g, "\\"); // template literal: \\ -> \

(async () => {
  const truth = JSON.parse(fs.readFileSync(path.join(__dirname, "truth.json"), "utf8"));
  const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const rows = [];
  for (const t of truth) {
    await p.goto("file://" + path.join(__dirname, "pages", t.id + ".html"), { waitUntil: "load" });
    const dom = await p.evaluate(domScript);
    const prod = JSON.parse(fs.readFileSync(path.join(__dirname, "eye", t.id + ".json"), "utf8"));
    const ai = (prod.issues || []).filter((i) => !String(i.description).startsWith("[DOM]"));
    rows.push({ id: t.id, kind: t.kind, bug: t.bug, trick: t.trick, has_bug: t.has_bug,
                flag: dom.length > 0 || ai.length > 0, dom, ai_issues: ai.length });
  }
  await b.close();
  const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const r of rows) c[r.has_bug ? (r.flag ? "tp" : "fn") : (r.flag ? "fp" : "tn")]++;
  const report = { ...c, recall: +(c.tp / (c.tp + c.fn)).toFixed(3), precision: +(c.tp / Math.max(1, c.tp + c.fp)).toFixed(3) };
  fs.writeFileSync(process.argv[4], JSON.stringify({ report, rows }, null, 1));
  console.log(JSON.stringify(report));
  for (const r of rows) {
    const ok = r.has_bug === r.flag ? " " : "X";
    console.log(ok, r.id.padEnd(13), (r.bug || r.trick || r.kind).padEnd(16), r.flag ? "FLAG" : "-   ",
                r.dom.map((d) => d.type + ":" + d.selector + " (" + d.detail + ")").join(" | ").slice(0, 230));
  }
})();
