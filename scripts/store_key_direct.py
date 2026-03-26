#!/usr/bin/env python3
"""
KV에 직접 REST API로 키 저장 (wrangler 우회)
"""
import json, os, sys
import urllib.request, urllib.error

NAMESPACE_ID = "ab9b493f77ae443197620421f259365b"
KEY = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("PERCEPT_NEW_KEY", "")
if not KEY:
    print("사용법: python3 store_key_direct.py <pd_live_...키>")
    sys.exit(1)

# 1) 토큰 읽기
token = ""
try:
    with open("api_keys/cloudflare_api.env") as f:
        for line in f:
            line = line.strip()
            if line.startswith("CLOUDFLARE_API_TOKEN=") and "=" in line:
                token = line.split("=", 1)[1].strip()
except FileNotFoundError:
    pass

if not token:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "")

if not token:
    print("❌ CLOUDFLARE_API_TOKEN 없음")
    sys.exit(1)

print(f"✅ 토큰 로드됨 ({len(token)}자)")

# 2) Account ID 조회
try:
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/accounts?per_page=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    resp = urllib.request.urlopen(req)
    data = json.load(resp)
    account_id = data["result"][0]["id"]
    print(f"✅ Account ID: {account_id[:8]}...")
except Exception as e:
    print(f"❌ Account ID 조회 실패: {e}")
    sys.exit(1)

# 3) KV에 저장
record = json.dumps({
    "key": KEY,
    "email": "internal@perceptdot.com",
    "plan": "team",
    "quota": 999999,
    "calls_used": 0,
    "created_at": "2026-03-26T00:00:00Z"
}).encode()

url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{NAMESPACE_ID}/values/key%3A{KEY}"
try:
    req = urllib.request.Request(
        url,
        data=record,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    resp = urllib.request.urlopen(req)
    result = json.load(resp)
    if result.get("success"):
        print(f"✅ KV 저장 성공! (키 앞 12자: {KEY[:12]}...)")
    else:
        print(f"❌ KV 저장 실패: {result}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"❌ HTTP {e.code}: {body}")
except Exception as e:
    print(f"❌ 오류: {e}")
