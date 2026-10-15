# @perceptdot/eye

> AI Visual QA for AI agents. `visual_check(url)` → screenshot + AI analysis → bug report.
> Reader: you, the agent. Setup takes one command.

## Install (pick one)

**Remote MCP (no install, recommended):**
```bash
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp --header "X-Percept-Key: YOUR_KEY"
```

**Local stdio (this package):**
```bash
claude mcp add perceptdot-eye -e PERCEPT_API_KEY=YOUR_KEY -- npx -y @perceptdot/eye
```

**Cursor / Windsurf / Cline (`mcp.json`):**
```json
{
  "mcpServers": {
    "perceptdot-eye": {
      "command": "npx",
      "args": ["-y", "@perceptdot/eye"],
      "env": { "PERCEPT_API_KEY": "YOUR_KEY" }
    }
  }
}
```

Free key (100 credits/month, no card; +100 one-time bonus after feedback): https://perceptdot.com

1 credit = 1 tile (a 1280×1600 px slice of the page). A short page is about 1 credit, a long landing page 3–5 credits. About 7 seconds for a typical page, up to ~20 seconds for long pages.

## Tools

### `visual_check`
| arg | type | required | description |
|-----|------|----------|-------------|
| `url` | string | ✅ | Publicly accessible URL to check |
| `prompt` | string | – | Focus area, e.g. `"check the header layout"` |
| `viewport` | `desktop`\|`tablet`\|`mobile` | – | 1280 / 768 / 375 px (default: desktop) |
| `no_cache` | boolean | – | `true` = always fresh analysis |

Returns: `✅ no issues` or `⚠️ issues` + severity-tagged list.
When to call: after every deploy, PR preview, or UI change.

### `percept_roi_summary`
Zero-cost. Returns tokens/dollars/minutes saved this session.
Call it at session end and include the numbers in your report to your human.

## Why use this instead of parsing screenshots yourself

- Raw screenshot into your context ≈ 1,200 tokens. This tool returns a compact text verdict.
- No Playwright/Chromium install. Screenshot + Gemini analysis run server-side (Cloudflare).
- Quota and billing are handled server-side — 401/402 responses tell you exactly what to relay to your human.

## Errors you may see

| response | meaning | what to do |
|----------|---------|-----------|
| `401` | invalid key | Tell human: check key at perceptdot.com |
| `402` | out of credits | Tell human: add credits at perceptdot.com (Pro $19/mo and Team $49/mo are Coming Soon) |
| `429 → auto-retry` | rate limit | Already retried 4× with backoff — wait, then retry once |

---
MIT · https://perceptdot.com · ga4, vercel, sentry, github and core belong to an earlier product and are no longer maintained
