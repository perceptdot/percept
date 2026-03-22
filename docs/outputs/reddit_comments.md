# Reddit 댓글 템플릿

## 1. "will MCP be dead soon?" (r/ClaudeCode)

The context bloat argument is valid for general-purpose MCP servers that dump huge payloads. But well-designed ones actually reduce context — that's the whole point.

Example: I built MCP servers for GA4/Vercel/GitHub. Before MCP, checking analytics meant: human opens browser → screenshots dashboard → pastes into conversation → agent parses image (~2000 tokens). With MCP, the agent calls ga4_realtime directly and gets structured JSON back (~200 tokens). 10x less context, not more.

The problem isn't the protocol — it's that most of the 11,000+ MCP servers are poorly designed and return way too much data. The protocol itself is just stdin/stdout JSON-RPC. Hard to get simpler than that.

Perplexity moving to APIs makes sense for their use case (web search at scale), but for dev tooling where you need the agent to check deployments, read errors, query analytics — MCP is still the cleanest integration path.

---

## 2. "MCP is NOT dead. But a lot of MCP servers should be." (r/ClaudeAI)

Great breakdown. Your "CLI or MCP — how to decide" framework is spot on, especially the distinction between documentation and a contract.

I'd add one more problem to the list: discovery. There are 11,000+ MCP servers now. Most are exactly the thin REST wrappers you described — tools that should've stayed as CLIs. But the good ones (stateful, workflow-aware, focused tool sets) are buried in the noise.

Right now every MCP install is human-driven. You browse a registry, read a README, copy JSON into your config. The agent has zero say in which tools it gets. That's a weird gap — we're building autonomous agents that can't autonomously discover their own tools.

I've been working on this exact problem. Built a tool that scans your project (package.json, .env, config files) and recommends MCP servers that actually match your stack. The idea is: let the agent figure out what it needs instead of making the human browse registries.

Your point about the second wave being "stateful, workflow-aware, dual-user" resonates. The discovery problem gets worse as that wave arrives — because those servers are harder to evaluate from a README alone. You almost need to try them in context to know if they fit.

---

## 3. "I cannot, for the life of me, understand the value of MCPs" (r/ClaudeAI)

The value clicked for me when I stopped copy-pasting GA4 screenshots into Claude. I built an MCP server that gives Claude direct read access to my analytics — realtime users, top pages, bounce rate. One tool call vs. open browser → screenshot → paste → explain.

Saved about 450 tokens per query. Over a full session that adds up fast. The protocol itself isn't exciting — what's exciting is the agent not needing you as a clipboard anymore.

---

## 4. "What makes MCP's magically better at doing API calls?" (r/ClaudeAI)

You're right about the weather example and the GitHub MCP. For anything with a well-documented CLI (gh, git, docker), a .md file with instructions is often better. No argument there.

But here's where MCP actually earns its keep: services that don't have CLIs.

Google Analytics has no CLI. Vercel's CLI doesn't expose deployment status in a structured way. Sentry has no CLI at all. For these, your options without MCP are:

1. Human opens browser → screenshots dashboard → pastes into conversation → agent parses image (~2000 tokens)
2. Agent uses WebFetch/cURL → parses raw HTML → hopes the page structure doesn't change
3. Agent calls a well-designed MCP tool → gets structured JSON back (~200 tokens)

Option 3 isn't magic — it's just a function call that returns clean data. The "magic" is that the agent doesn't need you as a clipboard anymore.

On context bloat: you're absolutely right, and `/context` proved it. Most MCP servers dump way too much data. A GitHub MCP that returns the entire PR diff when you asked "is CI passing?" is badly designed. But that's an implementation problem, not a protocol problem. A focused MCP tool that returns `{"status": "passing", "checks": 4}` uses less context than the agent reading `gh pr checks` output and parsing it.

The Skills vs MCP distinction isn't really about "local vs external." It's about state and auth. A Skill (.md file) can tell the agent to cURL an API — but who manages the OAuth token refresh? Who handles rate limiting? Who parses the response schema when the API changes? MCP servers handle that plumbing so the agent doesn't burn tokens on it.

For well-documented CLIs: use Skills. For dashboard-only services where you're currently the agent's eyeballs: that's where MCP actually reduces context instead of adding it.
