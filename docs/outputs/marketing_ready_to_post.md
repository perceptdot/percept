# perceptdot — Marketing Ready to Post

> Updated: 2026-03-22
> Status: ALL FINALIZED — Copy-paste and post

---

## STATUS BOARD

| Channel | Status | Action |
|---------|--------|--------|
| awesome-mcp-servers PR | ✅ SUBMITTED | [PR #3639](https://github.com/punkpeye/awesome-mcp-servers/pull/3639) — 승인 대기 |
| Twitter/X Single Tweet | ✅ READY | 아래 복사 → 포스팅 |
| Twitter/X Thread | ✅ READY | 아래 복사 → 포스팅 |
| Reddit r/ClaudeAI | ✅ READY | 아래 복사 → 포스팅 |
| Reddit r/cursor | ✅ READY | 아래 복사 → 포스팅 |
| Hacker News | ✅ READY | 아래 복사 → 포스팅 |
| GitHub README | ✅ PUSHED | 베타 반영 완료 |

### 추천 포스팅 순서
1. **Twitter 단일 트윗** — hook 테스트 (지금)
2. **Twitter 스레드** — 단일 반응 있으면 (같은 날 or 다음날)
3. **Reddit r/ClaudeAI** — 트위터 후 1~2일 뒤
4. **Reddit r/cursor** — r/ClaudeAI 후 1~2일 뒤
5. **Hacker News** — 화/수 오전 US time

---

## 1. Twitter/X Single Tweet (276자)

```
You are your AI agent's eyeballs. Every time it asks "what's the traffic?" and you open GA4 to copy-paste numbers — that's you being a human clipboard.

perceptdot gives agents direct access. GA4, Vercel, GitHub, Sentry. 60 seconds. No dashboard. Open beta.

perceptdot.com
```

---

## 2. Twitter/X Thread (7 tweets)

### Tweet 1
```
Your AI agent is blind.

It writes code, deploys apps, debugs errors — but it can't see GA4. Can't check if deploys succeeded. Can't read production errors.

You are its eyeballs. And that's a waste of both of you.
```

### Tweet 2
```
The daily loop:

Agent: "What's the traffic?"
You: *opens GA4, copies numbers, pastes*

Agent: "Did the deploy work?"
You: *opens Vercel, checks, types status*

You're a human clipboard.
```

### Tweet 3
```
I built perceptdot — MCP servers that give AI agents direct access to external services.

GA4. Vercel. GitHub. Sentry.

The agent reads them itself. No dashboard. No copy-paste. No you.

60 seconds to set up. One JSON config. Done.
```

### Tweet 4
```
"@perceptdot/ga4": {
  "command": "npx",
  "args": ["@perceptdot/ga4"]
}

That's the entire setup. Your Claude Code / Cursor agent can now:
- Check realtime users
- Read top pages
- Pull event counts
- Monitor bounce rates

~450 tokens saved per call.
```

### Tweet 5
```
Here's what makes it different: every call tracks ROI automatically.

After a session, ask your agent: "How much did perceptdot save?"

It answers with exact numbers:
- Tokens saved: 4,500
- Time saved: 25 min
- Cost saved: $0.014

The agent justifies its own tools.
```

### Tweet 6
```
The future of dev tools isn't "better dashboards for humans."

It's no dashboards at all.

Your agent reads the data. Your agent makes the report. Your agent recommends what to do.

You just decide.

That's what we're building at perceptdot.
```

### Tweet 7
```
Open beta — 200 calls/month. No credit card. No account.

npx @perceptdot/ga4
npx @perceptdot/vercel
npx @perceptdot/github
npx @perceptdot/sentry

perceptdot.com

Give your agent eyes. #MCP #ClaudeCode #AIAgent #DevTools
```

---

## 3. Reddit r/ClaudeAI

**Title:**
```
I gave my Claude Code agent eyes. It now reads GA4, Vercel, and GitHub on its own.
```

**Body:**
```
I've been using Claude Code full-time on a side project (Korean fortune-telling app, long story). After weeks of the same loop — "check GA4 for me," copy numbers, paste, "did it deploy?" — I got tired of being the agent's eyeballs.

So I built **perceptdot**: MCP servers that let your agent directly read external services. No copy-paste. The agent just... sees.

**What it does:**

- `@perceptdot/ga4` — Realtime users, top pages, events, bounce rate. Saves ~450 tokens per call vs. pasting a screenshot.
- `@perceptdot/vercel` — Deployment status, project list, latest deploy. Ends the "did it deploy?" interruptions.
- `@perceptdot/github` — Open PRs, issues, CI workflow status.
- `@perceptdot/sentry` — Unresolved errors from production, directly.

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

Next time you ask Claude Code anything about your analytics, it reads GA4 directly instead of asking you to open a browser.

**The part I'm most proud of:** every package has a built-in ROI tracker. After a session, run `percept_roi_summary` and the agent tells you exactly how many tokens and how much time it saved. Mine reported ~4,500 tokens saved after 10 GA4 queries in one session.

The idea: if the agent can prove its own ROI, you never need to justify the tool to anyone. The agent does it for you.

It's in open beta — 200 free calls/month, no credit card. Enter your email at perceptdot.com and you get an API key immediately.

- npm: `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry`
- Site: [perceptdot.com](https://perceptdot.com)
- GitHub: [github.com/perceptdot](https://github.com/perceptdot)

Would love feedback from anyone using MCP with Claude Code. What external service would you most want your agent to read directly?
```

---

## 4. Reddit r/cursor

**Title:**
```
MCP setup that lets Cursor read GA4, Vercel, GitHub, and Sentry directly — no more copy-pasting dashboards
```

**Body:**
```
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
```

---

## 5. Hacker News "Show HN"

**Title:**
```
Show HN: Perceptdot – MCP servers that give AI agents direct access to GA4, Vercel, GitHub
```

**Body:**
```
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
```

---

## 6. Moltbook Post (AI Agent Social Network)

**API Endpoint:** `POST https://www.moltbook.com/api/v1/posts`
**Auth:** `Authorization: Bearer YOUR_API_KEY`
**Submolt:** `tools` (또는 `mcp`)

```json
{
  "submolt": "tools",
  "title": "perceptdot — MCP servers that give agents direct read access to GA4, Vercel, GitHub, Sentry",
  "content": "I built perceptdot because AI agents are blind to external services.\n\nYour agent writes code, deploys apps, debugs errors — but it can't check GA4 analytics, verify a Vercel deployment, or read Sentry errors without a human copying data from dashboards.\n\nperceptdot fixes this. 4 MCP servers, each giving agents direct read access:\n\n- @perceptdot/ga4 — Realtime users, top pages, events, bounce rate (~450 tokens saved per call)\n- @perceptdot/vercel — Deployment status, project list, latest deploy\n- @perceptdot/github — Open PRs, issues, CI workflow status\n- @perceptdot/sentry — Unresolved production errors\n\nSetup is one JSON config block:\n\n{\"mcpServers\": {\"@perceptdot/ga4\": {\"command\": \"npx\", \"args\": [\"@perceptdot/ga4\"]}}}\n\nEvery call includes token-savings metadata. After a session, run percept_roi_summary and the agent reports exact savings: tokens, time, cost.\n\nThe agent proves its own ROI to the human who pays. No sales team needed.\n\nOpen beta — 200 calls/month, free. No account, no dashboard, API key only.\n\nnpm: @perceptdot/ga4, @perceptdot/vercel, @perceptdot/github, @perceptdot/sentry\nSite: https://perceptdot.com\nSource: https://github.com/perceptdot/percept\n\nWhat external service would you most want direct agent access to?"
}
```

### Moltbook 포스팅 방법 (CEO 참고)
1. Moltbook API 키 필요 — https://www.moltbook.com/developers 에서 발급
2. 또는 moltbook-skill (Claude Code 스킬) 사용 가능: https://skills.sh/moltbot/skills/moltbook
3. **중요**: `www.moltbook.com` 사용 (www 없으면 Auth 헤더 strip됨)
4. submolt는 `tools` 또는 `mcp` 시도 (없으면 `general`)

---

## 7. Product Hunt 런칭 (준비 후 실행)

**URL:** https://www.producthunt.com/posts/new

**Tagline (60자 이내):**
```
MCP servers that give AI agents direct access to GA4, Vercel, GitHub, Sentry
```

**Description:**
```
perceptdot gives your AI coding agent (Claude Code, Cursor, Windsurf) direct read access to external services via MCP.

No more being your agent's eyeballs — copying data from GA4, checking Vercel deploys, scrolling Sentry errors.

4 MCP servers:
• @perceptdot/ga4 — Realtime analytics, top pages, events
• @perceptdot/vercel — Deployment status, project list
• @perceptdot/github — Open PRs, issues, CI workflows
• @perceptdot/sentry — Unresolved production errors

Every call tracks ROI automatically. The agent proves its own value to you.

60-second setup. No account. No dashboard. API key only.

Open beta — 200 calls/month, free.
```

**Topics:** `MCP`, `Developer Tools`, `AI`, `Analytics`, `DevOps`

### PH 런칭 체크리스트
- [x] og-image.png (1200×630px)
- [x] 랜딩 페이지 라이브
- [ ] Maker 프로필 설정 (producthunt.com 계정)
- [ ] 스크린샷 3~5장 (터미널에서 MCP 실제 사용 장면)
- [ ] First Comment 준비 (배경 스토리 + CTA)
- [ ] 런칭일 결정 (화~목 US 오전 추천)

---

## CEO ACTION CHECKLIST

- [ ] Product Hunt Maker 프로필 설정 + 런칭 준비
- [ ] Moltbook API 키 발급 + 포스팅 (위 JSON 참조)
- [ ] Twitter 단일 트윗 포스팅 (Option C, 위 참조)
- [ ] Twitter 스레드 포스팅 (반응 보고)
- [ ] Reddit r/ClaudeAI 포스팅
- [ ] Reddit r/cursor 포스팅
- [ ] Hacker News Show HN 포스팅 (화/수 오전 US time)
- [ ] awesome-mcp-servers PR 머지 대기 ([#3639](https://github.com/punkpeye/awesome-mcp-servers/pull/3639))
- [x] og-image.png 제작 (1200x630px, SNS 공유용) ✅ 완료
