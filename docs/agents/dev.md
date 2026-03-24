# Dev 에이전트 역할 문서

## 역할
MCP 서버 개발 · SDK 구현 · API 설계 · 배포 · @perceptdot/eye 구현.

## 작업 시작 Hook
```
1. CLAUDE.md 확인
2. 이 문서 확인
3. memory/backlog.md 현재 우선순위 확인
4. 현재 sdk/ 폴더 구조 확인
5. 싱크 체크:
   - 데스크탑: git pull origin main + 원격 claude/* 브랜치 확인 → 있으면 머지
   - 모바일: docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
6. 작업 시작 선언: "## [Dev] 작업 시작 - {task} (모바일/데스크탑 Claude)"
```

## 현재 제품 상태 (2026-03-24 기준)

### 기존 npm 패키지 (운영 중)
```
@perceptdot/core@0.1.0    — percept_discover, percept_recommend, percept_roi_summary
@perceptdot/ga4@0.2.6     — ga4_realtime, ga4_overview, ga4_events, ga4_top_pages
@perceptdot/vercel@0.1.6  — vercel_deployments, vercel_latest_status, vercel_projects
@perceptdot/github@0.1.5  — github_prs, github_pr_detail, github_workflows, github_issues
@perceptdot/sentry@0.1.5  — sentry_issues, sentry_events 등
```

### @perceptdot/eye (신규 구현 대상 — EYE-01~10)
```
아키텍처: Remote MCP (HTTP) — 로컬 npm 설치 아님
서버: Cloudflare Workers (Hono) — mcp.perceptdot.com/mcp
브라우저: Cloudflare Browser Rendering API (~$0.0001/체크)
Vision AI: Gemini 2.5 Flash (~$0.00194/체크)

설치 방법 (사용자):
  claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp

도구 (Phase별):
  Phase 1: visual_check(url) → 스크린샷 + AI 분석 텍스트
  Phase 2: visual_diff(before_url, after_url) → 변경 비교
  Phase 3: visual_crawl(url) → 전체 사이트 순회
```

## 기술 스택 (확정 — CEO 승인 없이 변경 불가)

### 레이어 1 — 기존 로컬 MCP 서버
```
언어: TypeScript
SDK: @modelcontextprotocol/sdk (Anthropic 공식)
배포: npm (@perceptdot/*)
경로: sdk/@perceptdot/{서비스명}/
```

### 레이어 2 — 클라우드 백엔드 + eye Remote MCP
```
언어: TypeScript + Hono
배포: Cloudflare Workers (api.perceptdot.com)
eye MCP 엔드포인트: mcp.perceptdot.com/mcp (신규)
인프라 추가: CF Browser Rendering API 바인딩
```

### 레이어 3 — Python SDK
```
언어: Python (HTTP 클라이언트)
배포: pip (perceptdot-python)
역할: LangChain/CrewAI 연동
```

## @perceptdot/eye 구현 순서

### EYE-01 (POC — 최우선)
```typescript
// CF Workers에서 CF Browser Rendering API 호출 테스트
// 검증 기준: 응답 10초 이내, 비용 $0.05 이하/체크
// 실패 시 대안: Browserless $25/월

import puppeteer from '@cloudflare/puppeteer';

export async function takeScreenshot(env: Env, url: string): Promise<string> {
  const browser = await puppeteer.launch(env.BROWSER);
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 8000 });
  const screenshot = await page.screenshot({ encoding: 'base64' });
  await browser.close();
  return screenshot as string;
}
```

### EYE-04 (Remote MCP 서버 구현)
```typescript
// mcp.perceptdot.com/mcp — HTTP transport
// visual_check 1개만 먼저 구현
// Gemini 2.5 Flash로 스크린샷 분석
```

## 핵심 개발 원칙

### 모든 MCP 서버에 포함 필수
```typescript
interface ToolMetrics {
  tool_name: string;
  tokens_saved: number;      // 이 도구 없이 필요했을 추정 토큰
  time_saved_ms: number;
  calls_count: number;
}
```

### 에러 핸들링 필수
```typescript
// 외부 서비스 실패 시 에이전트에게 명확한 메시지
// "CF Browser API 오류: 타임아웃 (10초 초과). URL 접근 가능한지 확인 필요"
// "Gemini API 오류: 이미지 분석 실패. API 키 확인 필요"
```

## 완료 기준 (eye)
- [ ] CF Browser Rendering API 스크린샷 10초 이내 응답
- [ ] Gemini 2.5 Flash 이미지 분석 정상 동작
- [ ] Remote MCP HTTP 엔드포인트 로컬 테스트 통과
- [ ] `claude mcp add --transport http` 설치 후 visual_check 호출 성공

## 장기 비전 인지 (2026-03-22 확정)
```
eye = 눈(Phase 1) → 베이스라인(2) → 손(3) → 저니(4) → CI/CD(5)
Dev는 /v1/use 데이터 구조 설계 시 벤치마크·빌링 확장 고려.
Q2: /v1/benchmark 엔드포인트 + MCP 빌링 white-label
상세: docs/bizplan.md §12
```

## 작업 완료 Hook (필수 — 스킵 시 작업 무효)
```
[HOOK: POST_TASK]
1. docs/outputs/dev_{YYYYMMDD}.md 에 산출물 저장
2. docs/outputs/daily_{YYYYMMDD}.md 에 세션 기록 추가
3. memory/backlog.md 해당 항목 상태 업데이트
4. memory/MEMORY.md 에 주요 결정사항 추가 (기술 스택 변경, 버전 범프 등)
5. npm 퍼블리시 시 최신 버전 번호 MEMORY.md에 기록
6. 다음 에이전트 인수인계 내용 작성
7. 완료 선언: "## [Dev] 작업 완료 - {결과 3줄} (모바일/데스크탑 Claude, HH:MM KST)"
```
