#!/usr/bin/env python3
import subprocess, os, json, sys

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mcp_dir = os.path.join(base, "mcp")

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

# settings.json에서 PERCEPT_API_KEY
key = ""
try:
    s = json.load(open(os.path.expanduser("~/.claude/settings.json")))
    key = s.get("env", {}).get("PERCEPT_API_KEY", "")
except: pass
if not key:
    print("❌ PERCEPT_API_KEY 없음"); sys.exit(1)

env = os.environ.copy()
env["CLOUDFLARE_API_TOKEN"] = token

# 1) wrangler secret put
print("1) PERCEPT_API_KEY secret 등록 중...")
r = subprocess.run(
    ["npx", "wrangler", "secret", "put", "PERCEPT_API_KEY"],
    input=key + "\n",
    text=True, env=env, cwd=mcp_dir
)
print("✅ secret 등록 완료" if r.returncode == 0 else f"❌ 실패 (code {r.returncode})")

# 2) wrangler deploy
print("2) 배포 중...")
r = subprocess.run(
    ["npx", "wrangler", "deploy"],
    text=True, env=env, cwd=mcp_dir
)
print("✅ 배포 완료" if r.returncode == 0 else f"❌ 배포 실패 (code {r.returncode})")
