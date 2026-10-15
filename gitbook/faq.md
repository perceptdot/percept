# ❓ FAQ

---

## Which AI tools does perceptdot work with?

Any **MCP-compatible** AI tool: Claude Code, Cursor, Windsurf, Cline, and more.\
As long as the tool supports HTTP MCP servers, perceptdot works out of the box.

---

## Do I need to create an account?

No. Just enter your email at [perceptdot.com](https://perceptdot.com) and your API key is sent immediately. No signup, no password.

---

## Where do I put my API key?

Send it in the `X-Percept-Key` header of the MCP server, for example in Claude Code:

```
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp --header "X-Percept-Key: YOUR_KEY"
```

See [⚡ Quick Install](install.md) for tool-specific instructions.

---

## Can I check any website?

Any publicly accessible website works. Pages that require login or are behind a firewall may not be fully analyzed.

---

## What viewports are supported?

Three options: **desktop** (1280px, default), **tablet** (768px), **mobile** (375px).

Tell your AI: *"Check https://mysite.com on mobile"* — the agent will use the `viewport` parameter automatically.

---

## How long does a check take?

About 7 seconds for a typical page, up to ~20 seconds for long pages. Page height determines the number of tiles. Cached results (kept up to 10 minutes per URL and viewport) return in under 0.3s.

---

## What is a tile?

perceptdot splits tall pages into 1280×1600px sections (tiles) for analysis.\
Short pages = 1 tile. Long pages = multiple tiles.\
**1 tile = 1 credit.** A short page is about 1 credit, a long landing page about 3–5 credits. The scan output always shows how many tiles were analyzed.

---

## Do you store my screenshots?

No. Screenshots are sent to Google (Gemini API) and, as a fallback, Cloudflare (Workers AI) for analysis, and are not stored. Only the analysis result (summary and issues, never the screenshot) is cached for up to 10 minutes per URL and viewport to speed up repeat checks. Google may use data sent to unpaid Gemini API tiers to improve its products, so please do not check pages that contain personal data.

---

## How much does it cost?

Free: 100 credits per month, no card (+100 one-time bonus after submitting feedback). Pro ($19/month, 10,000 credits) and Team ($49/month, 30,000 credits, fair use) are Coming Soon. See [Pricing](pricing.md).

---

## Can I use perceptdot in CI/CD without an AI tool?

Yes — use the **GitHub Action**. It runs automatically on every deployment and posts results to your workflow summary.

```yaml
- uses: perceptdot/percept/eye-action@v1.0.0
  with:
    url: ${{ steps.deploy.outputs.url }}
    api_key: ${{ secrets.PERCEPT_API_KEY }}
```

See [🤖 GitHub Action](github-action.md) for the full setup guide.

---

## I'm getting false positives

Sometimes the AI flags intentional design choices as issues. Use `no_cache: true` to re-run, or simply ignore the report if it doesn't match what you see.\
You can also send us feedback to help improve detection accuracy.

---

## I entered my email but didn't receive a key

Visit [perceptdot.com](https://perceptdot.com) and enter your email again — the key will be **resent instantly**. Check your spam folder too.

---

## Something's wrong — where do I get help?

📧 Email us at **service@perceptdot.com** — we respond quickly.
