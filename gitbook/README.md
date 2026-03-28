# What is perceptdot? 👁️

perceptdot gives your AI agent **eyes** — it takes a screenshot of any website and tells you exactly what's broken.

Connect it to Claude Code or any MCP-compatible AI tool, and your agent can automatically detect layout bugs, overflowing elements, clipped text, and visual glitches — without you having to look.

---

## What it finds

✅ Buttons overflowing outside their container\
✅ Text getting clipped or cut off\
✅ Elements overlapping and hiding each other\
✅ Broken layouts and misaligned sections

---

## How it works

1️⃣ Your AI opens the website\
2️⃣ Takes a full-page screenshot (tiled at 1280×1600px)\
3️⃣ Analyzes each tile with Gemini 2.5 Flash\
4️⃣ Reports: *"The CTA button in section 3 overflows by 18px"*

---

## Two ways to use perceptdot

| | MCP Server | GitHub Action |
|---|---|---|
| **Best for** | AI-assisted development | CI/CD automation |
| **Works with** | Claude Code, Cursor, Windsurf, Cline | Any GitHub workflow |
| **Trigger** | Ask your AI | Every deployment |
| **Setup** | 1 command | ~10 lines of YAML |

---

## Performance

- **5–20s** for a first scan (depends on page height)
- **~0.3s** for cached results
- Supports **desktop** (1280px) · **tablet** (768px) · **mobile** (375px)

---

## Ready in 1 minute

Jump straight to setup 👉 [⚡ Quick Install](install.md)
