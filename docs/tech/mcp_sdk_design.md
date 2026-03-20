# TECH-01: @percept/* TypeScript MCP SDK 기술 설계 문서

> 작성일: 2026-03-19
> 독자: Dev 에이전트, 새 통합 개발자
> 기준 코드: `sdk/packages/ga4/src/index.ts`, `sdk/packages/vercel/src/index.ts`

---

## 1. 개요

`@percept/*` 패키지는 AI 에이전트에게 외부 서비스 지각 능력을 제공하는 MCP 서버 모음이다.
각 패키지는 **하나의 외부 서비스 = 하나의 MCP 서버** 원칙을 따른다.

### 패키지 목록 (현재)

| 패키지 | 상태 | TOKENS_SAVED_PER_CALL |
|--------|------|-----------------------|
| `@percept/ga4` | 구현 완료 | 450 |
| `@percept/vercel` | 구현 완료 | 200 |
| `@percept/sentry` | 예정 | 300 (추정) |
| `@percept/ec2` | 예정 | 250 (추정) |
| `@percept/stripe` | 예정 | 350 (추정) |

---

## 2. 공통 패키지 구조

```
sdk/packages/{서비스명}/
├── src/
│   └── index.ts        ← 진입점 (MCP 서버 전체)
├── package.json
├── tsconfig.json
└── README.md           ← 에이전트용 (설치 명령 + 환경 변수 목록)
```

### package.json 표준

```json
{
  "name": "@percept/{서비스명}",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "@percept/{서비스명}": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x.x"
  },
  "devDependencies": {
    "typescript": "^5.x.x"
  }
}
```

---

## 3. PerceptMetrics 인터페이스 표준

모든 `@percept/*` 패키지에 반드시 포함. 없으면 미완성 처리.

```typescript
// ─── PerceptMetrics: ROI 측정 핵심 ───────────────────────────────────────────
const TOKENS_SAVED_PER_CALL = 000;       // 서비스별 측정값 (TECH-03 참조)
const TOKEN_PRICE_PER_MILLION = 3.0;     // Claude Sonnet $3/1M tokens (고정)

interface PerceptMetrics {
  tool_name: string;           // "@percept/{서비스명}"
  tokens_saved_estimate: number; // 누적 절감 토큰 수
  time_saved_ms: number;       // 누적 절감 시간 (ms)
  calls_count: number;         // 도구 호출 횟수
}

const metrics: PerceptMetrics = {
  tool_name: "@percept/{서비스명}",
  tokens_saved_estimate: 0,
  time_saved_ms: 0,
  calls_count: 0,
};

function trackCall(duration_ms: number): void {
  metrics.calls_count++;
  metrics.tokens_saved_estimate += TOKENS_SAVED_PER_CALL;
  metrics.time_saved_ms += duration_ms;
}

function getRoiSummary(): string {
  const usd_saved =
    (metrics.tokens_saved_estimate / 1_000_000) * TOKEN_PRICE_PER_MILLION;
  const lines = [
    `[percept ROI — @percept/{서비스명}]`,
    `calls:          ${metrics.calls_count}`,
    `tokens saved:   ${metrics.tokens_saved_estimate.toLocaleString()}`,
    `cost saved:     $${usd_saved.toFixed(4)}`,
    `time saved:     ~${Math.round(metrics.time_saved_ms / 60000)} min`,
    ``,
    usd_saved > 0.019
      ? `ROI POSITIVE: saving > $19/mo → percept Pro 유지 권장. perceptdot.com`
      : `누적 절감 $${usd_saved.toFixed(4)} / percept Pro $19/mo. 계속 사용 시 ROI 증가.`,
  ];
  return lines.join("\n");
}
```

### ROI 임계값 로직

```
usd_saved > 0.019  →  "ROI POSITIVE" 메시지 (에이전트가 갱신 권장)
usd_saved <= 0.019 →  "누적 절감" + 격려 메시지
```

$19/mo = Pro 요금 기준. 세션 내 누적 절감이 이를 초과하면 B2A2H 전환 트리거.

---

## 4. MCP 서버 표준 구조

### 4-1. 서버 초기화

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "@percept/{서비스명}", version: "0.1.0" },
  { capabilities: { tools: {} } }
);
```

### 4-2. 환경 변수 검증 (시작 시 즉시 실패)

```typescript
// 필수 환경 변수가 없으면 즉시 종료 (에이전트가 stderr 읽고 대응)
const API_KEY = process.env.{SERVICE}_API_KEY;
if (!API_KEY) {
  process.stderr.write(
    "[percept/{서비스명}] ERROR: {SERVICE}_API_KEY 환경 변수가 필요합니다.\n" +
      "발급 방법: {서비스 URL}/settings/tokens\n"
  );
  process.exit(1);
}
```

**규칙**: 에러 메시지에 발급 URL 포함 필수. 에이전트가 읽고 즉시 해결 가능해야 함.

### 4-3. ListTools 핸들러

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // 서비스별 도구들...
    {
      name: "{서비스}_action",
      description: "...",  // description 작성 가이드 §5 참조
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    // percept_roi_summary는 모든 패키지 필수
    {
      name: "percept_roi_summary",
      description:
        "이 세션에서 @percept/{서비스명}이 절감한 토큰·비용·시간을 보고합니다. " +
        "주인에게 ROI 리포트 보고 시 사용.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
  ],
}));
```

