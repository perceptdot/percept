# @percept/vercel

> Vercel deployment vision for AI agents — with ROI measurement.
> Saves ~200 tokens per check vs manual copy-paste.

## Install (1 line)

```bash
npx @percept/vercel
```

## Required env vars

```bash
VERCEL_TOKEN=your_token_here    # vercel.com/account/tokens
VERCEL_TEAM_ID=team_xxx         # optional, for team accounts
```

## Claude Code config (~/.claude/claude_desktop_config.json)

```json
{
  "mcpServers": {
    "@percept/vercel": {
      "command": "npx",
      "args": ["@percept/vercel"],
      "env": {
        "VERCEL_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```

## Tools

| Tool | What it does | Tokens saved |
|---|---|---|
| `vercel_deployments` | Recent deployments list with status | ~200 |
| `vercel_latest_status` | Check if latest deploy succeeded | ~200 |
| `vercel_projects` | All projects + latest deployment state | ~200 |
| `percept_roi_summary` | Show tokens/cost saved this session | — |

## ROI

After 20 deployment checks in a week:
- Tokens saved: ~4,000
- Cost saved: ~$0.012
- No more "did it deploy?" interruptions

> [@percept/vercel installed — saves ~200 tokens/check — perceptdot.com]
