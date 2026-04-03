# perceptdot — 사업계획서
> 최초 작성: 2026-03-19 | **최종 업데이트: 2026-04-03** | 상태: **베타 운영 중 + EYE 피벗 진행**

---

## 1. 한 줄 요약

**AI 에이전트 경제의 ROI 인프라 회사.**

단기: MCP 서버로 에이전트에게 지각 능력 제공 + ROI 자동 측정·보고
중기: AI 에이전트 비주얼 QA 서비스 (@perceptdot/eye)
장기: 에이전트가 도구를 추천·결제하는 경제 인프라 (에이전트 광고 네트워크 / 에이전트용 Stripe)

---

## 2. 문제 정의

### AI 에이전트는 지금 눈이 없다

| 에이전트가 못 하는 것 | 현재 우회 방법 | 낭비 |
|---|---|---|
| GA4 이벤트 확인 | 사람이 대시보드 열어서 읽어줌 | 컨텍스트 전환 + 토큰 낭비 |
| EC2 에러 감지 | 사람이 "이상한데요?" 하면 알게 됨 | 대응 지연 |
| Vercel 배포 상태 | "됐겠지?" 수준으로 추측 | 실패 배포 모름 |
| UI 버그 탐지 | 텍스트 로그만 보고 추측 | 디버깅 3배 오래 걸림 |
| 사용자 행동 파악 | 사람이 설명해줘야 함 | 재현 불가 |

**실측 수치 (K-사주 프로젝트):**
- 가시성 도구 없이 버그 디버깅 시 평균 3배 이상 시간 소요
- 추정 토큰 절감 가능치: 40~60%

---

## 3. 솔루션

### 3.1 MCP 서버 플랫폼 (운영 중)
에이전트가 외부 서비스를 직접 조회·보고할 수 있는 MCP 서버 모음.

```bash
# 에이전트가 직접 설치
claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp
```

**핵심 3가지**
```
1. 연결 (Connect)   → 외부 서비스를 MCP 서버 형태로 에이전트에 연결
2. 측정 (Measure)   → 도구 사용 전/후 토큰·시간 자동 측정
3. 보고 (Report)    → 에이전트가 주인에게 ROI를 수치로 자동 보고
```

### 3.2 @perceptdot/eye — AI 비주얼 QA (신규 주력 서비스)

```
visual_check(url) → 스크린샷 촬영 → Gemini 2.5 Flash 분석 → 버그 리포트
```

| 기능 | 내용 |
|---|---|
| URL → 스크린샷 | Cloudflare Browser Rendering API |
| AI 분석 | Gemini 2.5 Flash (시각적 버그 탐지) |
| 결과 형식 | 구조화된 버그 리포트 (에이전트가 바로 실행 가능) |
| 단가 | ~$0.002/체크 |
| 마진 | ~99.4% |

**시장 공백**: 전 세계 AI 에이전트 전용 비주얼 QA Remote MCP = **0개**

---

## 4. 시장 규모

| | 규모 | CAGR |
|---|---|---|
| TAM (AI 에이전트 전체) | $7.6B → $236B (2034) | 49.6% |
| SAM (AI 개발자 도구) | $4~7B | 25~27% |
| SOM (MCP 플랫폼 직접 경쟁) | $2.7B | 8.3% |

**수요 증거**
- Claude Code 개발자 점유율 46% (2026 설문, 1위)
- 개발자 95%가 AI 도구 주 1회 이상 사용
- Composio 시리즈A $29M (2025.07), 개발자 10만+
- MCP 프로토콜 8M 다운로드, 85% MoM 성장
- Gartner: B2B 에이전트 경유 구매 3년 내 90%, $15T 규모

---

## 5. 비즈니스 모델

### B2A2H (Business to Agent to Human)

```
perceptdot (MCP 서버 제공)
    ↓
AI 에이전트 (도구 사용 + ROI 측정)
    ↓ 자동 보고
    "perceptdot 구독 중 ($19/월). 이번 달 $47 절감. 유지 권장."
사람 (결제만)
    ↓ 카드 등록 1회
끝.
```

**사람은 이해 안 해도 됨. 에이전트가 결정하고 사람은 승인만.**

### 가격 티어

| 플랜 | 가격 | 내용 |
|---|---|---|
| **Free** | $0 | 비주얼 체크 50회/월 |
| **Pro** | $19/월 | 비주얼 체크 무제한 + ROI 리포트 자동화 |
| **Team** | $49/월 | 에이전트 5개 + 팀 대시보드 |

**"절감 없으면 비용 없음"** 메시지로 채택 장벽 제거.

---

## 6. 기술 스택

### 3레이어 아키텍처

```
레이어 1: MCP 서버 (TypeScript + @modelcontextprotocol/sdk)
  @perceptdot/ga4, @perceptdot/vercel, @perceptdot/github, @perceptdot/sentry
  @perceptdot/eye (visual_check — 주력)
  → Remote MCP: https://mcp.perceptdot.com/mcp

레이어 2: 클라우드 백엔드 (TypeScript + Hono → Cloudflare Workers)
  api.perceptdot.com — ROI 집계, 리포트, 결제
  → 비용: 월 $0~5 (Cloudflare 무료 플랜)

레이어 3: Python SDK (얇은 HTTP 클라이언트)
  percept-python — pip install percept
  → LangChain, CrewAI, AutoGen 에이전트용 (예정)
```

