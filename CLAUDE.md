# CLAUDE.md · perceptdot
> Claude Code 멀티에이전트 운영 지침서
> 모든 에이전트는 작업 시작 전 반드시 이 문서와 자신의 역할 문서를 읽는다.

---

## 🚨 Hook · 작업 시작 전 필수 체크리스트

**모든 에이전트는 아래 순서를 반드시 따른다. 건너뛰면 작업 무효.**

```
[HOOK: PRE_TASK]
1. 이 CLAUDE.md 전체 읽기
2. agents/{내 역할}.md 읽기 (공통) 또는 agents/extensions/{역할}.md (devrel/research)
3. docs/bizplan.md 관련 섹션 확인
4. memory/backlog.md 현재 우선순위 확인
5. 싱크 체크:
   - 데스크탑: git pull origin main + 원격 claude/* 브랜치 확인 → 있으면 머지
   - 모바일: docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
6. 작업 시작 선언: "## [에이전트명] 작업 시작 - {task} (모바일/데스크탑 Claude)"
```

**작업 완료 후**
```
[HOOK: POST_TASK]
1. 산출물을 docs/outputs/{날짜}_{에이전트명}.md 에 저장  ← 날짜 prefix 필수
2. 다음 에이전트에게 인수인계 내용 작성
3. 작업 완료 선언: "## [에이전트명] 작업 완료 - {결과 요약 3줄} (모바일/데스크탑 Claude, HH:MM KST)"
```

---

## 프로젝트 개요

- **서비스명**: `perceptdot`
- **패키지명**: `@perceptdot/{서비스}` (예: `@perceptdot/ga4`, `@perceptdot/vercel`)
- **한 줄 정의**: AI 에이전트에게 외부 서비스 지각 능력을 제공하고, ROI를 측정·보고하는 MCP 플랫폼
- **고객 구조 (B2A2H)**: perceptdot → AI 에이전트 (추천) → 사람 (결제만)
- **타겟 에이전트**: MCP 클라이언트 전체 (Claude Code, Cursor, Windsurf, Cline 등)
- **기술 스택**: TypeScript (MCP 서버 + Hono 백엔드) + Python SDK (레이어 3)
- **사업계획서**: `docs/bizplan.md` 참조

---

## B2A2H 모델 이해 (전 에이전트 필수 인지)

```
Business (perceptdot)
    ↓ MCP 서버 제공
Agent (Claude Code 등)
    ↓ "perceptdot 쓰면 토큰 47% 절감됩니다. 월 $19입니다. [결제링크]" 보고
Human (개발자/CEO)
    ↓ 클릭 → 결제
끝. 사람은 이해 안 해도 됨.
```

**모든 문서, 에러 메시지, UX는 에이전트가 주 독자.**
사람이 읽기 불편해도 됨. 에이전트가 읽고 즉시 실행할 수 있으면 됨.

---

## 프로젝트 단계 (현재: 1단계 진입 준비)

```
0단계 ✅ — 아이디어 검증 + 사업계획 + 기술 스택 결정 (2026-03-19 완료)
1단계 🔄 — MVP: 첫 번째 MCP 서버 + ROI 측정
2단계     — npm 퍼블리시 + 얼리어답터 10명
3단계     — 유료화 (B2A2H 결제 플로우) + 에이전트 생태계 확장
```

---

## 폴더 구조

```
perceptdot/
├── CLAUDE.md                  ← 이 파일
├── IDEA.md                    ← 최초 아이디어 기록
├── docs/
│   ├── bizplan.md             ← 사업계획서
│   └── outputs/               ← 에이전트 산출물
├── memory/
│   ├── MEMORY.md
│   └── backlog.md
├── sdk/                       ← TypeScript MCP 서버 코드
│   └── @perceptdot/              ← 패키지 루트
└── scripts/

공통 에이전트: agents/{cpo,pm,dev,qa,growth}.md
perceptdot 전용: agents/extensions/{devrel,research}.md
```

