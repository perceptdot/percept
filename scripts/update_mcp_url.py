#!/usr/bin/env python3
import json, sys, os

KEY = sys.argv[1] if len(sys.argv) > 1 else ""
if not KEY:
    print("사용법: python3 update_mcp_url.py <pd_live_...키>")
    sys.exit(1)

updated = False
for path in [
    os.path.expanduser('~/.claude.json'),
    os.path.expanduser('~/.claude/.mcp.json'),
]:
    if not os.path.exists(path):
        continue
    d = json.load(open(path))
    servers = d.get('mcpServers') or d.get('projects', {})
    # claude.json 구조 처리
    if 'mcpServers' in d:
        for k, v in d['mcpServers'].items():
            if 'mcp.perceptdot.com' in v.get('url', ''):
                v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={KEY}'
                print(f'Updated in {path}: {k}')
                updated = True
    # 중첩 구조 처리 (claude.json은 projects 아래에 있을 수도 있음)
    for proj in d.get('projects', {}).values():
        for k, v in proj.get('mcpServers', {}).items():
            if 'mcp.perceptdot.com' in v.get('url', ''):
                v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={KEY}'
                print(f'Updated in {path} (project): {k}')
                updated = True
    open(path, 'w').write(json.dumps(d, indent=2))

if updated:
    print('Done — Claude Code 재시작 필요')
else:
    print('perceptdot MCP 항목을 찾지 못함')
