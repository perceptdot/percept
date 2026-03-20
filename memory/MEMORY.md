# percept — 프로젝트 메모리

> 이 프로젝트는 K-사주와 **별개**. K-사주 메모리와 혼동 금지.
> 최초 생성: 2026-03-19 | 업데이트: 2026-03-20

---

## 현재 Phase
- **0단계 ✅ 완료** (2026-03-19)
- **1단계 ✅ 완료** (2026-03-19): npm 퍼블리시까지 완료
  - @perceptdot/ga4@0.1.0, @perceptdot/vercel@0.1.0 → npmjs.com 라이브
  - Hono 백엔드(api/) + Python SDK(python-sdk/) 기초 완성
- **2단계 ✅ 완료 (2026-03-20)**: GitHub 공개 + Cloudflare Workers + Landing Pages 배포
- **3단계 🔄 진행 중**: 커스텀 도메인 + Stripe + Growth
  - ✅ @perceptdot/sentry@0.1.0, @perceptdot/github@0.1.0 npm 라이브 (2026-03-20)
  - ✅ Landing 4개 통합 카드 완성 + Pages 재배포 (2026-03-20)
  - npm 패키지 4종: @perceptdot/ga4, vercel, sentry, github

## 확정 사항 (2026-03-19)

| 항목 | 결정 |
|---|---|
| 서비스명 | `percept` |
| 패키지명 | `@perceptdot/{서비스}` (npm, @percept 선점됨) |
| 기술 스택 | 3레이어: TypeScript(MCP서버) + TypeScript+Hono(백엔드API) + Python(SDK) |
| 배포 | npm(@perceptdot/*) + Cloudflare Workers + pip(percept-python) |
| 도메인 | **perceptdot.com** ✅ 확정 (구매 완료) |
| 수익 모델 | B2A2H / Free · $19 · $49/월 |
| 타겟 에이전트 | MCP 클라이언트 전체 (Claude Code 1순위) |
| 핵심 차별점 | ROI 측정 + 에이전트 → 주인 자동 보고 |

## 경쟁사 분석 결론 (2026-03-19 리서치)
- "에이전트 → 오너 ROI 자동 보고" = 경쟁자 0 (공백 확인)
- Langfuse/Helicone/Datadog = 개발자 내부용, 오너 레이어 없음
- Smithery/Composio = MCP 연결만, ROI 없음
- **포지셔닝: 유일한 "에이전트→오너" 방향 서비스**

## 도메인 확정
- **perceptdot.com** ✅ (2026-03-19 PO 결정)
- 이유: "점을 연결해 인사이트를 만든다" = 제품 본질(ROI 보고) 일치
- percept.dev/ai = 사용 중, perceptmcp.com/getpercept.com = 후보였으나 perceptdot 확정

## 미결 CEO 결정사항
- 첫 번째 통합 서비스 (GA4 / Vercel / EC2 / Sentry)

## Moltbook 전략 (2026-03-20 CEO 확정)
- **얼리어답터 = AI 에이전트** (인간 20명 → 방향 전환)
- Moltbook = AI 에이전트 전용 소셜네트워크 (Reddit 스타일, Meta $220M 인수)
- percept 홍보 채널 + 에이전트 피드백 수집 채널로 동시 활용
- B2A2H 마케팅 플로우: Moltbook 포스팅 → 에이전트 발견 → 인간 설치 → 결제
- 인프라: moltbook-skill (Claude Code), moltbook-mcp-server (MCP) 이미 존재
- GROWTH-02 담당

## B2A2H 모델 요약
```
percept → 에이전트 (사용 + ROI 측정) → 사람 (결제만)
에이전트 세계 입소문 = README 전파
```

## 핵심 설계 철학 (2026-03-20 CEO 확정)

**"AI가 주인공, 사람은 관객"**

```
✅ 계정 없음 — API 키만으로 모든 것
✅ 로그인 없음 — 구독 관리는 이메일 매직링크 (Lemon Squeezy)
✅ 대시보드 없음 — 에이전트가 직접 ROI 보고
✅ 팀 관리 = API 키 N개 발급 (초대 이메일, 승인 없음)
✅ 사람이 헷갈리면 → FAQ로 설명 (사이트 UI 복잡하게 만들지 않음)
```

**결제**: Lemon Squeezy (K-사주 + perceptdot 동일 계정, 2026-03-20 CEO 확정)
- 한국 개인사업자(THUNOVA) 직접 사용 가능
- 달러 수취, 세금 대행, 이메일 매직링크 구독 관리

## 계정 관리 (2026-03-20 기준)

### 기본 원칙
- **신규 계정**: 모두 `thunova0318@gmail.com` 사용
- **구 계정**: `soondoobu1111@gmail.com` → `thunova0318@gmail.com` 이전 진행 중

### 서비스별 현황

| 서비스 | 현재 계정 | 목표 | 상태 |
|---|---|---|---|
| **Cloudflare** | thunova0318@gmail.com | ✅ 이미 신규 계정 | 완료 |
| **GitHub** | soondoobu1111@gmail.com (계정: soondoobu1111-star) | thunova0318 계정 추가/이전 | ⏸️ 대기 |
| **Vercel** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 |
| **AWS** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 |
| **Gitbook** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 |
| **npm** | 확인 필요 | thunova0318으로 통일 | ❓ 미확인 |

### 이전 방법 (서비스별)
- **GitHub**: soondoobu1111-star Settings → Emails → thunova0318 추가. perceptdot org Owner로 thunova0318 계정 초대
- **Vercel**: Account Settings → 이메일 변경 OR thunova0318 계정을 팀 Owner로 추가 후 기존 제거
- **AWS**: 루트 계정 → Account Settings → Contact Information 이메일 변경 (인증 필요)
- **Gitbook**: Space Settings → Members → thunova0318 Admin으로 초대

### perceptdot 전용 계정
- Cloudflare: thunova0318@gmail.com ✅
- GitHub org: perceptdot (soondoobu1111-star 소유 → thunova0318 이전 필요)

## 사용자 선호 (K-사주에서 이어받음)
- 보고·커밋 한글, 간결하게
- 토큰 최소화 + 병렬 최대화
- 속도 우선
- 백로그는 `memory/backlog.md`에서 관리
- 배포 의무: 코드 수정 후 배포 여부 반드시 명시

## 별도 파일
- `memory/backlog.md` — 전체 백로그
- `docs/bizplan.md` — 사업계획서 (확정)
- `IDEA.md` — 최초 아이디어 기록

## 시장 수치 (리서치 완료 2026-03-19)
- TAM: $183B (2033), CAGR 49.6%
- 직접 경쟁사: Composio ($29M 시리즈A) — ROI 측정 없음
- Claude Code 점유율: 46% (개발자 설문 1위)
