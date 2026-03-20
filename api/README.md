# @perceptdot/api

Cloudflare Workers 위에서 동작하는 Hono 백엔드.
MCP 서버로부터 메트릭을 수신하고 ROI를 집계·리포트합니다.

## 실행

```bash
npm install
npm run dev      # 로컬 개발 (wrangler dev)
npm run deploy   # Cloudflare 배포
```

## 엔드포인트

### GET /health

헬스체크. 서비스 상태 및 추적 중인 세션 수 반환.

```json
{
  "status": "ok",
  "service": "perceptdot-api",
  "version": "0.1.0",
  "timestamp": "2026-03-19T00:00:00.000Z",
  "sessions_tracked": 3
}
```

---

### POST /v1/metrics

MCP 서버가 도구 호출 후 절약 수치를 보고합니다.
세션별 누적 집계 후 현재 ROI를 즉시 반환합니다.

**요청**

```json
{
  "session_id": "sess_abc123",
  "tool_name": "@perceptdot/ga4",
  "tokens_saved": 1200,
  "time_saved_ms": 3500,
  "calls_count": 1,
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

**응답 (201)**

```json
{
  "ok": true,
  "message": "메트릭 수신 완료",
  "current_roi": {
    "session_id": "sess_abc123",
    "total_tokens_saved": 1200,
    "total_cost_saved_usd": 0.006,
    "total_time_saved_min": 0.1,
    "calls_count": 1,
    "roi_positive": false
  }
}
```

---

### GET /v1/roi/:session_id

특정 세션의 누적 ROI를 조회합니다.
`roi_positive=true`이면 B2A2H 업셀 메시지가 포함됩니다.

**응답 (200)**

```json
{
  "session_id": "sess_abc123",
  "total_tokens_saved": 4200000,
  "total_cost_saved_usd": 21.0,
  "total_time_saved_min": 58.3,
  "calls_count": 142,
  "roi_positive": true,
  "upsell_message": "percept Pro 구독이 이미 본전을 넘었습니다. 계속 유지하세요. perceptdot.com"
}
```

**오류 (404)**

```json
{
  "error": "세션을 찾을 수 없습니다.",
  "session_id": "sess_notfound"
}
```

---

### POST /v1/report

ROI 리포트를 생성합니다.

| 파라미터 | 타입 | 설명 |
|---|---|---|
| `session_id` | string (선택) | 생략 시 전체 세션 요약 |
| `format` | `"summary"` \| `"detail"` | detail이면 세션 목록 포함 |

**요청 예시 — 전체 요약**

```json
{ "format": "summary" }
```

**응답**

```json
{
  "report_type": "global",
  "generated_at": "2026-03-19T12:00:00.000Z",
  "sessions_count": 5,
  "totals": {
    "total_tokens_saved": 12000000,
    "total_cost_saved_usd": 60.0,
    "total_time_saved_min": 200.5,
    "calls_count": 420,
    "roi_positive": true,
    "upsell_message": "percept Pro 구독이 이미 본전을 넘었습니다. 계속 유지하세요. perceptdot.com"
  }
}
```

**요청 예시 — 단일 세션 상세**

```json
{
  "session_id": "sess_abc123",
  "format": "detail"
}
```

---

## ROI 계산 기준

| 항목 | 값 |
|---|---|
| 토큰 단가 | $0.000005 / token (GPT-4o input 평균) |
| Pro 월 구독가 | $19/mo |
| roi_positive 조건 | `total_cost_saved_usd >= $19` |

## 스토리지

현재 인메모리 Map 사용 (Workers 재시작 시 초기화됨).
추후 Cloudflare KV 또는 D1으로 교체 예정.
