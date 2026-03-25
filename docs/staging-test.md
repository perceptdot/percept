# perceptdot/eye — 가상 스테이징 테스트 가이드

> 작성: 2026-03-25 | Dev 에이전트
> 목적: CEO가 MVP 크레딧 시스템을 직접 테스트할 수 있는 환경

---

## 테스트 키 목록

| 키 | 플랜 | 쿼터 | 용도 |
|----|------|------|------|
| `pd_test_free_staging01` | Free | 20 타일 | 크레딧 차감 테스트 |
| `pd_test_pro_staging01` | Pro | 무제한 | 유료 플랜 테스트 |
| `pd_test_exhausted_01` | Free | 0/100 (소진) | 쿼터 초과 에러 테스트 |

> ⚠️ 테스트 키는 실제 브라우저 + AI를 사용합니다. 타일당 실제 크레딧 소모.

---

## 시나리오별 curl 명령

### 시나리오 1 — 정상 동작 (Free 키, 크레딧 차감 확인)

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_test_free_staging01" \
  -d '{"url":"https://example.com","no_cache":true}'
```

**기대 응답 핵심 필드:**
```json
{
  "ok": true,
  "has_issues": false,
  "tiles_analyzed": 1,
  "credits_used": 1,
  "quota_remaining": 19,
  "summary": "..."
}
```

---

### 시나리오 2 — 긴 페이지 (멀티타일, 크레딧 여러 개 소모)

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_test_free_staging01" \
  -d '{"url":"https://perceptdot.com","no_cache":true}'
```

**기대 응답:** `tiles_analyzed: 5, quota_remaining: 14` (5타일 소모)

---

### 시나리오 3 — 버그 페이지 감지

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_test_free_staging01" \
  -d '{"url":"https://perceptdot.com/bug-demo","no_cache":true}'
```

**기대 응답:** `has_issues: true, issues: [...]`

---

### 시나리오 4 — Pro 키 (unlimited, quota_remaining: "unlimited")

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_test_pro_staging01" \
  -d '{"url":"https://example.com","no_cache":true}'
```

**기대 응답:** `quota_remaining: "unlimited"`

---

### 시나리오 5 — 쿼터 소진 (402 에러)

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_test_exhausted_01" \
  -d '{"url":"https://example.com"}'
```

**기대 응답 (HTTP 402):**
```json
{
  "ok": false,
  "error": "Free quota reached (100 tiles). Submit feedback to unlock 100 more.",
  "quota_remaining": 0,
  "needs_feedback": true
}
```

---

### 시나리오 6 — 잘못된 키 (401 에러)

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -H "X-Percept-Key: pd_invalid_xxx" \
  -d '{"url":"https://example.com"}'
```

**기대 응답 (HTTP 401):**
```json
{
  "ok": false,
  "error": "Invalid API key. Get a free key at perceptdot.com"
}
```

---

### 시나리오 7 — body에 api_key 포함 (MCP 서버 방식)

```bash
curl -X POST https://api.perceptdot.com/v1/eye/check \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","api_key":"pd_test_pro_staging01","no_cache":true}'
```

헤더 대신 body에 키를 넣어도 동작합니다.

---

## 현재 쿼터 확인 방법

```bash
# free 키 현재 상태 확인
curl https://api.perceptdot.com/v1/validate?key=pd_test_free_staging01
```

---

## 테스트 완료 체크리스트

```
□ 시나리오 1: Free 키 정상 동작 + quota_remaining 감소 확인
□ 시나리오 2: 긴 페이지에서 타일 수만큼 크레딧 소모 확인
□ 시나리오 3: 버그 페이지 has_issues=true 확인
□ 시나리오 4: Pro 키 unlimited 확인
□ 시나리오 5: 쿼터 소진 402 + needs_feedback 확인
□ 시나리오 6: 잘못된 키 401 확인
```

---

## 테스트 키 리셋 방법

Free 키 쿼터 초기화 (Dev에게 요청하거나 아래 명령):

```bash
# Dev 에이전트가 실행
source api_keys/cloudflare_api.env
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN npx wrangler kv key put \
  "key:pd_test_free_staging01" \
  '{"key":"pd_test_free_staging01","email":"ceo-test@perceptdot.com","plan":"free","created_at":"2026-03-25T00:00:00.000Z","calls_used":0,"quota":20,"feedback_count":0}' \
  --binding API_KEYS --env production
```

---

## 다음 단계 (MVP 출시까지)

```
✅ EYE-08 Full-Page Tiling
✅ EYE-CREDIT 크레딧 차감 시스템
⏳ PAY-ENABLE Paddle 결제 버튼 재활성화
⏳ EYE-06 데모 영상
⏳ EYE-07 Show HN
```
