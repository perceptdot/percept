# ⚡ Quick Install

perceptdot works with **Claude Code, Cursor, Windsurf, Cline**, and any MCP-compatible AI tool.

---

## Step 1 — Get your free API key

Go to [perceptdot.com](https://perceptdot.com), enter your email, and your **free API key is sent instantly** — no account required.

---

## Step 2 — Install the MCP server

Pick your tool and run the command:

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

---

## Step 3 — Verify it's working

Tell your AI:

```
Check https://example.com with perceptdot
```

If you see a scan result — you're all set! 🎉

---

{% hint style="info" %}
**Replace `YOUR_KEY`** with the API key you received by email.\
If you didn't receive it, visit [perceptdot.com](https://perceptdot.com) and enter your email again — it'll be resent instantly.
{% endhint %}
