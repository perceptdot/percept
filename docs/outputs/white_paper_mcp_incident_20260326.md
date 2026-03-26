# White Paper: perceptdot MCP 인프라 장애 — 원인·해결·재발 방지
> 작성: 2026-03-26 | 대상: 전 에이전트 (CPO·PM·Dev·QA·Growth) | 분류: 필수 숙지

---

## 개요

2026-03-25~26에 걸쳐 perceptdot MCP 인프라 전반에 걸친 복합 장애가 발생했다.
총 6개 버그가 연쇄적으로 발생하였고, 세션 5~10에 걸쳐 순차 해결 완료.
이 문서는 동일 사고 재발 방지를 위한 단일 진실 소스다.

---

## 장애 목록 및 원인·해결 요약

### BUG-01: MCP 좀비 프로세스 + 토큰 캐싱 (세션 3~5)

**증상**: MCP 서버가 old 토큰으로 API 호출 → 인증 실패. Claude Code 재시작 후에도 지속.

**근본 원인**:
- Claude Code 시작 시 MCP 프로세스를 spawn하는데, 이 시점에 `.mcp.json` server env를 통해 토큰이 주입됨
- 이후 토큰 교체 시 settings.json은 업데이트되지만, 이미 spawn된 좀비 프로세스는 구 토큰을 메모리에 유지
- Claude Code 내부 캐싱이 `process.env`를 spawn 시점에 고정 → 재시작 없이 갱신 불가

**해결책**:
```
sdk/packages/{github,vercel,ga4}/src/index.ts → readEnvKey() 함수 추가
  - settings.json 파일을 직접 읽어 최신 토큰 획득
  - process.env Claude Code 캐싱 완전 우회
  - tsc 빌드 완료 (3개 패키지 모두)
```

**재발 방지**:
- `.mcp.json` server env에 토큰 절대 저장 금지 → settings.json env만 사용
- MCP 서버는 항상 파일에서 직접 읽는 방식 유지
- `INFRA-MCP-01`: 세션 종료 시 MCP 프로세스 자동 kill hook (미완료, 백로그 유지)

---

### BUG-02: visual_check 401 인증 실패 (세션 9)

**증상**: `visual_check` MCP 툴 호출 시 401 Unauthorized 반환.

**근본 원인**:
- MCP Worker → API Worker 호출 경로에서 `X-Percept-Key` 헤더가 소실
- CF Worker-to-Worker custom domain fetch는 헤더를 신뢰하지 않는 경우 존재
- mcp Worker가 header만 전달, API Worker는 header에서만 키 읽음 → 불일치

**해결책**:
```
mcp/src/index.ts: body에 api_key 추가 (header + body 이중 전달)
api/src/index.ts: body의 api_key도 확인하도록 키 우선순위 조정
  우선순위: 유저 전달 키 > Worker secret
```

**재발 방지**:
- Worker-to-Worker 호출 시 header + body 이중 전달을 표준으로
- 인증 관련 변경 후 반드시 실제 MCP 호출 E2E 테스트

---

### BUG-03: visual_check 블랙스크린 (세션 9)

**증상**: 스크린샷 결과가 완전 블랙 이미지로 반환됨.

**근본 원인**:
- CF Browser Rendering API에서 `load` 이벤트 대기 시 JavaScript 렌더링 미완료
- SPA(Single Page Application) 특성상 load 완료 후에도 JS가 DOM을 변경

**해결책**:
```
api/src/index.ts: waitForFunction 3초 대기 추가
  → JS 렌더링 완료 후 스크린샷 촬영
```

**재발 방지**:
- 브라우저 렌더링 관련 작업 시 `domcontentloaded` → `load` → `networkidle` 순서 인지
- SPA 타겟 URL은 추가 대기 로직 필수

---

### BUG-04: visual_check summary 불일치 (세션 9)

**증상**: 실제 버그 없는 URL에서도 `has_issues: true` 또는 "issues found" 요약 반환.

**근본 원인**:
- `finalSummary` 생성 시 AI 분석 결과와 무관하게 기본값이 "이슈 있음" 방향으로 편향
- DOM audit 결과와 AI 판단이 불일치할 때 덮어쓰기 로직 부재

**해결책**:
```
api/src/index.ts: finalSummary 보정 로직 추가
  → has_issues=false이면 반드시 clean summary 반환
```

**재발 방지**:
- 결과 집계 시 `has_issues` 플래그와 summary 텍스트의 일관성 검증 필수
- 테스트 케이스: example.com(clean) + bug-demo.html(dirty) 양방향 항상 검증

---

### BUG-05: API 키 노출 사고 (세션 6)

**증상**: `claude mcp add --header "X-Percept-Key: $KEY"` 명령 실행 시 키 평문이 터미널 출력에 노출.

**근본 원인**:
- `claude mcp add` 명령은 입력된 헤더값을 그대로 출력에 표시
- `$KEY` 변수가 환경변수에서 확장되어 실제 키 값이 노출

**해결책**:
- 노출된 키(`pd_live_c630...`) CEO가 KV에서 폐기 + 새 키 발급
- `block-bash-secrets.sh`에 `claude mcp add` 명령 차단 추가
- MCP 재등록: CEO가 직접 새 키로 실행

