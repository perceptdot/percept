# Product Hunt Launch Kit -- perceptdot

> Created: 2026-03-23
> Status: READY FOR REVIEW
> Owner: Growth + DevRel
> Timing: Execute after Stage 1-2 community validation (per 3-stage launch stack strategy)

---

## 1. Product Hunt Submission Fields (Pre-Filled)

### Tagline Options (60 chars max)

| # | Tagline | Chars |
|---|---------|-------|
| A | `Your agent's app store. One install, it discovers the rest.` | 59 |
| B | `MCP servers + discovery layer. Your agent finds its own tools.` | 63 -- OVER, trim below |
| B-alt | `MCP discovery layer. Your agent finds its own tools.` | 53 |
| C | `Give your AI agent eyes. GA4, Vercel, GitHub, Sentry via MCP.` | 63 -- OVER, trim below |
| C-alt | `Give your AI agent eyes. GA4, Vercel, GitHub via MCP.` | 54 |

**Recommended**: Option A -- aligns with core positioning, memorable, action-oriented.

### Description (ready to paste)

```
perceptdot gives your AI coding agent (Claude Code, Cursor, Windsurf) two things:

1. Discovery — @perceptdot/core scans your project and auto-recommends which MCP servers to install. One line: npx -y @perceptdot/core. Your agent's app store.

2. Direct access — MCP servers that let your agent read external services without you copy-pasting from dashboards:

  - @perceptdot/ga4 — Realtime analytics, top pages, events, bounce rate
  - @perceptdot/vercel — Deployment status, project list, latest deploy check
  - @perceptdot/github — Open PRs, issues, CI workflow status
  - @perceptdot/sentry — Unresolved production errors

Every tool call tracks ROI automatically. After a session, your agent reports exactly how many tokens and how much time perceptdot saved — the agent proves its own value to you.

60-second setup. No account. No dashboard. Just an API key.

Open source. Open beta — 200 calls/month, free. Pro and Team plans coming soon.

npm: @perceptdot/core, @perceptdot/ga4, @perceptdot/vercel, @perceptdot/github, @perceptdot/sentry
GitHub: github.com/perceptdot/percept
```

### Topics

- MCP
- Developer Tools
- AI
- Analytics
- DevOps
- Open Source

### Makers

- **Name**: Sorina Lee
- **Email**: thunova0318@gmail.com
- **Role**: Maker
- **Twitter**: (link to @perceptdot or maker personal if available)

### Links

- **Website**: https://perceptdot.com
- **GitHub**: https://github.com/perceptdot/percept

### Pricing

- **Free** (Open Beta: 200 calls/month)

### Logo

- Pixel art style, blue themed
- File: `landing/og-image.png` or dedicated square logo (PH requires 240x240 minimum)
- NOTE: PH logo must be square. If og-image is 1200x630, crop or create a dedicated square version.

---

## 2. First Comment (CRITICAL for PH Success)

Post this within 5 minutes of going live. This is the single most important piece of content for PH launch day.

```
Hi Product Hunt! I'm Sorina, the maker of perceptdot.

I've been using Claude Code full-time to build a side project (a Korean fortune-telling
app — long story). After weeks of the same loop — "check GA4 traffic for me" / open GA4 /
copy numbers / paste into terminal / "did the deploy succeed?" / open Vercel / check /
type the answer — I realized I was just being my agent's clipboard.

Every interruption broke my flow. Every copy-paste cost tokens and time. The agent could
write entire features but couldn't glance at a dashboard.

So I built perceptdot. Two layers:

1. @perceptdot/core — a discovery layer. Your agent scans your project and tells you
   exactly which MCP servers to install. Think of it as your agent's app store.

2. Service servers (@perceptdot/ga4, /vercel, /github, /sentry) that give your agent
   direct read access to the services you use every day. 60-second setup, no account,
   no dashboard.

The part I'm proudest of: built-in ROI tracking. Every call records how many tokens and
how much time it saved. After a session, the agent reports its own value — "I saved 4,500
tokens and 25 minutes by reading GA4 directly instead of waiting for you to paste data."
The tool justifies itself. No spreadsheet needed.

We're open source and in open beta right now — 200 free calls/month, no credit card. It's
early. I'm a solo bootstrapped founder and I know there's a lot to improve.

I'd genuinely love your feedback: What external service would you most want your AI agent
to access directly? That's literally how I decide what to build next.

Thank you for checking us out!
```

