# 🔍 How to Use

Just talk to your AI naturally. No special syntax needed.

---

## Basic usage

```
Check my site for bugs: https://mysite.com
```

```
Any layout issues on https://shop.example.com?
```

---

## Check on mobile or tablet

```
Check https://mysite.com on mobile
```

```
Any issues on https://mysite.com on tablet viewport?
```

Supported viewports: **desktop** (1280px, default) · **tablet** (768px) · **mobile** (375px)

---

## Force a fresh scan (bypass cache)

```
Re-check https://mysite.com — ignore cache
```

Cached results return in ~0.3s. Use `no_cache: true` after a fix to see the latest state.

---

## Example output

```
✅ No visual issues detected on https://example.com

No layout bugs, overflow issues, or clipped elements found.

Full-page scan complete — 3 tiles analyzed (desktop) in 4.2s
Cost: $0.000620 | Credits used: 3
```

```
⚠️ Visual issues detected on https://mysite.com

Summary: Two layout issues found in hero and footer sections.

Issues:
  [HIGH] CTA button overflows container by 18px (section-hero)
  [MED]  Footer text is clipped at narrow widths

Full-page scan complete — 5 tiles analyzed (desktop) in 9.8s
Cost: $0.001033 | Credits used: 5
```

---

## Useful phrases

| What to say | What it does |
|-------------|-------------|
| "Check this URL" | Full-page desktop scan |
| "Check on mobile" | Full-page mobile scan (375px) |
| "Check on tablet" | Full-page tablet scan (768px) |
| "Re-check with no_cache" | Bypass cache, fresh scan |
| "Any bugs?" | Reports issues only |

---

## Send feedback to unlock extra credits

After a scan, tell your AI:

```
That result was accurate — send feedback
```

```
That was a false positive — send feedback
```

Your AI uses the `percept_feedback` tool to submit the rating. **Accurate feedback earns bonus credits** and helps improve detection quality.

---

## Good to know

{% hint style="info" %}
**What's a tile?**\
perceptdot splits pages into 1280×1600px sections for analysis.\
Short pages = 1 tile. Long pages = multiple tiles.\
**1 tile = 1 credit used.** The output always shows how many tiles were scanned.
{% endhint %}
