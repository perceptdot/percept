# Reddit 댓글 템플릿

## 1. "will MCP be dead soon?" (r/ClaudeCode)

The context bloat argument is valid for general-purpose MCP servers that dump huge payloads. But well-designed ones actually reduce context — that's the whole point.

Example: I built MCP servers for GA4/Vercel/GitHub. Before MCP, checking analytics meant: human opens browser → screenshots dashboard → pastes into conversation → agent parses image (~2000 tokens). With MCP, the agent calls ga4_realtime directly and gets structured JSON back (~200 tokens). 10x less context, not more.

The problem isn't the protocol — it's that most of the 11,000+ MCP servers are poorly designed and return way too much data. The protocol itself is just stdin/stdout JSON-RPC. Hard to get simpler than that.

Perplexity moving to APIs makes sense for their use case (web search at scale), but for dev tooling where you need the agent to check deployments, read errors, query analytics — MCP is still the cleanest integration path.

---

## 2. "MCP is NOT dead. But a lot of MCP servers should be." (r/ClaudeAI)

This is exactly why I built a discovery layer. There are 11,000+ MCP servers now and most are garbage. The real problem isn't MCP itself — it's that agents have no way to find the good ones.

I made percept_discover — it scans your project (package.json, .env, configs) and recommends only the servers that actually match your stack. No browsing registries manually.

Quality filtering is the missing piece.

---

## 3. "I cannot, for the life of me, understand the value of MCPs" (r/ClaudeAI)

The value clicked for me when I stopped copy-pasting GA4 screenshots into Claude. I built an MCP server that gives Claude direct read access to my analytics — realtime users, top pages, bounce rate. One tool call vs. open browser → screenshot → paste → explain.

Saved about 450 tokens per query. Over a full session that adds up fast. The protocol itself isn't exciting — what's exciting is the agent not needing you as a clipboard anymore.
