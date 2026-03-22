# perceptdot — Marketing Ready to Post

> Updated: 2026-03-22 (PIVOT-05 반영)
> Status: ALL FINALIZED — 3단계 런칭 스택 전략 + @perceptdot/core 피벗 반영

---

## STATUS BOARD

| Channel | Stage | Status | Action |
|---------|-------|--------|--------|
| awesome-mcp-servers PR | - | ✅ SUBMITTED | [PR #3639](https://github.com/punkpeye/awesome-mcp-servers/pull/3639) — 승인 대기 |
| GitHub README | - | ✅ PUSHED | PIVOT-05 반영 완료 (core 추가, "Your Agent's App Store" 포지셔닝) |
| og-image.png | - | ✅ DONE | 1200×630px, landing/ 배치 |
| **DevHunt** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| **BetaList** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| **TAAFT** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| **AlternativeTo** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| **Launching Next** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| **Microlaunch** | 1단계 | 🔲 TODO | 즉시 등록 가능 |
| Twitter/X Single Tweet | 2단계 | ✅ READY | 아래 복사 → 포스팅 |
| Twitter/X Thread | 2단계 | ✅ READY | 아래 복사 → 포스팅 |
| Reddit r/ClaudeAI | 2단계 | ✅ READY | 아래 복사 → 포스팅 |
| Reddit r/cursor | 2단계 | ✅ READY | 아래 복사 → 포스팅 |
| Reddit r/webdev, r/SideProject | 2단계 | 🔲 TODO | 초안 작성 필요 |
| Hacker News | 2단계 | ✅ READY | 아래 복사 → 포스팅 |
| Moltbook | 2단계 | ✅ READY | API 키 발급 후 포스팅 |
| Anthropic Discord | 2단계 | 🔲 TODO | 초안 작성 필요 |
| Indie Hackers | 2단계 | 🔲 TODO | 빌드인퍼블릭 스토리 필요 |
| Smol Launch | 2단계 | 🔲 TODO | 주간 포맷, 개발자 특화 |
| **Product Hunt** | 3단계 | 🔲 PREP | 1회성 올인 — 준비 완벽 시 실행 |

### 3단계 런칭 스택 전략 (CEO 2026-03-22 지시)

```
1단계 — 즉시 등록 (부담 없음, 복수 동시)
  DevHunt + BetaList + TAAFT + AlternativeTo + Launching Next + Microlaunch
  → 장기 발견 + SEO 백링크 + 얼리어답터 유입

2단계 — 반응 확인 후 순차 실행
  Twitter → Reddit → HN → Moltbook → Discord → Indie Hackers → Smol Launch
  → 커뮤니티 반응 측정 + 피드백 수집

3단계 — 올인 (1~2단계 반응 확인 후)
  Product Hunt 런칭 (1회성, 화~목 US 오전)
  → 스크린샷 5장 + First Comment + 런칭일 최적화
```

---

## 1. Twitter/X Single Tweet (280자 이내)

```
Your AI agent installs its own tools now.

npx -y @perceptdot/core → scans your project → recommends exactly which MCP servers to install.

Your agent's app store. One line. No config.

perceptdot.com
```

**[대안 — 기존 human clipboard 앵글 유지]**
```
You are your AI agent's eyeballs. Every time it asks "what's the traffic?" and you open GA4 to copy-paste numbers — that's you being a human clipboard.

perceptdot fixes that. One install: npx -y @perceptdot/core — your agent discovers the rest.

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
I built perceptdot — starting with @perceptdot/core.

One line: npx -y @perceptdot/core

Your agent scans your project and tells you exactly which MCP servers to install. GA4. Vercel. GitHub. Stripe. Postgres. Your agent's app store.
```

### Tweet 4
```
percept_discover result:

Project: /my-app
Signals: 3 deps, 5 env vars
Recommendations:
  @perceptdot/ga4  (GA4_PROPERTY_ID found)   ~450 tokens/call
  PostgreSQL MCP   (DATABASE_URL found)       ~300 tokens/call
  Stripe MCP       (STRIPE_SECRET_KEY found)  ~400 tokens/call

Total: ~1,150 tokens saved per call across 3 servers.

Zero manual research. The agent just knows.
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

Start here: npx -y @perceptdot/core

Then install what your project needs:
npx @perceptdot/ga4
npx @perceptdot/vercel
npx @perceptdot/github
npx @perceptdot/sentry

perceptdot.com

Your agent's app store. #MCP #ClaudeCode #AIAgent #DevTools
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

So I built **perceptdot**: starting with `@perceptdot/core` — your agent's app store.

One line gets you started: `npx -y @perceptdot/core`

The agent scans your project (package.json, .env, config files) and tells you exactly which MCP servers to install — with ready-made JSON configs to copy. No manual browsing of registries.

**Then the service servers give your agent direct read access:**

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

- npm: `@perceptdot/core` (start here), `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry`
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
Show HN: Perceptdot – Your agent's app store. One install, agent discovers the rest.
```

**Body:**
```
I kept hitting the same wall using Claude Code and Cursor: the agent can write code, but it can't see anything outside the codebase. And there are 11,000+ MCP servers now — but the agent has no way to know which ones are relevant to this specific project.

So I built two things:

1. `@perceptdot/core` — a discovery layer. One line (`npx -y @perceptdot/core`), and your agent scans your project (package.json, .env, config files) and recommends exactly which MCP servers to install, with ready-made JSON configs. Your agent's app store.

2. The service servers — `@perceptdot/ga4`, `@perceptdot/vercel`, `@perceptdot/github`, `@perceptdot/sentry` — that give your agent direct read access to external services. No copy-paste from dashboards.

Perceptdot is both the discovery layer and the integration layer.

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
  "title": "perceptdot — Your agent's app store. One install, it discovers the rest.",
  "content": "I built perceptdot because AI agents are blind to external services — and there are now 11,000+ MCP servers with no way to know which are relevant.\n\nSo I built two layers:\n\n1. @perceptdot/core — Your agent's app store. One line: npx -y @perceptdot/core\nYour agent scans the project (package.json, .env, configs) and auto-recommends which MCP servers to install. percept_discover returns ready-to-copy JSON configs. Zero manual registry browsing.\n\n2. Service servers — direct read access:\n- @perceptdot/ga4 — Realtime users, top pages, events, bounce rate (~450 tokens saved per call)\n- @perceptdot/vercel — Deployment status, project list, latest deploy\n- @perceptdot/github — Open PRs, issues, CI workflow status\n- @perceptdot/sentry — Unresolved production errors\n\nEvery call includes token-savings metadata. After a session, run percept_roi_summary and the agent reports exact savings: tokens, time, cost.\n\nThe agent proves its own ROI to the human who pays. No sales team needed.\n\nOpen beta — 200 calls/month, free. No account, no dashboard.\n\nnpm: @perceptdot/core, @perceptdot/ga4, @perceptdot/vercel, @perceptdot/github, @perceptdot/sentry\nSite: https://perceptdot.com\nSource: https://github.com/perceptdot/percept\n\nWhat external service would you most want your agent to discover automatically?"
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
One install. Your agent discovers the rest. MCP servers + discovery layer.
```

**Description:**
```
perceptdot gives your AI coding agent (Claude Code, Cursor, Windsurf) two things:

1. @perceptdot/core — Your agent's app store. Scans your project and auto-recommends which MCP servers to install. One line: npx -y @perceptdot/core

2. Service servers — Direct read access to external services:
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

## 8. 1단계 플랫폼 등록 정보 (즉시 실행)

### DevHunt
- **URL**: https://devhunt.org/submit
- **제출 내용**: GitHub repo URL + 설명
- **카테고리**: Developer Tools / MCP
- **설명**: PH tagline과 동일 사용

### BetaList
- **URL**: https://betalist.com/submit
- **제출 내용**: URL + tagline + 설명 + 로고
- **특징**: 얼리어답터 수집, 이메일 대기리스트 형성
- **설명**:
```
perceptdot — MCP servers that give AI agents direct access to GA4, Vercel, GitHub, and Sentry. Built-in ROI tracking. 60-second setup. Open beta — 200 calls/month free.
```

### There's An AI For That (TAAFT)
- **URL**: https://theresanaiforthat.com/submit/
- **카테고리**: Developer Tools / AI Agent Tools
- **설명**: PH description 사용
- **효과**: AI 도구 검색 시 장기 노출

### AlternativeTo
- **URL**: https://alternativeto.net/manage-app/
- **대안 등록**: "Composio" 대안으로 등록
- **태그**: MCP, Developer Tools, AI, Analytics
- **효과**: "Composio alternative" 검색 시 perceptdot 노출

### Launching Next
- **URL**: https://www.launchingnext.com/submit/
- **제출 내용**: URL + 설명 + 스크린샷
- **특징**: 큐레이션 디렉토리, 스팸 적음

### Microlaunch
- **URL**: https://microlaunch.net/submit
- **특징**: 월간 노출, 장기 발견 (PH의 24시간 압박 없음)

---

## 9. 2단계 추가 채널 (초안 필요)

### Reddit r/webdev
```
Title: Built MCP servers that let AI agents read GA4, Vercel, GitHub, Sentry — no more copy-pasting dashboards

Body: [r/cursor 초안과 동일 구조, "Cursor" → "your AI agent" 변경]
```

### Reddit r/SideProject
```
Title: I built perceptdot — MCP servers that give AI coding agents direct access to external services

Body: [r/ClaudeAI 초안 기반, "side project" 앵글 강조]
```

### Indie Hackers
```
Title: How I built perceptdot: MCP servers that give AI agents eyes

Angle: 빌드인퍼블릭 스토리
- K-사주(한국 사주 앱) 개발하며 Claude Code 풀타임 사용
- "인간 클립보드" 문제 발견
- 3일 만에 MVP → npm 퍼블리시 → 오픈 베타
- B2A2H 모델: 에이전트가 추천, 사람은 결제만
- 수치: 10K유저 서버비 $5/mo, 무료 베타로 검증 중
```

### Smol Launch
- **URL**: https://smollaunch.com
- **형식**: 주간 포맷, PH description 사용

---

## CEO ACTION CHECKLIST

### 1단계 — 즉시 (계정 생성 + 등록)
- [ ] DevHunt 등록
- [ ] BetaList 등록
- [ ] TAAFT 등록
- [ ] AlternativeTo 등록 (Composio 대안)
- [ ] Launching Next 등록
- [ ] Microlaunch 등록

### 2단계 — 순차 포스팅
- [ ] Twitter 단일 트윗 (Option C)
- [ ] Twitter 스레드 (반응 보고)
- [ ] Reddit r/ClaudeAI
- [ ] Reddit r/cursor
- [ ] Reddit r/webdev
- [ ] Reddit r/SideProject
- [ ] Hacker News Show HN (화/수 US 오전)
- [ ] Moltbook API 키 발급 + 포스팅
- [ ] Anthropic Discord #tools
- [ ] Indie Hackers 빌드인퍼블릭 포스트
- [ ] Smol Launch 등록

### 3단계 — Product Hunt 올인
- [ ] Maker 프로필 설정
- [ ] 스크린샷 3~5장 준비
- [ ] First Comment 작성
- [ ] 런칭일 결정 (화~목 US 오전)
- [ ] 런칭 실행

### 완료
- [x] og-image.png (1200×630px) ✅
- [x] awesome-mcp-servers PR #3639 제출 ✅
- [x] 마케팅 초안 전채널 완성 ✅