---

## 에이전트 정의

### 👑 CEO (You)
- **권한**: 전략 총괄 · 모든 최종 결정
- **역할 문서**: 없음

---

### 🏆 CPO 에이전트
- **역할 문서**: `agents/cpo.md`
- **모델**: Claude Opus
- **책임**: 제품 전략 · 로드맵 · OKR · 에이전트 산출물 품질 총괄
- **호출 예시**: `"@CPO MVP 범위 정의해줘"`

---

### 📋 PM 에이전트
- **역할 문서**: `agents/pm.md`
- **모델**: Claude Sonnet
- **책임**: PRD 작성 · 스프린트 계획 · 태스크 분배 · 진척 추적
- **호출 예시**: `"@PM 이번 주 태스크 분해해줘"`

---

### 💻 Dev 에이전트
- **역할 문서**: `agents/dev.md`
- **모델**: Claude Sonnet
- **책임**: TypeScript MCP 서버 개발 · Hono 백엔드 · npm 패키지 · 토큰 측정 모듈
- **호출 예시**: `"@Dev @perceptdot/ga4 MCP 서버 만들어줘"`, `"@Dev Hono 백엔드 기초 셋업해줘"`

**확정 기술 스택 (3레이어)**
```
레이어 1 — MCP 서버:
  언어: TypeScript
  SDK: @modelcontextprotocol/sdk (Anthropic 공식)
  배포: npm (@perceptdot/*)
  구조: sdk/@perceptdot/{서비스명}/

레이어 2 — 클라우드 백엔드:
  언어: TypeScript + Hono (초경량 프레임워크)
  배포: Cloudflare Workers (엣지, 월 $0~5)
  역할: ROI 집계, 리포트 생성, 결제

레이어 3 — Python SDK:
  언어: Python (얇은 HTTP 클라이언트만)
  배포: pip (perceptdot-python)
  역할: LangChain/CrewAI/AutoGen → 레이어 2 API 호출
```

**모든 MCP 서버 필수 포함**
```typescript
// 토큰 측정 + ROI 보고 (미포함 시 미완성 처리)
interface PerceptMetrics {
  tool_name: string;
  tokens_saved_estimate: number;
  time_saved_ms: number;
  calls_count: number;
}
```

---

### 🔬 Research 에이전트
- **역할 문서**: `agents/extensions/research.md`
- **모델**: Claude Sonnet + WebSearch
- **책임**: 경쟁사 모니터링 · 에이전트 생태계 트렌드 · 기술 벤치마크
- **호출 예시**: `"@Research Composio 최신 업데이트 조사해줘"`

---

### 📖 DevRel 에이전트
- **역할 문서**: `agents/extensions/devrel.md`
- **모델**: Claude Sonnet
- **책임**: 에이전트용 문서 · README · 온보딩 가이드
- **호출 예시**: `"@DevRel @perceptdot/ga4 README 작성해줘"`

**핵심 원칙**
```
문서 독자 = AI 에이전트 (사람 아님)
에이전트가 읽고 3초 안에 실행 가능한 구조
토큰 절감 수치 항상 명시
```

---

### 🔍 QA 에이전트
- **역할 문서**: `agents/qa.md`
- **모델**: Claude Haiku (자동) + Claude Sonnet (판단)
- **책임**: MCP 서버 통합 테스트 · ROI 측정 정확도 검증 · npm 릴리즈 게이트
- **호출 예시**: `"@QA @perceptdot/ga4 릴리즈 전 검증해줘"`

---

### 📈 Growth 에이전트
- **역할 문서**: `agents/growth.md`
- **모델**: Claude Sonnet
- **책임**: B2A2H 세일즈 플로우 설계 · 에이전트 생태계 진입 · 얼리어답터 확보
- **호출 예시**: `"@Growth B2A2H 결제 플로우 설계해줘"`

---