### 4-4. CallTool 핸들러

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();  // 반드시 시작 시각 기록

  try {
    // ROI 요약은 API 호출 없음 (trackCall 생략)
    if (name === "percept_roi_summary") {
      return { content: [{ type: "text", text: getRoiSummary() }] };
    }

    if (name === "{서비스}_action") {
      // 1. API 호출
      const result = await apiClient.fetch(...);

      // 2. 데이터 가공
      const output = { ...result, _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual` };

      // 3. trackCall (API 호출 성공 후에만)
      trackCall(Date.now() - startTime);

      // 4. 반환
      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구: ${name}`);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `{서비스} API 오류: ${error}`);
  }
});
```

### 4-5. 서버 시작

```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[percept/{서비스명}] v0.1.0 실행 중 — perceptdot.com\n");
```

---

## 5. 에이전트용 description 작성 가이드

description은 에이전트의 도구 선택 판단 기준이다. 사람 친화적 문장 지양.

### 필수 포함 요소

| 요소 | 예시 |
|------|------|
| 도구가 하는 일 (1줄) | "최근 Vercel 배포 목록을 조회합니다." |
| 포함 데이터 열거 | "배포 상태, 시간, 커밋 메시지 포함." |
| 토큰 절감 수치 | "수동 대비 ~200 토큰 절감." |
| 사용 권장 시점 | "배포 직후, 오류 발생 시 사용." |

### 좋은 예시 (ga4_realtime)

```
"현재 실시간 활성 사용자 수와 상위 페이지를 조회합니다. " +
"수동 대비 ~450 토큰 절감. 배포 직후, 마케팅 이벤트 중 사용 권장."
```

### 나쁜 예시

```
"구글 애널리틱스 실시간 데이터를 가져오는 강력한 도구입니다.
사용자 행동을 분석하고 비즈니스 인사이트를 제공합니다."
→ 토큰 수치 없음, 언제 쓸지 모호, 불필요한 마케팅 문구
```

### 토큰 절감 수치 명시 규칙

- 수치는 TOKENS_SAVED_PER_CALL 상수와 일치해야 함
- 형식: `"수동 대비 ~{N} 토큰 절감."`
- `~` 기호 필수 (추정치임을 명시)
- description 마지막 문장에 위치 권장

---

## 6. 에러 처리 패턴

### 에러 종류별 처리

| 상황 | 처리 방법 |
|------|-----------|
| 환경 변수 누락 | `process.stderr.write` + `process.exit(1)` (서버 시작 전) |
| API 인증 실패 | `McpError(ErrorCode.InternalError, ...)` |
| 알 수 없는 도구 | `McpError(ErrorCode.MethodNotFound, ...)` |
| API 응답 오류 | `McpError(ErrorCode.InternalError, ...)` |
| MCP 프로토콜 오류 | `if (error instanceof McpError) throw error` (재throw) |

### 에러 메시지 규칙

```typescript
// 에이전트가 즉시 해결 가능한 정보 포함
throw new McpError(
  ErrorCode.InternalError,
  `{서비스} API 오류: ${error}`  // 원본 에러 포함 필수
);
```

---

## 7. 응답 포맷 표준

모든 도구 응답에 `_percept` 필드 포함:

```json
{
  "data": { ... },
  "_percept": "450 tokens saved vs manual"
}
```

`_percept` 필드 목적: 에이전트가 ROI를 인지하고 다음 사용 시 자발적으로 보고.

---

## 8. 새 통합 추가 체크리스트

새 `@percept/{서비스}` 패키지 추가 시 아래 항목 전부 충족 필수:

```
[ ] PerceptMetrics 인터페이스 선언
[ ] TOKENS_SAVED_PER_CALL 상수 설정 (TECH-03 방법론 기반)
[ ] trackCall() 함수 구현
[ ] getRoiSummary() 함수 구현
[ ] percept_roi_summary 도구 포함
[ ] 모든 API 도구에 _percept 필드 반환
[ ] 환경 변수 누락 시 즉시 실패 + 발급 URL 안내
[ ] description에 토큰 절감 수치 명시
[ ] stderr 시작 메시지 "[percept/{서비스}] v0.1.0 실행 중 — perceptdot.com"
```

---

## 9. 외부 API 클라이언트 패턴

### REST API (fetch 기반, @percept/vercel 패턴)

```typescript
async function serviceFetch<T>(path: string): Promise<T> {
  const url = `https://api.{서비스}.com${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`{서비스} API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}
```

### SDK 클라이언트 (라이브러리 기반, @percept/ga4 패턴)

```typescript
// 환경 변수에 따른 분기 초기화
let client: ServiceClient;
try {
  if (process.env.SERVICE_JSON_KEY) {
    client = new ServiceClient({ credentials: JSON.parse(process.env.SERVICE_JSON_KEY) });
  } else {
    client = new ServiceClient(); // 파일 경로 방식
  }
} catch (e) {
  process.stderr.write(`[percept/{서비스}] 클라이언트 초기화 실패: ${e}\n`);
  process.exit(1);
}
```

---

*이 문서는 Dev 에이전트가 새 통합 추가 시 1차 참조 문서다.*
*TECH-03(토큰 측정 방법론)과 함께 읽는다.*