**Word count**: ~240 words
**Tone**: Authentic, builder-to-builder, honest about stage, ends with genuine question

---

## 3. Screenshot Guide (5 Screenshots)

Product Hunt allows up to 5 gallery images. Each should be 1270x760px (PH recommended).

### Screenshot 1: percept_discover Output (The Hook)

**What to show**: Terminal output of an agent running `percept_discover` on a real project, showing auto-detected signals and server recommendations.

**How to capture**:
1. Open a terminal with a dark theme (e.g., One Dark, Dracula, or VS Code default dark)
2. Navigate to a project that has `package.json` with known dependencies and `.env` with service keys
3. Trigger the `percept_discover` tool via Claude Code or simulate the output
4. Expected output to display:

```
percept_discover result:

Project: /Users/dev/my-saas-app
Detected Signals:
  - package.json: next, vercel, @sentry/nextjs
  - .env: GA4_PROPERTY_ID, VERCEL_TOKEN, SENTRY_DSN, GITHUB_TOKEN

Recommended MCP Servers (4 matches):
  1. @perceptdot/ga4      GA4_PROPERTY_ID found     ~450 tokens saved/call
  2. @perceptdot/vercel    VERCEL_TOKEN found        ~200 tokens saved/call
  3. @perceptdot/github    GITHUB_TOKEN found        ~400 tokens saved/call
  4. @perceptdot/sentry    SENTRY_DSN found          ~300 tokens saved/call

Total potential savings: ~1,350 tokens per call across 4 servers.

Ready-to-copy MCP config:
{
  "mcpServers": {
    "@perceptdot/ga4": { "command": "npx", "args": ["@perceptdot/ga4"], ... },
    "@perceptdot/vercel": { "command": "npx", "args": ["@perceptdot/vercel"], ... },
    ...
  }
}
```

**Text overlay**: Add a subtle top banner: **"Your agent scans your project. Recommends tools automatically."**

**Dimensions**: 1270x760px
**Terminal font size**: 14-16px (readable at PH thumbnail size)

---

### Screenshot 2: ga4_overview Being Called by Agent

**What to show**: Claude Code or a terminal session where the agent calls `ga4_overview` and returns structured analytics data.

**How to capture**:
1. In Claude Code, ask: "What's the site traffic this week?"
2. The agent calls `ga4_overview` automatically
3. Capture the tool call and response

**Expected output to display**:

```
> What's the site traffic this week?

Calling ga4_overview...

GA4 Overview (2026-03-17 to 2026-03-23):
  Sessions:        1,247
  Active Users:      891
  Pageviews:       3,456
  Bounce Rate:     42.3%
  Avg Duration:    2m 14s

Top insight: Sessions up 23% from last week.
Recommendation: Focus on /pricing page — highest exit rate.
```

**Text overlay**: **"Agent reads GA4 directly. No browser. No copy-paste."**

**Dimensions**: 1270x760px

---

### Screenshot 3: percept_roi_summary Results

**What to show**: The ROI summary output after a work session, showing tokens saved, time saved, and cost saved.

**How to capture**:
1. After several tool calls in a session, invoke `percept_roi_summary`
2. Capture the output

**Expected output to display**:

```
percept_roi_summary:

Session ROI Report
==================
Tools used:        4 (@perceptdot/ga4, vercel, github, sentry)
Total calls:       12
Tokens saved:      ~5,400 (vs. manual copy-paste baseline)
Time saved:        ~28 minutes
Est. cost saved:   $0.017

Breakdown:
  ga4_overview        x4    ~1,800 tokens    ~450/call
  ga4_top_pages       x2    ~900 tokens      ~450/call
  vercel_deployments  x3    ~600 tokens      ~200/call
  github_prs          x3    ~1,200 tokens    ~400/call

NOTE TO HUMAN: perceptdot saved 28 minutes this session.
At your current usage, that's ~2 hours/week.
```

