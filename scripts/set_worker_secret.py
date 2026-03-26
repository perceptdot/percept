#!/usr/bin/env python3
"""CF REST API로 Worker secret 등록 (wrangler 우회)"""
import json, os, sys
import urllib.request, urllib.error, urllib.parse

SCRIPT_NAME = "perceptdot-mcp"

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 토큰 로드
token = ""
try:
    with open(os.path.join(base, "api_keys/cloudflare_api.env")) as f:
        for line in f:
            if line.startswith("CLOUDFLARE_API_TOKEN="):
                token = line.split("=", 1)[1].strip()
except: pass
if not token:
    print("❌ CLOUDFLARE_API_TOKEN 없음"); sys.exit(1)

# settings.json에서 키 읽기
key = ""
try:
    s = json.load(open(os.path.expanduser("~/.claude/settings.json")))
    key = s.get("env", {}).get("PERCEPT_API_KEY", "")
except: pass
if not key:
    print("❌ PERCEPT_API_KEY 없음"); sys.exit(1)
print("✅ 키 확인됨")

# Account ID
try:
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/accounts?per_page=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    account_id = json.load(urllib.request.urlopen(req))["result"][0]["id"]
    print("✅ Account ID 확인")
except Exception as e:
    print(f"❌ Account ID 실패: {e}"); sys.exit(1)

# Worker secret PUT
url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{SCRIPT_NAME}/secrets"
body = json.dumps({"name": "PERCEPT_API_KEY", "text": key, "type": "secret_text"}).encode()
try:
    req = urllib.request.Request(url, data=body, method="PUT",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    result = json.load(urllib.request.urlopen(req))
    if result.get("success"):
        print("✅ Worker secret 등록 완료")
    else:
        print(f"❌ 실패: {result}")
        sys.exit(1)
except urllib.error.HTTPError as e:
    print(f"❌ HTTP {e.code}: {e.read().decode()}"); sys.exit(1)