**재발 방지**:
```
절대 금지:
  claude mcp add --header "X-...: $KEY"  ← bash hook으로 차단됨

올바른 방법:
  claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp
  → Worker secret 자동 적용 (키 노출 없음)
  → 외부 클라이언트만 api_key 파라미터 사용
```

**재발 방지 원칙**:
- 모든 시크릿은 환경변수 확장 없이 전달 (파일 읽기 방식)
- CLI 명령에 `$SECRET` 직접 삽입 절대 금지

---

### BUG-06: vercel_projects safeDate 크래시 (세션 10)

**증상**: `vercel_projects` MCP 툴 호출 시 `created_at` 필드 파싱 에러로 크래시.

**근본 원인**:
- Vercel API에서 `created_at`이 null 또는 예상치 못한 형식으로 반환되는 경우 존재
- `safeDate()` 함수가 null 처리 미흡

**해결책**:
```
sdk/packages/vercel/src/index.ts: safeDate() 함수 null 처리 추가
  → null이면 null 반환 (크래시 방지)
```

**검증**: 2026-03-26 세션 10에서 `vercel_projects` 정상 응답 확인
```json
{"created_at": null}  ← 크래시 없이 정상 반환
```

---

## 전체 시스템 정상 동작 확인 (2026-03-26 세션 10)

| MCP 서버 | 상태 | 검증 방법 |
|----------|------|-----------|
| `@perceptdot/github` | ✅ | github_prs, github_issues 정상 응답 |
| `@perceptdot/vercel` | ✅ | vercel_projects 정상 응답 (safeDate 수정 후) |
| `@perceptdot/ga4` | ✅ | ga4_overview 정상 응답 |
| `mcp.perceptdot.com` (eye) | ✅ | visual_check 401 해결, 블랙스크린 해결, summary 보정 완료 |
| `percept_feedback` | ✅ | 전 서버 공통 정상 |
| `percept_roi_summary` | ✅ | 전 서버 공통 정상 |

**총 9개 MCP 도구 중 9개 정상** ✅

---

## 핵심 교훈 (전 에이전트 필수 숙지)

### 교훈 1: MCP 프로세스는 spawn 시점의 환경변수를 유지한다
```
❌ 잘못된 가정: Claude Code 재시작하면 토큰이 갱신된다
✅ 올바른 이해: 프로세스가 살아있으면 spawn 시점 값을 유지
→ 해결: MCP 서버가 항상 파일에서 직접 읽도록 구현
```

### 교훈 2: Worker-to-Worker 호출은 헤더 전달을 보장하지 않는다
```
❌ 잘못된 가정: HTTP 헤더는 hop마다 투명하게 전달된다
✅ 올바른 이해: CF custom domain fetch는 일부 헤더를 소실
→ 해결: header + body 이중 전달 표준화
```

### 교훈 3: SPA 스크린샷은 JS 렌더링 완료 대기가 필수다
```
❌ 잘못된 가정: load 이벤트 후 스크린샷이 정확하다
✅ 올바른 이해: SPA는 load 후에도 DOM 변경이 계속 발생
→ 해결: 추가 대기 (waitForFunction 또는 networkidle)
```

### 교훈 4: CLI 명령에 시크릿 변수를 직접 삽입하지 않는다
```
❌ 잘못된 방법: claude mcp add --header "X-Key: $MY_KEY"
✅ 올바른 방법: Worker secret 자동 주입 또는 파일 경유
→ 해결: bash hook으로 위험 패턴 차단
```

### 교훈 5: 외부 API 응답은 항상 null/예외를 처리한다
```
❌ 잘못된 가정: API 응답은 항상 예상한 타입이다
✅ 올바른 이해: null, undefined, 빈 문자열 모두 올 수 있다
→ 해결: 모든 날짜/숫자 파싱에 safeDate/safeNumber 래퍼 사용
```

---

## 아키텍처 최종 확정 (2026-03-26)

```
설정 구조 (토큰 관리):
  ~/.claude/settings.json env → 모든 토큰 저장
  ~/.claude/.mcp.json → 서버 정의만 (env 블록 비어있음)

MCP 호출 경로:
  Claude Code → mcp.perceptdot.com/mcp (Worker secret 자동)
  외부 클라이언트 → api.perceptdot.com/mcp?api_key=KEY (1홉 직접)

인증 방식:
  MCP Worker → API Worker: header + body 이중 전달
  키 우선순위: 유저 전달 키 > Worker secret
```

---

## 미완료 항목 (백로그 유지)

| ID | 내용 | 우선순위 |
|----|------|---------|
| INFRA-MCP-01 | 세션 종료 시 MCP 프로세스 자동 kill hook | MEDIUM |
| SEC-01 | CEO가 노출 키 KV에서 폐기 + 새 키 발급 | 🔴 CRITICAL (CEO 직접) |
| SEC-02 | MCP eye 서버 `claude mcp add` 직접 실행 (새 키로) | 🔴 CRITICAL (CEO 직접) |

---

*이 문서는 2026-03-26 세션 10 종료 시 작성되었다. 차기 인프라 변경 시 이 문서를 먼저 참조할 것.*