**Text overlay**: **"The agent proves its own ROI. Every session."**

**Dimensions**: 1270x760px

---

### Screenshot 4: MCP Config JSON (Clean, Readable)

**What to show**: A clean, syntax-highlighted MCP configuration JSON showing all perceptdot servers configured.

**How to capture**:
1. Open `~/.claude/mcp.json` or `.cursor/mcp.json` in VS Code with a dark theme
2. Show the full config with syntax highlighting

**Content to display**:

```json
{
  "mcpServers": {
    "@perceptdot/core": {
      "command": "npx",
      "args": ["-y", "@perceptdot/core"]
    },
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["-y", "@perceptdot/ga4"],
      "env": {
        "GA4_PROPERTY_ID": "123456789",
        "GOOGLE_SERVICE_ACCOUNT_KEY": "{...}"
      }
    },
    "@perceptdot/vercel": {
      "command": "npx",
      "args": ["-y", "@perceptdot/vercel"],
      "env": {
        "VERCEL_TOKEN": "your_vercel_token"
      }
    },
    "@perceptdot/github": {
      "command": "npx",
      "args": ["-y", "@perceptdot/github"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    },
    "@perceptdot/sentry": {
      "command": "npx",
      "args": ["-y", "@perceptdot/sentry"],
      "env": {
        "SENTRY_AUTH_TOKEN": "your_sentry_token"
      }
    }
  }
}
```

**Text overlay**: **"60-second setup. Paste this JSON. Done."**

**Dimensions**: 1270x760px
**Font**: Monospace, 14px, VS Code dark theme or similar

---

### Screenshot 5: Landing Page Hero Section

**What to show**: The perceptdot.com hero section showing the value proposition and CTA.

**How to capture**:
1. Open https://perceptdot.com in Chrome
2. Set viewport to 1270x760px (DevTools > Device toolbar > Responsive > 1270x760)
3. Screenshot the hero section
4. Alternatively, use a tool like CleanShot or Screenshot API

**Content visible**: The landing page hero with tagline, description, and CTA button.

**Text overlay**: None needed (the landing page IS the content)

**Dimensions**: 1270x760px

---

### Screenshot Production Notes

**Tools for capture**:
- macOS: Cmd+Shift+4 (then resize) or CleanShot X
- Terminal theming: Use iTerm2 or Warp with a dark theme (Dracula, One Dark)
- Text overlays: Add in Figma, Canva, or any image editor
- Font for overlays: Inter or SF Pro, white text on semi-transparent dark banner at top

**If simulating terminal output**:
- Use a tool like `carbon.now.sh` (code-to-image) or `ray.so` for polished terminal screenshots
- Alternatively: paste the expected output into a real terminal session and screenshot

**Recommended order in PH gallery**:
1. percept_discover (hook -- shows the unique discovery feature)
2. ga4_overview (concrete value -- agent reads real data)
3. percept_roi_summary (proof -- the agent justifies itself)
4. MCP config JSON (simplicity -- "this is all you need")
5. Landing page (credibility -- polished site)

---

## 4. Demo GIF Script (30 Seconds)

**Tool**: Use a screen recorder that exports to GIF (e.g., Kap, LICEcap, CleanShot X, or Gifox on macOS).

**Resolution**: 800x500px or 1270x760px (PH accepts both)
**Frame rate**: 15-20 fps (keeps file size under 5MB)
**Font size in terminal**: 16-18px (must be readable at small size)

### Script

