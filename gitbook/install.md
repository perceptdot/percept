# ⚡ Quick Install

perceptdot works with **Claude Code, Cursor, Windsurf, Cline**, and any MCP-compatible AI tool.\
It also runs as a **GitHub Action** for automated CI/CD visual QA.

---

## Step 1 — Get your free API key

Go to [perceptdot.com](https://perceptdot.com), enter your email, and your **free API key is sent instantly** — no account required.

---

## Option A — MCP Server (AI-assisted development)

### Claude Code

```bash
claude mcp add --transport http perceptdot "https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY"
```

### Cursor

Add to your **MCP settings** (`~/.cursor/mcp.json` or Cursor → Settings → MCP):

```json
{
  "mcpServers": {
    "perceptdot": {
      "url": "https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY"
    }
  }
}
```

### Windsurf

Add to **Windsurf MCP config** (`~/.windsurf/mcp.json`):

```json
{
  "mcpServers": {
    "perceptdot": {
      "url": "https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY"
    }
  }
}
```

### Cline

In Cline → **MCP Servers** → Add Server → HTTP:

```
https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY
```

### Verify it's working

Tell your AI:

```
Check https://example.com with perceptdot
```

If you see a scan result — you're all set! 🎉

---

## Option B — GitHub Action (CI/CD automation)

Automatically check every deployment for visual bugs. No AI tool required.

Add to your workflow (`.github/workflows/deploy.yml`):

```yaml
- name: Visual QA
  uses: perceptdot/eye-action@v1
  with:
    url: ${{ steps.deploy.outputs.url }}   # your deployment URL
    api_key: ${{ secrets.PERCEPT_API_KEY }}
    fail_on_issue: 'false'                 # set 'true' to block on bugs
```

Add your API key as a GitHub secret: **Settings → Secrets → `PERCEPT_API_KEY`**

See [🤖 GitHub Action](github-action.md) for the full guide.

---

{% hint style="info" %}
**Replace `YOUR_KEY`** with the API key you received by email.\
If you didn't receive it, visit [perceptdot.com](https://perceptdot.com) and enter your email again — it'll be resent instantly.
{% endhint %}
