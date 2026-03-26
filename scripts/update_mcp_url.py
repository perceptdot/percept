#!/usr/bin/env python3
"""
settings.json의 PERCEPT_API_KEY를 읽어서 MCP URL에 자동 반영
"""
import json, os, sys

settings_path = os.path.expanduser('~/.claude/settings.json')
key = json.load(open(settings_path)).get('env', {}).get('PERCEPT_API_KEY', '')

if not key:
    print("❌ settings.json에 PERCEPT_API_KEY 없음")
    sys.exit(1)

print(f"✅ 키 확인됨 (앞 12자: {key[:12]}...)")

# validate 확인
import urllib.request
resp = urllib.request.urlopen(f"https://api.perceptdot.com/v1/validate?key={key}")
result = json.load(resp)
print(f"KV 상태: valid={result.get('valid')}, plan={result.get('plan')}")

if not result.get('valid'):
    print("❌ KV에 키 없음 — 먼저 KV에 등록 필요")
    sys.exit(1)

# MCP URL 업데이트
updated = False
for path in [
    os.path.expanduser('~/.claude.json'),
    os.path.expanduser('~/.claude/.mcp.json'),
]:
    if not os.path.exists(path):
        continue
    d = json.load(open(path))
    for k, v in d.get('mcpServers', {}).items():
        if 'mcp.perceptdot.com' in v.get('url', ''):
            v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={key}'
            print(f'Updated {path}: {k}')
            updated = True
    for proj in d.get('projects', {}).values():
        for k, v in proj.get('mcpServers', {}).items():
            if 'mcp.perceptdot.com' in v.get('url', ''):
                v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={key}'
                print(f'Updated {path} (project): {k}')
                updated = True
    open(path, 'w').write(json.dumps(d, indent=2))

print('Done' if updated else '항목 못 찾음')