```
SECOND 0-5: The Problem
-------------------------------------------------
Show a terminal with an empty or minimal MCP config:

$ cat ~/.claude/mcp.json
{
  "mcpServers": {}
}

Text overlay fades in: "Your agent has zero visibility."


SECOND 5-10: Install Core
-------------------------------------------------
Type (or pre-type and reveal):

$ npx -y @perceptdot/core

Show brief install output (1-2 lines), then the agent calling percept_discover.

Text overlay: "One install."


SECOND 10-15: Discovery Output
-------------------------------------------------
Show percept_discover result appearing line by line:

Detected Signals: GA4_PROPERTY_ID, VERCEL_TOKEN, GITHUB_TOKEN
Recommended:
  @perceptdot/ga4      ~450 tokens/call
  @perceptdot/vercel   ~200 tokens/call
  @perceptdot/github   ~400 tokens/call

Ready-to-copy MCP config: { ... }

Text overlay: "Agent discovers the rest."


SECOND 15-22: Agent Uses a Tool
-------------------------------------------------
Show the agent calling ga4_overview:

> "What's the traffic this week?"

ga4_overview result:
  Sessions: 1,247 | Users: 891 | Bounce: 42.3%

The data appears directly in the terminal -- no browser opened,
no copy-paste.

Text overlay: "Direct access. No clipboard."


SECOND 22-28: ROI Summary
-------------------------------------------------
Show percept_roi_summary output:

Session ROI:
  Tokens saved: ~5,400
  Time saved: ~28 min
  Cost saved: $0.017

Text overlay: "The agent proves its own ROI."


SECOND 28-30: CTA
-------------------------------------------------
Clean screen with:

perceptdot.com
Open Beta -- 200 calls/month, free.
npm: @perceptdot/core

Text overlay: "Your agent's app store."
```

### Recording Tips

- Pre-record each segment separately, then stitch together (smoother than live recording)
- Use a typing animation tool (e.g., `asciinema` + `svg-term`) for terminal sequences
- Alternatively: record in real-time but practice 3-4 times first
- Keep transitions clean -- simple fade or cut, no fancy effects
- No audio needed (PH GIFs autoplay muted)
- If the GIF exceeds 5MB, reduce resolution to 800x500 or lower frame rate to 12fps

---

## 5. Launch Day Checklist

### Pre-Launch: 1 Week Before

- [ ] **Maker profile active**: Create/verify PH account at producthunt.com
  - Upload real photo (not logo)
  - Write bio: "Building perceptdot -- MCP servers + discovery for AI agents. Solo founder."
  - Link Twitter and website
- [ ] **Engage on PH**: Upvote and leave genuine comments on 5+ products over the week
  - Focus on Developer Tools and AI categories
  - Leave thoughtful comments (not "great product!" -- write 2-3 sentences with actual observations)
  - This builds your profile credibility before launch day
- [ ] **Prepare all assets**: Confirm all 5 screenshots are produced at 1270x760px
- [ ] **Demo GIF ready**: Recorded, edited, under 5MB
- [ ] **First Comment drafted**: Copy from Section 2, review one final time
- [ ] **Landing page polish**: Ensure perceptdot.com loads fast, CTA works, og-image is correct
- [ ] **npm packages verified**: All 5 packages install cleanly via npx
- [ ] **Test the full flow**: Run through the entire user journey (visit site -> get API key -> install -> use -> roi_summary)
- [ ] **Notify supporter network**: Send DM/email templates from Section 6 to 10-20 people
  - Ask them to be ready at launch time (12:01 AM PT)
  - Do NOT ask for upvotes directly (PH penalizes this) -- ask them to "check it out and leave feedback if they find it useful"

### Pre-Launch: 1 Day Before

- [ ] **Draft the PH submission**: Fill in all fields (do NOT publish yet)
  - Use "Schedule" feature if available, or set alarm for 12:01 AM PT
- [ ] **Prepare tweet**: Draft the launch announcement tweet (see Section 6)
- [ ] **Clear your calendar**: Block the entire launch day for PH engagement
- [ ] **Set up monitoring**: Open PH page, Twitter mentions, and GitHub notifications in separate tabs

### Launch Day Timing

- **Best days**: Tuesday, Wednesday, or Thursday
- **Post time**: 12:01 AM PT (Pacific Time) = 4:01 PM KST
  - PH rankings reset daily at midnight PT
  - Posting at 12:01 AM gives you the full 24-hour window
- **Avoid**: Fridays (low engagement), Mondays (hangover from weekend), weekends
- **Avoid**: Days when major AI/MCP news is expected (Anthropic/OpenAI announcements)

### First Hour (12:01 AM - 1:00 AM PT)

