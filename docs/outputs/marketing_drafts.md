# perceptdot Marketing Drafts

> Created: 2026-03-21 | Updated: 2026-03-22
> Status: Draft v2 — Beta 전환 반영
> Target: Global (English)

---

## 1. Reddit r/ClaudeAI Post

**Title:** I gave my Claude Code agent eyes. It now reads GA4, Vercel, and GitHub on its own.

**Body:**

I've been using Claude Code full-time for a side project (Korean fortune-telling app, long story). After weeks of the same loop — "check GA4 for me," copy-paste numbers, "now check if Vercel deployed" — I got tired of being my agent's eyeballs.

So I built **perceptdot**: MCP servers that let your agent directly read external services. No dashboard. No copy-paste. The agent just... sees.

**What it does:**

- `@perceptdot/ga4` — Agent reads realtime users, top pages, events, bounce rate. Saves ~450 tokens per call vs you pasting screenshots.
- `@perceptdot/vercel` — Agent checks deployment status, project list, latest deploy. No more "did it deploy?" interruptions.
- `@perceptdot/github` — Agent reads open PRs, issues, CI workflow status.
- `@perceptdot/sentry` — Agent reads error logs directly.

**Setup is 60 seconds.** Add to your MCP config:

```json
{
  "mcpServers": {
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["@perceptdot/ga4"],
      "env": {
        "GA4_PROPERTY_ID": "YOUR_ID",
        "GOOGLE_SERVICE_ACCOUNT_KEY": "YOUR_JSON"
      }
    }
  }
}
```

That's it. Next time you ask Claude Code anything about your analytics, it reads GA4 directly instead of asking you to open a browser.

**The part I'm most proud of:** Every package has a built-in ROI tracker. After a session, run `percept_roi_summary` and the agent tells you exactly how many tokens and how much time it saved. Mine reported ~4,500 tokens saved after 10 GA4 queries in one session.

The idea is simple: if the agent can prove its own ROI, you never need to justify the tool to anyone. The agent does it for you.

It's in open beta right now. 200 free calls/month — just enter your email on the site and you get an API key instantly. No credit card, no account.

