"""Jev triage benchmark: generate 50 test pages with known ground truth.

5 templates x (5 seeded-bug pages + 3 clean + 2 "tricky clean") = 50 pages.
Tricky clean pages contain intentional design choices that look like defects
(ellipsis truncation, decorative overlap, rotated badge...). They exist to
measure false positives, which is where a triage step should add value.

Every page is 1280px wide and fits in one 1600px tile (1 eye credit).
Output: pages/*.html + truth.json
"""
import json
import os
import random

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages")

BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Helvetica,Arial,sans-serif;background:var(--bg);color:var(--fg);padding:40px 64px;max-width:1280px}
h1{font-size:40px;margin-bottom:12px}h2{font-size:24px;margin-bottom:10px}
p{line-height:1.6;margin-bottom:12px}
.btn{display:inline-block;background:var(--ac);color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:24px;position:relative}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;margin-top:24px}
img{display:block;max-width:100%}
"""

THEMES = [
    {"bg": "#ffffff", "fg": "#1d1d1f", "ac": "#2f6fed", "card": "#f5f6f8", "line": "#e1e3e8"},
    {"bg": "#0f1115", "fg": "#e8e8ea", "ac": "#7c6dfa", "card": "#181b22", "line": "#2a2e38"},
    {"bg": "#fbf8f3", "fg": "#2b2118", "ac": "#c4532d", "card": "#ffffff", "line": "#eadfce"},
]

# double quotes inside: the src attribute itself is single-quoted
PLACEHOLDER_IMG = ('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">'
                   '<rect width="100%25" height="100%25" fill="%23cfd6e4"/></svg>')

# ── seeded bugs: (css, html_hook) applied to a template; hooks are inserted by templates
BUGS = {
    "text_overflow": "white-space:nowrap;overflow:visible;",           # applied to a long feature line
    "button_overlap": "position:absolute;bottom:40px;left:24px;",       # CTA covers card text
    "broken_image": None,                                                 # img src points to a 404
    "low_contrast": "color:#7a7a7a;background:#6b6b6b;",                # body text unreadable
    "viewport_leak": "width:1700px;",                                    # forces horizontal scroll
    "clipped_text": "height:22px;overflow:hidden;",                      # heading cut mid-line
    "overlap_cards": "margin-left:-140px;",                              # card slides over neighbour
    "invisible_text": "color:var(--ac)!important;",                     # CTA label same colour as button
    "fixed_cover": None,                                                  # fixed banner hides heading
    "misaligned": "margin-top:64px;",                                    # one grid column pushed down
}

TRICKS = {
    "ellipsis": "intentional single-line ellipsis with full text in title attribute",
    "decor_overlap": "decorative blurred circle intentionally behind the hero heading",
    "rotated_badge": "small 'NEW' badge intentionally rotated and overlapping card corner",
    "gray_placeholder": "intentional gray image placeholder box labelled 'Preview'",
    "tight_dark": "dark theme with muted but WCAG AA-compliant secondary text",
}


def page(title, body, css, theme):
    vars_ = ";".join(f"--{k}:{v}" for k, v in theme.items())
    return (f"<!doctype html><html lang='en'><head><meta charset='utf-8'>"
            f"<meta name='viewport' content='width=device-width,initial-scale=1'>"
            f"<meta name='robots' content='noindex'><title>{title}</title>"
            f"<style>:root{{{vars_}}}{BASE_CSS}{css}</style></head><body>{body}</body></html>")


def bug_css(bug, selector):
    rule = BUGS.get(bug)
    return f"{selector}{{{rule}}}" if rule else ""


def fixed_cover(bug):
    if bug != "fixed_cover":
        return "", ""
    css = ".promo{position:fixed;top:0;left:0;right:0;height:150px;background:#ffcc00;color:#111;padding:20px 64px;font-size:20px;z-index:10}"
    return css, "<div class='promo'>Autumn sale: 30% off every plan until Friday</div>"


def trick_css_html(trick):
    if trick == "ellipsis":
        return (".lead{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:720px}", "")
    if trick == "decor_overlap":
        return (".hero{position:relative}.hero:before{content:'';position:absolute;width:260px;height:260px;"
                "border-radius:50%;background:var(--ac);opacity:.12;filter:blur(30px);left:-60px;top:-60px;z-index:-1}", "")
    if trick == "rotated_badge":
        return (".badge{position:absolute;top:-10px;right:-10px;transform:rotate(12deg);background:#ff3b30;color:#fff;"
                "font-size:11px;font-weight:bold;padding:4px 8px;border-radius:6px}", "<span class='badge'>NEW</span>")
    if trick == "gray_placeholder":
        return (".ph{height:160px;background:#d9dde5;border-radius:8px;display:flex;align-items:center;justify-content:center;"
                "color:#59606d;font-size:14px;margin-bottom:12px}", "")
    if trick == "tight_dark":
        return (".muted{color:#a3a3ad}", "")
    return ("", "")


LONG_LINE = "Unlimited projects, priority email support and single sign-on for your whole team"


def t_pricing(bug, trick, theme):
    css, banner = fixed_cover(bug)
    tcss, badge = trick_css_html(trick)
    css += tcss
    css += ".card ul{list-style:none;margin:16px 0}.card li{padding:6px 0;border-bottom:1px solid var(--line);font-size:14px}"
    css += ".price{font-size:34px;font-weight:bold;color:var(--ac)}"
    css += bug_css(bug, ".card li.long") if bug == "text_overflow" else ""
    css += ".card li.long{max-width:100%}" if bug != "text_overflow" else ""
    css += (bug_css(bug, ".plan2 .btn") + ".plan2 .btn{bottom:auto;top:150px}") if bug == "button_overlap" else ""
    css += bug_css(bug, ".lead") if bug == "low_contrast" else ""
    css += bug_css(bug, ".strip") if bug == "viewport_leak" else ".strip{width:100%}"
    css += bug_css(bug, "h1") if bug == "clipped_text" else ""
    css += bug_css(bug, ".plan2") if bug == "overlap_cards" else ""
    css += bug_css(bug, ".plan3 .btn") if bug == "invisible_text" else ""
    css += bug_css(bug, ".plan3") if bug == "misaligned" else ""
    img = "missing/plan-hero-404.png" if bug == "broken_image" else PLACEHOLDER_IMG
    lead_title = " title='Choose the plan that fits how your team ships product every single week'" if trick == "ellipsis" else ""
    ph = "<div class='ph'>Preview</div>" if trick == "gray_placeholder" else ""
    muted = " class='muted'" if trick == "tight_dark" else ""
    plans = ""
    for i, (name, price) in enumerate([("Starter", "$9"), ("Pro", "$19"), ("Team", "$49")], 1):
        plans += (f"<div class='card plan{i}'>{badge if i == 2 else ''}<h2>{name}</h2><div class='price'>{price}<small>/mo</small></div>"
                  f"<ul><li>Visual checks</li><li class='long'>{LONG_LINE if i == 1 else 'Email reports'}</li>"
                  f"<li>API access</li></ul><p{muted}>Cancel anytime.</p><a class='btn' href='#'>Choose {name}</a></div>")
    body = (f"{banner}<div class='hero'><h1>Simple pricing for growing teams</h1>"
            f"<p class='lead'{lead_title}>Choose the plan that fits how your team ships product every single week</p></div>"
            f"{ph}<img src='{img}' alt='Pricing illustration' width='400' height='120'>"
            f"<div class='grid'>{plans}</div><div class='strip card' style='margin-top:24px'>All prices exclude VAT.</div>")
    return page("Pricing", body, css, theme)


def t_landing(bug, trick, theme):
    css, banner = fixed_cover(bug)
    tcss, badge = trick_css_html(trick)
    css += tcss
    css += ".hero{padding:40px 0}.feat p{font-size:15px}"
    css += bug_css(bug, ".feat.f1 p.long") if bug == "text_overflow" else ""
    css += bug_css(bug, ".hero .btn") if bug == "button_overlap" else ""
    css += ".hero{position:relative}" if bug == "button_overlap" else ""
    css += bug_css(bug, ".lead") if bug == "low_contrast" else ""
    css += bug_css(bug, ".logos") if bug == "viewport_leak" else ""
    css += bug_css(bug, "h1") if bug == "clipped_text" else ""
    css += bug_css(bug, ".f2") if bug == "overlap_cards" else ""
    css += bug_css(bug, ".hero .btn") if bug == "invisible_text" else ""
    css += bug_css(bug, ".f3") if bug == "misaligned" else ""
    img = "assets/hero-shot-missing.jpg" if bug == "broken_image" else PLACEHOLDER_IMG
    lead_title = " title='Catch layout bugs before your users do, on every deploy, automatically'" if trick == "ellipsis" else ""
    ph = "<div class='ph'>Preview</div>" if trick == "gray_placeholder" else ""
    muted = " class='muted'" if trick == "tight_dark" else ""
    feats = ""
    for i, (h, t) in enumerate([("Screenshots", "Full-page captures at every viewport you ship to customers today"),
                                ("Reports", "Plain-language bug reports your agent can act on"),
                                ("CI ready", "One line in your pipeline")], 1):
        long_cls = " class='long'" if i == 1 else muted
        feats += f"<div class='card feat f{i}'>{badge if i == 2 else ''}<h2>{h}</h2><p{long_cls}>{t}</p></div>"
    body = (f"{banner}<div class='hero'><h1>Ship pages that look right everywhere</h1>"
            f"<p class='lead'{lead_title}>Catch layout bugs before your users do, on every deploy, automatically</p>"
            f"<a class='btn' href='#'>Start free</a></div>{ph}<img src='{img}' alt='Product screenshot' width='600' height='160'>"
            f"<div class='grid'>{feats}</div><div class='logos card' style='margin-top:24px'>Trusted by 40 teams</div>")
    return page("Landing", body, css, theme)


def t_article(bug, trick, theme):
    css, banner = fixed_cover(bug)
    tcss, badge = trick_css_html(trick)
    css += tcss
    css += "article{max-width:760px}.meta{font-size:13px;margin-bottom:20px}"
    css += ".grid{grid-template-columns:repeat(3,1fr)}"
    css += ".pull{font-style:italic;max-width:460px;background:var(--card);border-left:4px solid var(--ac);padding:12px}"
    css += bug_css(bug, ".pull") if bug == "text_overflow" else ""
    css += bug_css(bug, ".share") if bug == "button_overlap" else ""
    css += "article{position:relative}" if bug == "button_overlap" else ""
    css += bug_css(bug, "article p") if bug == "low_contrast" else ""
    css += bug_css(bug, "pre") if bug == "viewport_leak" else "pre{white-space:pre-wrap}"
    css += bug_css(bug, "h1") if bug == "clipped_text" else ""
    css += bug_css(bug, ".r2") if bug == "overlap_cards" else ""
    css += bug_css(bug, ".share") if bug == "invisible_text" else ""
    css += bug_css(bug, ".r3") if bug == "misaligned" else ""
    css += "pre{background:var(--card);padding:12px;border-radius:8px;font-size:13px;margin-bottom:12px}"
    img = "img/cover-404.webp" if bug == "broken_image" else PLACEHOLDER_IMG
    lead_title = " title='How we cut visual regressions by catching them in pull requests instead of production'" if trick == "ellipsis" else ""
    ph = "<div class='ph'>Preview</div>" if trick == "gray_placeholder" else ""
    muted = " class='muted'" if trick == "tight_dark" else ""
    rel = "".join(f"<div class='card r{i}'>{badge if i == 2 else ''}<h2>Related {i}</h2><p{muted}>Short teaser text.</p></div>" for i in (1, 2, 3))
    body = (f"{banner}<article class='hero'><h1>Catching visual regressions early</h1><p class='meta lead'{lead_title}>"
            f"How we cut visual regressions by catching them in pull requests instead of production</p>{ph}"
            f"<img src='{img}' alt='Article cover' width='760' height='140'>"
            f"<p>Most layout bugs are not caught by unit tests. They appear when real content meets real screens.</p>"
            f"<p class='pull'>Visual QA belongs in the same pipeline as your tests, not in a spreadsheet after release.</p>"
            f"<pre>npx percept check https://example.com --viewport desktop</pre>"
            f"<a class='btn share' href='#'>Share article</a></article><div class='grid'>{rel}</div>")
    return page("Article", body, css, theme)


def t_dashboard(bug, trick, theme):
    css, banner = fixed_cover(bug)
    tcss, badge = trick_css_html(trick)
    css += tcss
    css += ".kpi{font-size:32px;font-weight:bold}.label{font-size:13px}"
    css += "table{width:100%;border-collapse:collapse;margin-top:24px}td,th{padding:10px;border-bottom:1px solid var(--line);text-align:left;font-size:14px}"
    css += bug_css(bug, "td.name") if bug == "text_overflow" else ""
    css += "td.name{max-width:220px}" if bug == "text_overflow" else ""
    css += bug_css(bug, ".k2 .btn") if bug == "button_overlap" else ".k2 .btn{margin-top:8px}"
    css += bug_css(bug, ".label") if bug == "low_contrast" else ""
    css += bug_css(bug, "table") if bug == "viewport_leak" else ""
    css += bug_css(bug, "h1") if bug == "clipped_text" else ""
    css += bug_css(bug, ".k2") if bug == "overlap_cards" else ""
    css += bug_css(bug, ".k2 .btn") if bug == "invisible_text" else ""
    css += bug_css(bug, ".k3") if bug == "misaligned" else ""
    img = "static/avatar-missing.png" if bug == "broken_image" else PLACEHOLDER_IMG
    lead_title = " title='Visual checks across all production pages over the last thirty days, by project'" if trick == "ellipsis" else ""
    ph = "<div class='ph'>Preview</div>" if trick == "gray_placeholder" else ""
    muted = "muted " if trick == "tight_dark" else ""
    kpis = ""
    for i, (v, l) in enumerate([("1,284", "Checks this month"), ("37", "Issues open"), ("96%", "Pages passing")], 1):
        btn = "<a class='btn' href='#'>View issues</a>" if i == 2 else ""
        kpis += f"<div class='card k{i}'>{badge if i == 2 else ''}<div class='kpi'>{v}</div><div class='{muted}label'>{l}</div>{btn}</div>"
    rows = "".join(f"<tr><td class='name'>{n}</td><td>{s}</td><td>{d}</td></tr>" for n, s, d in [
        ("marketing-site-production-eu-west-landing-v2", "Pass", "2m ago"), ("docs", "2 issues", "1h ago"), ("app", "Pass", "3h ago")])
    body = (f"{banner}<div class='hero' style='display:flex;align-items:center;gap:16px'>"
            f"<img src='{img}' alt='User avatar' width='48' height='48' style='border-radius:50%'>"
            f"<div><h1>Overview</h1><p class='lead'{lead_title}>Visual checks across all production pages over the last thirty days, by project</p></div></div>"
            f"{ph}<div class='grid'>{kpis}</div><table><tr><th>Project</th><th>Status</th><th>Last check</th></tr>{rows}</table>")
    return page("Dashboard", body, css, theme)


def t_signup(bug, trick, theme):
    css, banner = fixed_cover(bug)
    tcss, badge = trick_css_html(trick)
    css += tcss
    css += "form{max-width:440px}label{display:block;font-size:14px;margin:14px 0 6px}"
    css += "input{width:100%;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--fg)}"
    css += ".terms{font-size:13px;margin:14px 0}.side .card{margin-bottom:16px}"
    css += ".wrap{display:grid;grid-template-columns:440px 1fr;gap:48px}"
    css += bug_css(bug, ".terms") if bug == "text_overflow" else ""
    css += ".terms{max-width:300px}" if bug == "text_overflow" else ""
    css += bug_css(bug, "form .btn") if bug == "button_overlap" else ""
    css += "form{position:relative}form .btn{bottom:auto;top:60px}" if bug == "button_overlap" else ""
    css += bug_css(bug, ".terms") if bug == "low_contrast" else ""
    css += bug_css(bug, ".side") if bug == "viewport_leak" else ""
    css += bug_css(bug, "h1") if bug == "clipped_text" else ""
    css += bug_css(bug, ".s2") if bug == "overlap_cards" else ""
    css += bug_css(bug, "form .btn") if bug == "invisible_text" else ""
    css += bug_css(bug, ".side") if bug == "misaligned" else ""
    css += "form .btn{border:0;font-size:15px;cursor:pointer;margin-top:12px}"
    img = "brand/logo-404.svg" if bug == "broken_image" else PLACEHOLDER_IMG
    lead_title = " title='Create your account in under a minute and run your first visual check for free'" if trick == "ellipsis" else ""
    ph = "<div class='ph'>Preview</div>" if trick == "gray_placeholder" else ""
    muted = " class='muted'" if trick == "tight_dark" else ""
    sides = "".join(f"<div class='card s{i}'>{badge if i == 2 else ''}<h2>{h}</h2><p{muted}>{t}</p></div>" for i, (h, t) in
                    enumerate([("Free tier", "100 checks every month."), ("No card", "Start without billing details."),
                               ("Cancel", "Delete your data anytime.")], 1))
    body = (f"{banner}<img src='{img}' alt='Company logo' width='160' height='40'><div class='hero'><h1>Create your account</h1>"
            f"<p class='lead'{lead_title}>Create your account in under a minute and run your first visual check for free</p></div>"
            f"{ph}<div class='wrap'><form><label>Email</label><input placeholder='you@company.com'>"
            f"<label>Password</label><input type='password' placeholder='At least 8 characters'>"
            f"<p class='terms'>By signing up you agree to the Terms of Service and the Privacy Policy of this service.</p>"
            f"<button class='btn' type='button'>Create account</button></form><div class='side'>{sides}</div></div>")
    return page("Sign up", body, css, theme)


TEMPLATES = {"pricing": t_pricing, "landing": t_landing, "article": t_article, "dashboard": t_dashboard, "signup": t_signup}


def main():
    rng = random.Random(20261015)
    os.makedirs(OUT, exist_ok=True)
    bug_names = list(BUGS)
    trick_names = list(TRICKS)
    truth = []
    for ti, (tname, fn) in enumerate(TEMPLATES.items()):
        bugs = [bug_names[(ti * 5 + k) % len(bug_names)] for k in range(5)]   # each bug used 2-3 times overall
        tricks = [trick_names[(ti * 2 + k) % len(trick_names)] for k in range(2)]
        variants = [("bug", b, None) for b in bugs] + [("clean", None, None)] * 3 + [("tricky", None, t) for t in tricks]
        for vi, (kind, bug, trick) in enumerate(variants):
            theme = THEMES[1] if trick == "tight_dark" else rng.choice(THEMES)
            pid = f"{tname}-{vi:02d}"
            with open(os.path.join(OUT, f"{pid}.html"), "w") as f:
                f.write(fn(bug, trick, theme))
            truth.append({"id": pid, "template": tname, "kind": kind, "has_bug": kind == "bug",
                          "bug": bug, "trick": trick, "trick_note": TRICKS.get(trick)})
    with open(os.path.join(os.path.dirname(OUT), "truth.json"), "w") as f:
        json.dump(truth, f, indent=1)
    print(f"{len(truth)} pages -> {OUT}")


if __name__ == "__main__":
    main()