- [ ] **Publish the product** at exactly 12:01 AM PT
- [ ] **Post First Comment** within 5 minutes (copy from Section 2)
- [ ] **Tweet the launch** immediately (copy from Section 6)
- [ ] **Send launch notification** to supporter network: "We're live! [link]"
- [ ] **Post in relevant communities** where you have existing presence:
  - Twitter thread or single tweet with PH link
  - Any Discord servers where you are an active member (NOT spam-post)
- [ ] **Monitor first comments**: Be ready to reply to any questions within 10 minutes

### During the Day (Full 24 Hours)

- [ ] **Respond to EVERY comment** within 30 minutes max
  - Be genuine, thank people, answer questions thoroughly
  - If someone reports a bug or issue: acknowledge, thank, and fix if possible (ship a fix during launch day = incredible optics)
- [ ] **Update Twitter**: Post periodic updates ("We just hit top 10!", "Amazing feedback coming in")
- [ ] **Track ranking**: Check PH ranking hourly
- [ ] **Do NOT**:
  - Ask for upvotes directly (PH penalizes, can delist)
  - Post PH link on Reddit (Reddit hates PH upvote farming)
  - Argue with negative feedback (thank them, take the note)
  - Disappear -- responsiveness is the #1 signal PH rewards

### Post-Launch: Day After

- [ ] **Thank you tweet**: "We launched on Product Hunt yesterday. [X upvotes]. Thank you to everyone who checked it out. Here's what we learned: [1-2 bullet points of feedback received]"
- [ ] **Reddit cross-post**: If PH went well, post results on r/SideProject or r/IndieHackers
  - Angle: "I launched on Product Hunt. Here's what happened." (build-in-public story)
- [ ] **Update landing page**: Add "Featured on Product Hunt" badge if applicable
- [ ] **Process feedback**: Create backlog items from PH comments
- [ ] **Follow up with commenters**: DM anyone who left detailed feedback with a personal thank you

### Post-Launch: 1 Week After

- [ ] **Write a launch retrospective**: What worked, what did not, KPI results
- [ ] **Blog post or Twitter thread**: "What I learned launching [product] on Product Hunt"
- [ ] **Update marketing materials**: Incorporate PH results into future pitches

---

## 6. Supporter Outreach Templates

### 6-A. DM Template (Friends / Network)

Use for personal outreach to 10-20 people who might genuinely find perceptdot useful or interesting. Send 3-5 days before launch.

```
Hey [Name]!

Quick heads up -- I'm launching perceptdot on Product Hunt on [DATE].

It's an open-source project that gives AI coding agents (Claude Code, Cursor)
direct access to GA4, Vercel, GitHub, and Sentry via MCP. Instead of you
copy-pasting from dashboards, the agent reads the data directly. There's also
a discovery layer that auto-recommends which tools to install based on your
project.

I'd really appreciate it if you could check it out on launch day and leave
honest feedback -- what you think works, what doesn't, what service you'd
want connected next. Genuine comments help a lot more than upvotes.

I'll send you the link when we go live ([DATE] around 4 PM KST / midnight PT).

No pressure at all if you're busy. Thanks either way!
```

**Key points**:
- Do NOT say "please upvote"
- Ask for "honest feedback" and "genuine comments"
- PH penalizes coordinated upvoting; genuine engagement is rewarded

---

### 6-B. Tweet Template (Launch Announcement)

**Option 1: Short and direct**

```
We just launched perceptdot on Product Hunt.

Your agent's app store. One install, your agent discovers the rest.

MCP servers that give AI agents direct read access to GA4, Vercel,
GitHub, and Sentry. Built-in ROI tracking.

Open beta, free. Check it out:
[PRODUCT HUNT LINK]
```

**Option 2: Story-driven**

```
For months I was my AI agent's clipboard.

"Check GA4." I'd open browser, copy, paste.
"Did deploy work?" Open Vercel, check, type answer.

Today I'm launching the fix on @ProductHunt:

perceptdot -- MCP servers + discovery layer for AI agents.
One install. The agent finds its own tools.

[PRODUCT HUNT LINK]
```

**Option 3: Thread opener (with PH link)**