- npm: `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry`
- Site: [perceptdot.com](https://perceptdot.com)
- GitHub: [github.com/perceptdot](https://github.com/perceptdot)

Would love feedback from anyone using MCP servers with Claude Code. What services would you want your agent to see next?

---

## 2. Reddit r/cursor Post

**Title:** MCP setup that lets Cursor read GA4, Vercel, GitHub, and Sentry directly — no more copy-pasting dashboards

**Body:**

If you're using Cursor with MCP, here's something that killed a recurring annoyance for me: constantly being the middleman between my agent and external services.

**The problem:**

Agent asks "what's the traffic looking like?" You open GA4. Copy numbers. Paste. Agent asks "did deploy succeed?" You open Vercel. Copy status. Paste. Repeat forever.

**The fix:**

[perceptdot](https://perceptdot.com) — MCP servers that give your agent direct read access to GA4, Vercel, GitHub, and Sentry.

**Cursor MCP config** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["@perceptdot/ga4"],
      "env": {
        "GA4_PROPERTY_ID": "123456789",
        "GOOGLE_SERVICE_ACCOUNT_KEY": "{...}"
      }
    },
    "@perceptdot/vercel": {
      "command": "npx",
      "args": ["@perceptdot/vercel"],
      "env": {
        "VERCEL_TOKEN": "your_token"
      }
    },
    "@perceptdot/github": {
      "command": "npx",
      "args": ["@perceptdot/github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxx",
        "GITHUB_OWNER": "your-org",
        "GITHUB_REPO": "your-repo"
      }
    },
    "@perceptdot/sentry": {
      "command": "npx",
      "args": ["@perceptdot/sentry"],
      "env": {
        "SENTRY_AUTH_TOKEN": "your_token",
        "SENTRY_ORG": "your-org",
        "SENTRY_PROJECT": "your-project"
      }
    }
  }
}
```

**What happens after setup:**

- "Check today's traffic" → Agent reads GA4 directly. No browser needed.
- "Did the last deploy succeed?" → Agent checks Vercel. Tells you in 2 seconds.
- "Any open PRs?" → Agent reads GitHub. Lists them with review status.
- "Any new errors in production?" → Agent reads Sentry. Shows unresolved issues.

Each call saves ~200-450 tokens compared to you pasting dashboard data into context. There's a built-in ROI tracker (`percept_roi_summary`) that shows exactly how much was saved per session.

Open beta — 200 free calls/month. Enter your email, get an API key, done.

npm packages: `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry`

Site: [perceptdot.com](https://perceptdot.com)

Paid plans (Pro/Team) coming soon. Free tier is generous enough to try everything.

Anyone else doing MCP integrations in Cursor? Curious what services people want connected.

---

## 3. Hacker News "Show HN" Post

**Title:** Show HN: Perceptdot -- MCP servers that give AI agents direct access to GA4, Vercel, GitHub

**Body:**

I kept hitting the same wall using Claude Code and Cursor: the agent can write code, but it can't see anything outside the codebase. It can't check if a deploy succeeded. It can't read analytics. It can't see production errors. So I become the agent's eyes — copying data from dashboards, pasting into context, burning tokens on information transfer.

Perceptdot is a set of MCP servers that solve this. Each one connects an external service (GA4, Vercel, GitHub, Sentry) directly to the agent via the Model Context Protocol.

Technical details:

- TypeScript MCP servers, published on npm as `@perceptdot/*`
- Uses Anthropic's official `@modelcontextprotocol/sdk`
- Each server exposes 3-5 tools (e.g., `ga4_realtime`, `ga4_overview`, `vercel_latest_status`)
- Every tool call includes token-savings metadata — the agent tracks how many tokens it saved vs. the manual copy-paste baseline
- Built-in `percept_roi_summary` tool that reports cumulative savings per session
- No account needed. API key only. No dashboard.

The ROI tracking is the part I find most interesting architecturally. In a B2A2H model (business-to-agent-to-human), the agent needs to justify its own tooling to the human who pays. So every perceptdot MCP call returns a `tokens_saved_estimate` field. After a session, the agent can say: "I saved ~4,500 tokens ($0.014) and ~25 minutes by reading GA4 directly instead of waiting for you to paste data."

It's small numbers today, but the pattern matters: the agent proves ROI to the human, the human keeps paying. No sales team required.

Stack: TypeScript + Hono (Cloudflare Workers for the API layer) + npm for distribution.

Open beta: 200 calls/month, free. Pro and Team plans coming soon.

https://perceptdot.com

Source: https://github.com/perceptdot

---

## 4. Twitter/X Thread (7 tweets)

**Tweet 1 (Hook):**

Your AI agent is blind.

It writes code, deploys apps, debugs errors — but it can't see GA4. Can't check if deploys succeeded. Can't read production errors.

You are its eyeballs. And that's a waste of both of you.

**Tweet 2 (Problem):**

The daily loop:

Agent: "What's the traffic?"
You: *opens GA4, copies numbers, pastes*

Agent: "Did the deploy work?"
You: *opens Vercel, checks, types status*

Agent: "Any new errors?"
You: *opens Sentry, scrolls, summarizes*

You're a human clipboard.

**Tweet 3 (Solution):**

I built perceptdot — MCP servers that give AI agents direct access to external services.

GA4. Vercel. GitHub. Sentry.

The agent reads them itself. No dashboard. No copy-paste. No you.

60 seconds to set up. One JSON config. Done.

**Tweet 4 (How it works):**

```json
"@perceptdot/ga4": {
  "command": "npx",
  "args": ["@perceptdot/ga4"]
}
```

That's the entire setup.

Now your Claude Code / Cursor agent can:
- Check realtime users
- Read top pages
- Pull event counts
- Monitor bounce rates

Directly. ~450 tokens saved per call.

**Tweet 5 (The ROI angle):**

Here's what makes it different from other MCP integrations:

Every call tracks ROI automatically.

After a session, ask your agent: "How much did perceptdot save?"

It answers with exact numbers:
- Tokens saved: 4,500
- Time saved: 25 min
- Cost saved: $0.014

The agent justifies its own tools. To you.

**Tweet 6 (The bigger picture):**

The future of dev tools isn't "better dashboards for humans."

It's no dashboards at all.

Your agent reads the data. Your agent makes the report. Your agent recommends what to do.

You just decide.

That's what we're building at perceptdot.

**Tweet 7 (CTA):**

Open beta — 200 calls/month. No credit card. No account.

npx @perceptdot/ga4
npx @perceptdot/vercel
npx @perceptdot/github
npx @perceptdot/sentry

perceptdot.com

Give your agent eyes.

#MCP #ClaudeCode #AIAgent #DevTools #Cursor

---

## 5. Twitter/X Single Tweet (Viral)

**Option A:**

Your AI agent writes code, deploys apps, and debugs prod — but it can't check GA4 without you opening a browser and copy-pasting like it's 2019.

perceptdot fixes that. MCP servers that give agents direct access to GA4, Vercel, GitHub, Sentry.

60s setup. No dashboard. Open beta — free.

perceptdot.com

**Option B (shorter, punchier):**

Checking dashboards so your AI agent doesn't have to is not a job.

perceptdot = MCP servers that let agents read GA4, Vercel, GitHub, and Sentry directly. 60s setup. ~450 tokens saved per call.

Open beta — 200 free calls: perceptdot.com

**Option C (maximum hook):**

You are your AI agent's eyeballs.

Every time it asks "what's the traffic?" and you open GA4 to copy-paste numbers — that's you being a human clipboard.

perceptdot gives agents direct access. GA4, Vercel, GitHub, Sentry. 60 seconds. No dashboard. Open beta.

perceptdot.com

---

## Notes for CEO

### 현재 상태 (2026-03-22)
- **사이트**: Open Beta · Free Starter (perceptdot.com)
- **가격**: Pro/Team Coming Soon (TBD), 무료 200 calls/month
- **CTA**: "Get Free API Key" (이메일 입력 → 즉시 발급)
- **리뷰**: 실제 피드백 올 때까지 섹션 자동 숨김
- **npm**: ga4@0.2.5, vercel@0.1.5, github@0.1.4, sentry@0.1.4

### Posting order recommendation:
1. **awesome-mcp-servers PR** — 먼저 제출 (83.7k 스타, 자연 유입)
2. **Twitter single tweet** (Option B or C) — hook 테스트
3. **Twitter thread** — single tweet 반응 있으면
4. **Reddit r/ClaudeAI** — highest intent audience
5. **Reddit r/cursor** — second highest intent
6. **Hacker News** — highest risk/reward, 화/수 오전 US time

### Key phrases that tested well in drafting:
- "Your AI agent is blind" — strongest hook
- "Human clipboard" — visceral, relatable
- "The agent justifies its own tools" — the B2A2H differentiator
- "No dashboard" — counter-intuitive for a monitoring tool
- "60 seconds" — removes friction objection
- "Open beta — free" — zero friction CTA

### What to avoid:
- Don't say "revolutionary" or "game-changing" — HN and Reddit will downvote
- Don't compare to Composio by name in public posts — looks insecure
- Don't oversell the cost savings ($0.014/session) — be honest, frame it as "the pattern matters"
- Don't use "AI-powered" — perceptdot IS the tool for AI, not powered by it
- Don't mention specific paid pricing (Pro $19/mo etc.) — Coming Soon 상태
