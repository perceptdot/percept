#!/usr/bin/env python3
"""
settings.json의 PERCEPT_API_KEY를 KV에 등록 + MCP URL 업데이트
노출된 구 키는 KV에서 삭제
"""
import json, os, sys, datetime
import urllib.request, urllib.error, urllib.parse

NAMESPACE_ID = "ab9b493f77ae443197620421f259365b"
STALE_KEYS = ["pd_live_5309def4e5c689d4cdec0a6c0aee0b8a"]  # 노출 키

# 1) settings.json에서 PERCEPT_API_KEY 읽기 (값 출력 안 함)
settings_path = os.path.expanduser('~/.claude/settings.json')
key = json.load(open(settings_path)).get('env', {}).get('PERCEPT_API_KEY', '')
if not key:
    print("❌ settings.json에 PERCEPT_API_KEY 없음")
    sys.exit(1)
print("✅ settings.json 키 확인됨")

# 2) Cloudflare 토큰 로드
token = ""
try:
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../api_keys/cloudflare_api.env')
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line.startswith("CLOUDFLARE_API_TOKEN="):
                token = line.split("=", 1)[1].strip()
except FileNotFoundError:
    pass
if not token:
    token = os.environ.get("CLOUDFLARE_API_TOKEN", "")
if not token:
    print("❌ CLOUDFLARE_API_TOKEN 없음")
    sys.exit(1)
print("✅ CF 토큰 로드됨")

# 3) Account ID 조회
try:
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4/accounts?per_page=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    account_id = json.load(urllib.request.urlopen(req))["result"][0]["id"]
    print("✅ Account ID 확인")
except Exception as e:
    print(f"❌ Account ID 조회 실패: {e}")
    sys.exit(1)

def kv_delete(name):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{NAMESPACE_ID}/values/{urllib.parse.quote(name, safe='')}"
    req = urllib.request.Request(url, method="DELETE", headers={"Authorization": f"Bearer {token}"})
    try:
        urllib.request.urlopen(req)
        return True
    except:
        return False

def kv_put(name, value):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{NAMESPACE_ID}/values/{urllib.parse.quote(name, safe='')}"
    req = urllib.request.Request(url, data=value.encode(), method="PUT",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req)).get("success", False)

# 4) 노출 키 KV 삭제
for stale in STALE_KEYS:
    ok = kv_delete(f"key:{stale}")
    print(f"{'✅' if ok else '⚠️'} 노출 키 삭제: ...{stale[-8:]}")

# 5) settings.json 키를 KV에 team 플랜으로 등록
record = json.dumps({
    "key": key,
    "email": "internal@perceptdot.com",
    "plan": "team",
    "quota": 999999,
    "calls_used": 0,
    "created_at": datetime.datetime.utcnow().isoformat() + "Z"
})
if not kv_put(f"key:{key}", record):
    print("❌ KV 저장 실패")
    sys.exit(1)
print("✅ KV 등록 완료 (team 플랜)")

# 6) MCP URL 업데이트
updated = False
for path in [os.path.expanduser('~/.claude.json'), os.path.expanduser('~/.claude/.mcp.json')]:
    if not os.path.exists(path):
        continue
    d = json.load(open(path))
    for k, v in d.get('mcpServers', {}).items():
        if 'mcp.perceptdot.com' in v.get('url', ''):
            v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={key}'
            updated = True
    for proj in d.get('projects', {}).values():
        for k, v in proj.get('mcpServers', {}).items():
            if 'mcp.perceptdot.com' in v.get('url', ''):
                v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={key}'
                updated = True
    open(path, 'w').write(json.dumps(d, indent=2))

print(f"{'✅' if updated else '⚠️'} MCP URL {'업데이트됨' if updated else '항목 없음'}")
print("\n✅ 완료 — Claude Code 재시작하세요")
