"""Ask Jev to triage each eye report, then score Jev against ground truth.

Usage: TYPESAFE_API_KEY=... python3 -I jev_triage.py
Reads truth.json + eye/<id>.json, caches Jev answers in jev/<id>.json, prints a report
and writes result.json.

Jev only sees eye's text output (summary + issue list), never the screenshot.
So Jev cannot recover a bug eye missed; what it can do is drop false alarms.
Pass bar (CEO-approved spec): Jev AUC >= 0.8 and better than eye's own signal.
"""
import json
import os
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.typesafe.ai/v1/systemone"
MODEL = "jev-1.13.0"  # pinned: an alias would let the judge change under us
SEV_W = {"high": 3, "medium": 2, "low": 1}

QUESTIONS = {
    "real_bug": {
        "type": "noul",
        "instructions": ("The automated visual QA report above describes at least one genuine visual rendering "
                         "defect on the page that a real user would notice (not a false alarm, an intentional "
                         "design choice, or a style preference)."),
        "criteria": {
            "true": "Concrete breakage: text overflowing or clipped, elements overlapping content, broken image, "
                    "unreadable text, horizontal scroll, content hidden behind fixed elements, misaligned grid.",
            "false": "Vague, subjective or cosmetic remarks, intentional decoration, ellipsis truncation, "
                     "placeholders, or no concrete breakage.",
        },
    },
    "severity": {
        "type": "choice",
        "instructions": "Most severe genuine defect described in the report.",
        "criteria": {"p0": "Content hidden or unusable.", "p1": "Clearly broken layout but usable.",
                     "p2": "Minor visual flaw.", "none": "No genuine defect."},
    },
}


def state_of(eye):
    issues = eye.get("issues") or []
    return {
        "eye_summary": (eye.get("summary") or "")[:300],
        "issue_count": len(issues),
        "dom_issue_count": len(eye.get("dom_issues") or []),
        "issues": [{"severity": i.get("severity"), "description": (i.get("description") or "")[:160]} for i in issues[:10]],
    }


def ask(state, key):
    body = json.dumps({"model": MODEL, "state": state, "questions": QUESTIONS}).encode()
    req = urllib.request.Request(API, data=body, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(3 * (attempt + 1))
                continue
            return {"error": f"HTTP {e.code}"}
        except Exception as e:  # never print the request (it carries the key)
            last = type(e).__name__
            time.sleep(1 + attempt)
    return {"error": locals().get("last", "retries exhausted")}


def auc(pos, neg):
    """Mann-Whitney AUC: chance a random buggy page scores above a random clean one (ties = 0.5)."""
    if not pos or not neg:
        return None
    wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
    return round(wins / (len(pos) * len(neg)), 3)


def confusion(rows, pred_key):
    tp = sum(r["has_bug"] and r[pred_key] for r in rows)
    fp = sum((not r["has_bug"]) and r[pred_key] for r in rows)
    fn = sum(r["has_bug"] and not r[pred_key] for r in rows)
    tn = sum((not r["has_bug"]) and not r[pred_key] for r in rows)
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": round(tp / (tp + fp), 3) if tp + fp else None,
            "recall": round(tp / (tp + fn), 3) if tp + fn else None,
            "false_alarm_rate": round(fp / (fp + tn), 3) if fp + tn else None}


def main():
    key = os.environ["TYPESAFE_API_KEY"].strip()
    os.makedirs(os.path.join(HERE, "jev"), exist_ok=True)
    truth = json.load(open(os.path.join(HERE, "truth.json")))
    rows, tokens, skipped = [], 0, []
    for t in truth:
        ep = os.path.join(HERE, "eye", f"{t['id']}.json")
        if not os.path.exists(ep):
            skipped.append(t["id"]); continue
        eye = json.load(open(ep))
        if not eye.get("ok"):
            skipped.append(t["id"]); continue
        jp = os.path.join(HERE, "jev", f"{t['id']}.json")
        if os.path.exists(jp):
            j = json.load(open(jp))
        else:
            j = ask(state_of(eye), key)
            if "answers" in j:
                json.dump(j, open(jp, "w"), indent=1)
        if "answers" not in j:
            skipped.append(t["id"]); continue
        tokens += (j.get("usage") or {}).get("input_tokens", 0)
        a = j["answers"]
        p = a["real_bug"]["noul"]
        p = p.get("probability") if isinstance(p, dict) else p
        issues = eye.get("issues") or []
        rows.append({**t,
                     "eye_flag": bool(eye.get("has_issues")),
                     "eye_score": sum(SEV_W.get(i.get("severity"), 1) for i in issues),
                     "eye_issues": [i.get("description") for i in issues],
                     "jev_p": float(p), "jev_flag": float(p) >= 0.5,
                     "jev_severity": a["severity"].get("choice")})
    pos = [r for r in rows if r["has_bug"]]
    neg = [r for r in rows if not r["has_bug"]]
    report = {
        "n": len(rows), "skipped": skipped,
        "auc_jev": auc([r["jev_p"] for r in pos], [r["jev_p"] for r in neg]),
        "auc_eye_score": auc([r["eye_score"] for r in pos], [r["eye_score"] for r in neg]),
        "eye_flag": confusion(rows, "eye_flag"),
        "jev_flag@0.5": confusion(rows, "jev_flag"),
        "eye_flag_then_jev": confusion([{**r, "gate": r["eye_flag"] and r["jev_flag"]} for r in rows], "gate"),
        "by_kind_mean_jev_p": {k: round(sum(r["jev_p"] for r in rows if r["kind"] == k) / max(1, sum(r["kind"] == k for r in rows)), 3)
                               for k in ("bug", "clean", "tricky")},
        "jev_input_tokens": tokens, "jev_cost_usd": round(tokens / 1e6 * 0.042, 5),
    }
    report["pass"] = bool(report["auc_jev"] is not None and report["auc_jev"] >= 0.8
                          and (report["auc_eye_score"] is None or report["auc_jev"] > report["auc_eye_score"]))
    json.dump({"report": report, "rows": rows}, open(os.path.join(HERE, "result.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
