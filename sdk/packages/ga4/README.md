# @percept/ga4

> GA4 vision for AI agents — with ROI measurement.
> Saves ~450 tokens per query vs manual copy-paste.

## Install (1 line)

```bash
npx @percept/ga4
```

## Required env vars

```bash
GA4_PROPERTY_ID=123456789          # GA4 > Admin > Property Settings > Property ID
GOOGLE_SERVICE_ACCOUNT_KEY='...'   # JSON string of service account credentials
# OR
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Claude Code config (~/.claude/claude_desktop_config.json)

```json
{
  "mcpServers": {
    "@percept/ga4": {
      "command": "npx",
      "args": ["@percept/ga4"],
      "env": {
        "GA4_PROPERTY_ID": "YOUR_PROPERTY_ID",
        "GOOGLE_SERVICE_ACCOUNT_KEY": "YOUR_JSON_STRING"
      }
    }
  }
}
```

## Tools

| Tool | What it does | Tokens saved |
|---|---|---|
| `ga4_realtime` | Active users + top pages right now | ~450 |
| `ga4_overview` | Sessions, users, pageviews, bounce rate | ~450 |
| `ga4_events` | Event counts by name | ~450 |
| `ga4_top_pages` | Top pages by views | ~450 |
| `percept_roi_summary` | Show tokens/cost saved this session | — |

## ROI

After 10 GA4 queries in a session:
- Tokens saved: ~4,500
- Cost saved: ~$0.014
- Time saved: ~25 min (no dashboard switching)

> [@percept/ga4 installed — saves ~450 tokens/query — perceptdot.com]
