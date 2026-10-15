"""Run eye (production /v1/eye/check) on every benchmark page and store raw results.

Usage: PERCEPT_KEY=... python3 -I run_eye.py <base_url>
  base_url: where pages/*.html are publicly served, e.g. https://gist.githack.com/<user>/<gist>/raw
Results: eye/<id>.json (skips ids already stored, so it can resume).
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.perceptdot.com/v1/eye/check"


def main():
    base = sys.argv[1].rstrip("/")
    key = (os.environ.get("PERCEPT_MASTER_KEY") or os.environ["PERCEPT_KEY"]).strip()  # internal master key first (team plan, 30k/month)
    out_dir = os.path.join(HERE, os.environ.get("EYE_OUT", "eye"))  # EYE_OUT=eye_v2 keeps earlier runs intact
    os.makedirs(out_dir, exist_ok=True)
    truth = json.load(open(os.path.join(HERE, "truth.json")))
    for row in truth:
        out = os.path.join(out_dir, f"{row['id']}.json")
        if os.path.exists(out) and json.load(open(out)).get("ok"):
            continue  # retry only failed runs
        body = json.dumps({"url": f"{base}/{row['id']}.html", "no_cache": True, "viewport": "desktop"}).encode()
        req = urllib.request.Request(API, data=body, headers={"Content-Type": "application/json", "X-Percept-Key": key,
                                                             "User-Agent": "perceptdot-jev-bench/1.0"})  # default urllib UA is blocked by CF (1010)
        for attempt in range(6):
            try:
                with urllib.request.urlopen(req, timeout=90) as r:
                    res = json.load(r)
            except urllib.error.HTTPError as e:
                res = {"ok": False, "status": e.code, "error": e.read()[:300].decode("utf-8", "replace")}
            except Exception as e:  # never print the request (it carries the key)
                res = {"ok": False, "error": type(e).__name__}
            if "Rate limit" not in str(res.get("error", "")):
                break
            time.sleep(30 * (attempt + 1))  # CF Browser Rendering caps new browsers per minute; failed runs use no credit
        with open(out, "w") as f:
            json.dump(res, f, indent=1)
        print(row["id"], "ok" if res.get("ok") else f"FAIL {res.get('status', '')} {res.get('error', '')[:80]}",
              "issues=", len(res.get("issues") or []), "quota_left=", res.get("quota_remaining"), flush=True)
        if res.get("status") in (401, 402, 429):
            sys.exit("stopped: auth/quota/rate limit")
        time.sleep(20)


if __name__ == "__main__":
    main()
