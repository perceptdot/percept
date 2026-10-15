# perceptdot

**AI Visual QA.** `visual_check(url)` screenshots a page with Cloudflare Browser Rendering and finds layout bugs with Gemini 2.5 Flash. Use it from any MCP client (Claude Code, Cursor, Windsurf, Cline) or as a GitHub Action.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![perceptdot.com](https://img.shields.io/badge/web-perceptdot.com-black)](https://perceptdot.com)

A typical page takes about 7 seconds, long pages up to ~20 seconds. Fully headless: no desktop or GUI needed.

---

## Quick start

1. Get a free API key at [perceptdot.com](https://perceptdot.com) (100 credits per month, no card).
2. Add the remote MCP server. The key goes in the `X-Percept-Key` header.

**Claude Code**

```bash
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp --header "X-Percept-Key: YOUR_KEY"
```

**Cursor** (`~/.cursor/mcp.json`)

```json
{"mcpServers":{"perceptdot":{"url":"https://mcp.perceptdot.com/mcp","headers":{"X-Percept-Key":"YOUR_KEY"}}}}
```

**Windsurf** (`~/.codeium/windsurf/mcp_config.json`)

```json
{"mcpServers":{"perceptdot":{"serverUrl":"https://mcp.perceptdot.com/mcp","headers":{"X-Percept-Key":"YOUR_KEY"}}}}
```

Then ask your AI: *"Check https://your-site.com with perceptdot"*.

---

## GitHub Action

The action lives in the [`eye-action/`](https://github.com/perceptdot/percept/tree/main/eye-action) folder of this repo.

```yaml
name: Visual QA
on: [pull_request]

jobs:
  visual-check:
    runs-on: ubuntu-latest
    steps:
      - uses: perceptdot/percept/eye-action@v1.0.0
        with:
          url: ${{ steps.deploy.outputs.preview_url }}
          api_key: ${{ secrets.PERCEPT_API_KEY }}
          # fail_on_issue: true   # optional
```

Inputs: `url` (required), `api_key` (required), `fail_on_issue` (optional).

---

## What it checks

- **DOM audit** (deterministic): viewport overflow, broken images, parent overflow, low contrast.
- **AI review**: each tile of the page is reviewed by Gemini 2.5 Flash for layout problems, with severity (high / medium / low).

Desktop (1280px), tablet (768px) and mobile (375px) viewports are supported.

---

## Pricing

1 credit = 1 tile = a 1280×1600 px slice of the page. A short page is about 1 credit, a long landing page about 3–5 credits.

| Plan | Price | Credits / month | Status |
|------|-------|-----------------|--------|
| Free | $0 | 100 (+100 one-time bonus after submitting feedback; resets on the 1st, UTC) | Available |
| Pro | $19/month | 10,000 | Coming Soon |
| Team | $49/month | 30,000 (fair use) | Coming Soon |

Payments are handled by Paddle.

---

## Privacy

Screenshots are not stored. They are sent to Google (Gemini API) and Cloudflare (Workers AI, fallback) for analysis. Analysis results (summary and issues, never screenshots) are cached for up to 10 minutes per URL and viewport. Google may use data sent to unpaid Gemini API tiers to improve its products, so do not check pages that contain personal data.

---

## API

- OpenAPI spec: [perceptdot.com/openapi.json](https://perceptdot.com/openapi.json)
- Docs: <https://perceptdot.gitbook.io/perceptdot>
- Endpoints: `POST /v1/eye/check`, `GET /v1/quota`, `POST /v1/free-key` at `https://api.perceptdot.com`

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: YOUR_KEY" \
  -d '{"url":"https://example.com"}'
```

---

## Legacy packages

`@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry` and `@perceptdot/core` belong to an earlier product and are no longer maintained.

---

## License

MIT. See [LICENSE](LICENSE).
