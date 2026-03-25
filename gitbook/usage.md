# 🔍 How to Use

Just talk to Claude Code naturally. No special syntax needed.

---

## Basic usage

```
Check my site for bugs: https://mysite.com
```

```
Any layout issues on https://shop.example.com?
```

---

## Example output

```
has_issues: true

Issues found:
1. [HIGH] CTA button overflows container by 18px (section-hero)
2. [MED]  Product title text is clipped on mobile viewport

Full-page scan complete — 5 tiles analyzed in 2.3s
```

---

## Useful phrases

| What to say | What it does |
|-------------|-------------|
| "Check this URL" | Full-page scan |
| "Any bugs?" | Reports issues only |
| "Re-check with no_cache=true" | Bypass cache, fresh scan |

---

## Good to know

{% hint style="info" %}
**What's a tile?**\
perceptdot splits pages into 1280×1600px sections for analysis.\
Short pages = 1 tile. Long pages = multiple tiles.\
1 tile = 1 credit used.
{% endhint %}
