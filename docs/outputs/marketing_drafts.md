# perceptdot Marketing Drafts

> Created: 2026-03-21 | Updated: 2026-03-22 (PIVOT-05: @perceptdot/core 피벗 반영)
> Status: Draft v3 — "Your Agent's App Store" 피벗 반영
> Target: Global (English)

---

## 1. Reddit r/ClaudeAI Post

**Title:** I built a B2A2H platform — your agent's app store. One install, it discovers the rest.

**Body:**

I've been using Claude Code full-time for a side project (Korean fortune-telling app, long story). After weeks of the same loop — "check GA4 for me," copy-paste numbers, "now check if Vercel deployed" — I got tired of being my agent's eyeballs.

But there was a second problem: there are 11,000+ MCP servers now. The agent has no idea which ones are relevant to this specific project.

So I built **perceptdot** — starting with `@perceptdot/core`:

```bash
npx -y @perceptdot/core
```

One command. Your agent scans your project (package.json, .env, config files) and auto-recommends which MCP servers to install. I'm calling it your agent's app store.

The discovery output looks like this:

```
Project: /my-app
Signals: 3 deps, 5 env vars
Recommendations:
  @perceptdot/ga4  (GA4_PROPERTY_ID found)   ~450 tokens/call
  PostgreSQL MCP   (DATABASE_URL found)       ~300 tokens/call
  Stripe MCP       (STRIPE_SECRET_KEY found)  ~400 tokens/call
```

Then the service servers give the agent direct read access:

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

- npm: `@perceptdot/core` (start here), `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry`
- Site: [perceptdot.com](https://perceptdot.com)
- GitHub: [github.com/perceptdot](https://github.com/perceptdot)

Would love feedback from anyone using MCP servers with Claude Code. What services would you want your agent to discover and install automatically?

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

**Title:** Show HN: Perceptdot – Your agent's app store. One install, agent discovers the rest.

**Body:**

I've been thinking about two problems at once:

**Problem 1**: AI agents are blind to external services. Claude Code can write code, but it can't check if a deploy succeeded, read analytics, or see production errors without a human copy-pasting data from dashboards.

**Problem 2**: There are 11,000+ MCP servers. The agent has no way to know which ones are relevant to a specific project.

I built perceptdot to solve both.

**Layer 1: `@perceptdot/core` — discovery.** One command: `npx -y @perceptdot/core`. Your agent calls `percept_discover`, which scans the project (package.json, .env, config files) and recommends exactly which MCP servers to install — with ready-made JSON configs. Your agent's app store.

Example output:
```
Project: /my-app
Signals: 3 deps, 5 env vars, 2 configs
Recommendations:
  @perceptdot/ga4    (GA4_PROPERTY_ID found)   ~450 tokens/call
  PostgreSQL MCP     (DATABASE_URL found)       ~300 tokens/call
  Stripe MCP         (STRIPE_SECRET_KEY found)  ~400 tokens/call
Savings: ~1,150 tokens/call across 3 servers
```

**Layer 2: service servers.** `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry` — each gives the agent direct read access to that service. Each call also tracks token savings.

The broader model I'm calling B2A2H: Business → Agent → Human. An agent discovers it, installs it, uses it, measures ROI — then reports to the human: "This tool saved $23 this month. It costs $19. Keep it." The human clicks yes. Done.

1. Give agents direct read access to external services
2. Track token savings on every call (`tokens_saved_estimate` field)
3. Generate ROI reports the agent delivers to the human (`percept_roi_summary`)

Technical details:
- TypeScript MCP servers on npm (`@perceptdot/*`)
- Anthropic's `@modelcontextprotocol/sdk`
- Each server: 3-5 tools, ~200-450 tokens saved per call vs manual copy-paste
- Hono + Cloudflare Workers for the API layer

The numbers are small today ($0.014/session). But I think the pattern matters more than the magnitude. Gartner says 90% of B2B software evaluations will be agent-mediated by 2029. If that's true, the tools that let agents prove their own value win.

Some context on why this matters now: there are 11,000+ MCP servers, but less than 5% are monetized. Nobody has built the "agent recommends, human pays" loop yet. MCP downloads are growing 85% month-over-month.

Open beta: 200 calls/month, free. No account needed.

https://perceptdot.com | https://github.com/perceptdot

---

## 4. Twitter/X Thread (7 tweets)

**Tweet 0 (B2A2H Definition — post this FIRST, standalone):**

I coined a term: B2A2H.

Business → Agent → Human.

The old way (B2H): Company sells to human. Human evaluates. Human buys.

The new way (B2A2H): Company publishes tool. Agent discovers it. Agent uses it. Agent proves ROI. Agent tells human: "Keep paying."

Human clicks yes. Done.

We built the first B2A2H platform: perceptdot.com

#B2A2H #AIAgent #MCP

---

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

I built perceptdot — starting with @perceptdot/core.

Your agent's app store.

```
npx -y @perceptdot/core
```

Agent scans your project. Finds GA4, Vercel, Postgres, Stripe signals. Returns: "Install these 3 MCP servers." With configs ready to copy.

Then the servers give direct read access. No dashboard. No you.

**Tweet 4 (How it works):**

percept_discover result:

```
Signals: GA4_PROPERTY_ID, DATABASE_URL, STRIPE_SECRET_KEY
→ @perceptdot/ga4     ~450 tokens/call
→ PostgreSQL MCP      ~300 tokens/call
→ Stripe MCP          ~400 tokens/call
Total: ~1,150 tokens saved per call
```

Zero manual research. Your agent just knows what it needs.

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

Start here (agent's app store):
npx -y @perceptdot/core

Then install what your project needs:
npx @perceptdot/ga4
npx @perceptdot/vercel
npx @perceptdot/github
npx @perceptdot/sentry

perceptdot.com

Your agent's app store.

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

### 현재 상태 (2026-03-22 PIVOT-05)
- **피벗**: "MCP 서버 제공자" → "에이전트 발견+ROI 레이어" (@perceptdot/core 출시)
- **포지셔닝**: "Your Agent's App Store"
- **핵심 메시지**: "One install. Your agent discovers the rest."
- **사이트**: Open Beta · Free Starter (perceptdot.com)
- **가격**: Pro/Team Coming Soon (TBD), 무료 200 calls/month
- **CTA**: "Get Free API Key" (이메일 입력 → 즉시 발급)
- **리뷰**: 실제 피드백 올 때까지 섹션 자동 숨김
- **npm**: core@0.1.0 (NEW), ga4@0.2.6, vercel@0.1.6, github@0.1.5, sentry@0.1.5

### Posting order recommendation (B2A2H 선점 우선):
1. **Twitter "B2A2H Definition" tweet (Tweet 0)** — 용어 선점 최우선. 지금 즉시.
2. **awesome-mcp-servers PR** — 이미 제출됨, 머지 대기
3. **Hacker News "Show HN: B2A2H"** — 용어 담론 형성 (화/수 US 오전)
4. **Reddit r/ClaudeAI** — B2A2H 앵글로 리프레이밍
5. **Reddit r/cursor** — MCP 유저 타겟
6. **Twitter thread (7 tweets)** — HN/Reddit 반응 후 확장

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