```
Launching on @ProductHunt today.

I built perceptdot because every AI coding agent has the same blind spot:
it can't see anything outside your codebase.

One line -- npx -y @perceptdot/core -- and your agent scans your project,
discovers which services you use, and recommends tools to install.

(thread below + PH link)

[PRODUCT HUNT LINK]
```

---

### 6-C. Email Template (Beta Users)

Use if you have beta users or email subscribers by launch day.

**Subject**: perceptdot just launched on Product Hunt

```
Hi [Name],

Quick update: perceptdot just went live on Product Hunt today.

[PRODUCT HUNT LINK]

If you've been using perceptdot or have been curious about it, I'd love
your support. The most helpful thing you can do:

1. Visit the PH page
2. Leave a comment with your honest experience or feedback
3. If you think it's useful, an upvote helps visibility

Since you've already [used the beta / signed up / shown interest], your
perspective carries real weight. What's working? What's missing? What
service should we add next?

Either way, thank you for being part of the early journey.

-- Sorina
Founder, perceptdot
https://perceptdot.com
```

---

### 6-D. Community Post Template (Discord / Slack)

For communities where you are an active, contributing member.

```
Hey everyone! I've been building an open-source project called perceptdot
and we just launched on Product Hunt today.

It's a set of MCP servers that give AI coding agents (Claude Code, Cursor,
Windsurf) direct read access to GA4, Vercel, GitHub, and Sentry -- plus a
discovery layer that auto-recommends which servers your project needs.

If any of you are using MCP, I'd genuinely love feedback on the PH page:
[PRODUCT HUNT LINK]

Especially: what external service would you most want your agent to access?
That literally determines what I build next.

Free, open beta, open source. No strings.
```

---

## Appendix A: Key Numbers and Facts (Quick Reference)

Use these in conversations, replies, and comments on launch day.

| Fact | Value |
|------|-------|
| npm packages | 5 (@perceptdot/core, ga4, vercel, github, sentry) |
| Setup time | 60 seconds |
| Free tier | 200 calls/month |
| Account required | No (API key only) |
| Dashboard | None (agent reports directly) |
| Tokens saved per GA4 call | ~450 |
| Tokens saved per Vercel call | ~200 |
| Tokens saved per GitHub call | ~400 |
| Tokens saved per Sentry call | ~300 |
| MCP servers available globally | 11,000+ (none with discovery) |
| Agent clients supported | Claude Code, Cursor, Windsurf, Cline, etc. |
| Stack | TypeScript, Hono, Cloudflare Workers |
| License | Open source |
| Pricing (future) | Pro and Team plans coming soon |

## Appendix B: FAQ / Likely PH Questions and Answers

**Q: How is this different from Composio?**
A: Composio connects agents to 3,000+ apps for actions (send email, create issue). perceptdot focuses on observability -- giving agents read access to ops/analytics services -- plus a discovery layer that auto-recommends the right MCP servers for your project. Different focus: Composio = actions, perceptdot = visibility + discovery.

**Q: Why would I use this instead of just pasting data?**
A: Two reasons. First, context switching kills flow -- every time you switch to a browser, copy data, and paste it back, you lose 2-5 minutes and break your agent's workflow. Second, token efficiency -- our structured data responses use ~450 tokens vs. ~2,000+ tokens for a pasted screenshot or raw HTML.

**Q: Is my data safe?**
A: perceptdot servers are read-only. They cannot modify your GA4, Vercel, GitHub, or Sentry data. The API keys you provide are stored locally in your MCP config file, never sent to our servers. Our backend only sees anonymized usage counts for rate limiting.

**Q: What MCP clients does this work with?**
A: Any MCP-compatible client. Claude Code, Cursor, Windsurf, Cline, and any tool that supports the Model Context Protocol standard by Anthropic.

**Q: What services are you adding next?**
A: We're listening to the community! Most requested so far: Stripe, PostgreSQL, Supabase, Linear, and Datadog. Tell us what you need.

**Q: Is this really free?**
A: Yes, during open beta. 200 calls/month, no credit card, no account. Pro and Team plans with higher limits are coming soon. The free tier will remain.

---

*This document is ready for CEO review. All fields can be copied directly into Product Hunt submission form. Execute after Stage 1-2 launch validation confirms product-market signal.*
