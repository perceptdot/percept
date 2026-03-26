#!/usr/bin/env python3
import json, sys

KEY = sys.argv[1] if len(sys.argv) > 1 else ""
if not KEY:
    print("사용법: python3 update_mcp_url.py <pd_live_...키>")
    sys.exit(1)

path = '/Users/rb1009_auto/.claude/.mcp.json'
d = json.load(open(path))
for k, v in d['mcpServers'].items():
    if 'mcp.perceptdot.com' in v.get('url', ''):
        v['url'] = f'https://mcp.perceptdot.com/mcp?api_key={KEY}'
        print(f'Updated: {k}')
open(path, 'w').write(json.dumps(d, indent=2))
print('Done')