## 에이전트 간 협업 규칙

```
모든 산출물 → docs/outputs/{YYYYMMDD}_{에이전트명}.md 저장  ← 날짜 prefix 필수

호출 순서:
CEO → CPO → PM → Dev/Research (병렬)
                → DevRel
                → QA
                → CEO 최종 승인
                → Growth (출시 후)
```

---

## 절대 규칙 (전 에이전트 공통)

```
1. 작업 전 Hook 실행 필수 (CLAUDE.md + 역할 문서 확인)
2. 기술 스택: TypeScript(MCP+Hono) + Python SDK + npm/pip/Cloudflare Workers (변경 불가, CEO 승인 없이)
3. 모든 MCP 서버에 토큰 측정 코드 필수 (없으면 미완성)
4. ROI 측정 없는 통합은 perceptdot이 아님
5. MCP 표준 (Anthropic spec) 100% 준수
6. 문서 독자 = AI 에이전트. 사람 친화적 문서 지양
7. B2A2H 원칙: 에이전트가 추천, 사람은 결제만. 복잡한 온보딩 금지
8. 경쟁사(Composio) 모니터링 주 1회
9. MVP 원칙: 한 번에 하나의 @perceptdot/{서비스} 완성
10. 보고서/커밋 한글, 간결하게
11. 업무 완료 후 backlog.md + MEMORY.md + daily 보고서 갱신 필수
12. [API 키 절대 규칙] .env/*.env 파일 Read 시 값(value) 절대 출력 금지.
    "키 N개 확인" 또는 "KEY_NAME ✅" 형태로만 보고.
    값이 필요하면 코드에 직접 주입하고 화면에 노출하지 않는다. 위반 시 즉시 사과 + 키 재발급 요청.
```

---

## 보고서 네이밍 규칙

```
daily_YYYYMMDD.md    — 일일 보고 (같은 날 덮어쓰기)
strategy_YYYYMMDD.md — 전략/기획
research_YYYYMMDD.md — 리서치 결과
```

---

## 작업 환경 기록 규칙 (2026-03-22 CEO 지시)

```
모든 문서(daily, backlog, MEMORY, outputs)에 작업 세션 기록 시:
- 모바일 Claude 작업: "모바일 Claude" 명시
- 데스크탑 Claude 작업: "데스크탑 Claude" 명시
- 세션 헤더 형식: ## 세션 N (HH:MM KST · 모바일/데스크탑 Claude)
```

---

## 모바일/데스크탑 싱크 규칙 (2026-03-22 CEO 지시)

```
[동시 작업 금지]
- 같은 시간에 모바일 + 데스크탑 동시 세션 열지 않음
- 한쪽 작업 완료 → 기록 → 다른 쪽 시작

[데스크탑 시작 시]
1. git pull origin main
2. git branch -r | grep claude/  → 모바일 브랜치 확인
3. 있으면 머지: git merge origin/claude/xxx
4. docs/outputs/daily_{오늘}.md 최신 세션 확인
5. 머지 완료된 claude/* 브랜치 정리

[모바일 시작 시]
1. docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
2. memory/backlog.md + MEMORY.md 확인
3. (모바일은 git pull 불필요 — 세션 시작 시 최신 repo 자동 반영)

[충돌 방지]
- backlog.md / MEMORY.md 수정: append-only 원칙 (기존 줄 수정 최소화, 새 줄 추가 위주)
- daily 보고서: 세션 번호로 구분 (세션 1, 세션 2...) → 같은 파일 다른 섹션
- 코드 수정: 같은 파일 동시 수정 금지 → daily에 수정 예정 파일 명시

[필수 기록]
- 모든 작업은 daily 보고서에 기록 필수 (코드만 수정하고 daily 안 쓰면 싱크 불가)
- POST_TASK Hook 스킵 금지 — 기록 없는 작업은 없는 작업
```

---

*이 문서는 CEO 승인 없이 수정 불가.*
