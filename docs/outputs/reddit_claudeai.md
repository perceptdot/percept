I've been using Claude Code full-time on a side project (Korean fortune-telling app, long story). After weeks of the same loop — "check GA4 for me," copy numbers, paste, "did it deploy?" — I got tired of being the agent's eyeballs.

So I built **perceptdot**: starting with `@perceptdot/core` — your agent's app store.

One line gets you started: `npx -y @perceptdot/core`

The agent scans your project (package.json, .env, config files) and tells you exactly which MCP servers to install — with ready-made JSON configs to copy. No manual browsing of registries.

**Then the service servers give your agent direct read access:**

- `@perceptdot/ga4` — Realtime users, top pages, events, bounce rate. Saves ~450 tokens per call vs. pasting a screenshot.
- `@perceptdot/vercel` — Deployment status, project list, latest deploy. Ends the "did it deploy?" interruptions.
- `@perceptdot/github` — Open PRs, issues, CI workflow status.
- `@perceptdot/sentry` — Unresolved errors from production, directly.

Setup is 60 seconds — add one block to your `.mcp.json` and you're done.

**The part I'm most proud of:** every package has a built-in ROI tracker. After a session, run `percept_roi_summary` and the agent tells you exactly how many tokens and how much time it saved. Mine reported ~4,500 tokens saved after 10 GA4 queries in one session.

The idea: if the agent can prove its own ROI, you never need to justify the tool to anyone. The agent does it for you.

It's in open beta — 200 free calls/month, no credit card. Enter your email at perceptdot.com and you get an API key immediately.

**npm:** `@perceptdot/core` (start here) | **Site:** [perceptdot.com](https://perceptdot.com) | **GitHub:** [github.com/perceptdot](https://github.com/perceptdot)

Would love feedback from anyone using MCP with Claude Code. What external service would you most want your agent to read directly?