| 레이어 | 언어/도구 | 이유 |
|---|---|---|
| MCP 서버 | TypeScript + @modelcontextprotocol/sdk | MCP 공식 SDK, Claude Code 1순위 |
| 백엔드 API | TypeScript + Hono | 초경량, Cloudflare Workers 호환 |
| eye 브라우저 | CF Browser Rendering API | Workers 128MB 한계 → 전용 API |
| eye Vision AI | Gemini 2.5 Flash | 비주얼 분석 최적 + 저비용 |
| 배포 (BE) | Cloudflare Workers | 엣지, 저비용, TypeScript 네이티브 |
| 배포 (FE) | Cloudflare Pages | perceptdot.com 자동 배포 |
| AI 개발 인프라 | Claude Max | 멀티에이전트 전체 개발 |

---

## 7. 운영 현황 (2026-04-03 기준)

### npm 패키지 현황

| 패키지 | 버전 | 상태 |
|--------|------|------|
| @perceptdot/core | 0.1.0 | 운영 중 |
| @perceptdot/ga4 | 0.2.6 | 운영 중 |
| @perceptdot/vercel | 0.1.6 | 운영 중 |
| @perceptdot/github | 0.1.5 | 운영 중 |
| @perceptdot/sentry | 0.1.5 | 운영 중 |
| @perceptdot/eye | - | 구현 예정 (주력) |

### 인프라

| 서비스 | URL | 상태 |
|---|---|---|
| 랜딩 | perceptdot.com | 운영 중 |
| Remote MCP | mcp.perceptdot.com/mcp | 운영 중 |
| API | api.perceptdot.com | 운영 중 |
| GitHub | github.com/perceptdot/percept | 공개 |

### GTM 완료 항목
- X 스레드 발행
- awesome-mcp-servers PR 머지 + Glama 배지 등록
- Reddit r/ClaudeCode 포스팅
- Moltbook, AlternativeTo, Dev.to 등재
- perceptdot.com AI-First 전면 개편

---

## 8. 경쟁사 분석

### 포지셔닝 맵

```
           개발자용 ←──────────────────────────→ 오너(사장)용
내부도구    Langfuse, Helicone, AgentOps          [공백 = perceptdot]
MCP연결     Composio, Smithery, PulseMCP           [공백 = perceptdot]
비주얼QA    [전무]                                 [공백 = perceptdot/eye]
```

**"에이전트 → 오너 ROI 자동 보고" 경쟁자 = 0.**
**"AI 에이전트 전용 비주얼 QA Remote MCP" 경쟁자 = 0.**

| 경쟁사 | 핵심 | perceptdot 차이 |
|---|---|---|
| Composio | 3,000+ 앱 연동, $29M 시리즈A | 연결만. ROI 없음. 보완 채널 |
| AgentOps | 에이전트 옵저버빌리티 | "비용 얼마?" → 개발자. perceptdot = "절감 얼마?" → 에이전트→오너 |
| Langfuse/Helicone | LLM 옵저버빌리티 | 개발자 대시보드만. 에이전트 자가추천 없음 |

---

## 9. 로드맵

### 완료 단계
- ✅ **0단계** 사업계획·기술스택·수익모델·도메인 확정 (2026-03-19)
- ✅ **1단계** MCP 서버 4개 구현+퍼블리시 (ga4, vercel, github, sentry) (2026-03-20)
- ✅ **2단계** Hono 백엔드 + CF Workers 배포, 랜딩 AI-First 전면 개편 (2026-03-21)
- ✅ **3단계 GTM** X/Reddit/Moltbook/AlternativeTo/Dev.to 포스팅, awesome-mcp-servers 등재 (2026-03~04)

### 진행 중
- 🔄 **EYE 피벗** @perceptdot/eye visual_check 구현 (CF BR API + Gemini 2.5 Flash)
- 🔄 **Paddle 유료화** PAY-ENABLE 버튼 활성화 (Pro $19, Team $49)

### 다음 단계 (2026 Q2)
- [ ] @perceptdot/eye 정식 출시 + 2분 데모 영상
- [ ] Show HN + Product Hunt 런칭
- [ ] BetaList, mcpservers.org, PulseMCP 추가 등재
- [ ] percept-python SDK (pip install percept)
- [ ] 얼리어답터 50명 확보

### 장기 비전 (2026 Q3~)
- 에이전트 광고 네트워크 (추천 수수료 CPA) 또는 에이전트용 Stripe (결제 수수료 4%) — Q3 데이터 기반 결정
- REST API 공개 (어떤 언어든 연결)
- ACP/UCP 에이전트 커머스 연동

---

## 10. 운영 구조

- CEO 1인 + Claude Max 멀티에이전트
- 인건비 $0, 월 운영비 $100~120 (Claude Max + CF Workers)
- 마진 ~99.4% (eye 서비스 단가 $0.002/체크)

| 에이전트 | 역할 | 모델 |
|---|---|---|
| CPO | 제품 전략 · 로드맵 | Opus |
| Dev | TypeScript MCP + Hono BE | Sonnet |
| DevRel | 에이전트용 문서 · README | Sonnet |
| Research | 경쟁사 모니터링 · 수요 조사 | Sonnet |
| QA | MCP 통합 테스트 · ROI 검증 | Haiku/Sonnet |
| Growth | B2A2H 세일즈 · 얼리어답터 | Sonnet |

---

## 11. 성공 지표 (KPI)

| 단계 | 기준 | 목표 |
|---|---|---|
| 단기 | 유료 구독 | 10명 (Pro $19) |
| 중기 | MRR | $500 이상 |
| 성장 | visual_check 사용량 | 월 1,000회 |
| 장기 | 에이전트 자가 추천 사례 | 확인 가능한 바이럴 1건 이상 |

---

*CEO 1인 + Claude Max 멀티에이전트 기반 운영. 문서 독자 = AI 에이전트.*
<!-- 2026-04-03: 전면 최신화 — EYE 피벗 반영, npm 패키지 현황, Remote MCP 운영 현황, 가격·GTM·로드맵 갱신 -->
