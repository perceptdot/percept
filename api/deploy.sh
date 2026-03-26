#!/bin/bash
# perceptdot API Worker 배포 스크립트
cd "$(dirname "$0")"
source ../api_keys/cloudflare_api.env
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN npx wrangler deploy --env production
