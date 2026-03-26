#!/usr/bin/env python3
"""
internal@perceptdot.com 용 팀 플랜 키를 KV에 직접 생성
실행: python3 scripts/create_internal_key.py
"""
import subprocess, json, secrets, datetime, sys, os

# 새 pd_live_ 키 생성
new_key = "pd_live_" + secrets.token_hex(16)

record = {
    "key": new_key,
    "email": "internal@perceptdot.com",
    "plan": "team",
    "quota": 999999,
    "calls_used": 0,
    "created_at": datetime.datetime.utcnow().isoformat() + "Z"
}

NAMESPACE_ID = "ab9b493f77ae443197620421f259365b"
CONFIG = "api/wrangler.toml"

# KV에 저장
cmd = [
    "npx", "wrangler", "kv", "key", "put",
    f"key:{new_key}",
    json.dumps(record),
    "--namespace-id", NAMESPACE_ID,
    "--remote",
    "--config", CONFIG
]

print(f"새 키 생성 중...")
env = os.environ.copy()
# cloudflare_api.env에서 직접 읽어서 주입
try:
    with open("api_keys/cloudflare_api.env") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
except FileNotFoundError:
    pass

result = subprocess.run(cmd, capture_output=True, text=True, env=env)

if result.returncode == 0:
    print(f"✅ 성공!")
    print(f"새 PERCEPT_API_KEY: {new_key}")
    print(f"\nsettings.json의 PERCEPT_API_KEY를 위 값으로 교체하세요.")
else:
    print(f"❌ 실패: {result.stderr}")
    sys.exit(1)
