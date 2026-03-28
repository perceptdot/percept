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

Add it to the MCP server URL as a query parameter:

```
https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY
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

## Why does it take 5–20 seconds?

Page height determines the number of tiles. A short landing page = 1 tile (~5s). A long documentation page = multiple tiles (~20s). Cached results return in under 0.3s.

---

## What is a tile?

perceptdot splits tall pages into 1280×1600px sections (tiles) for analysis.\
Short pages = 1 tile. Long pages = multiple tiles.\
**1 tile = 1 credit.** The scan output always shows how many tiles were analyzed.

---

## Can I use perceptdot in CI/CD without an AI tool?

Yes — use the **GitHub Action**. It runs automatically on every deployment and posts results to your workflow summary.

```yaml
- uses: perceptdot/eye-action@v1
  with:
    url: ${{ steps.deploy.outputs.url }}
    api_key: ${{ secrets.PERCEPT_API_KEY }}
```

See [🤖 GitHub Action](github-action.md) for the full setup guide.

---

## I'm getting false positives

Sometimes the AI flags intentional design choices as issues. Use `no_cache: true` to re-run, or simply ignore the report if it doesn't match what you see.\
You can also send feedback (`percept_feedback`) to help improve detection accuracy.

---

## I entered my email but didn't receive a key

Visit [perceptdot.com](https://perceptdot.com) and enter your email again — the key will be **resent instantly**. Check your spam folder too.

---

## Something's wrong — where do I get help?

📧 Email us at **service@perceptdot.com** — we respond quickly.
