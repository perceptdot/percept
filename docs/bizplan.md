# percept — 사업계획서

> 최초 작성: 2026-03-19
> 상태: 확정 (3단계 진행 중 + 장기 비전 확정)
> 마지막 업데이트: 2026-03-22

---

## 1. 한 줄 요약

**AI 에이전트 경제의 ROI 인프라 회사.**

단기: MCP 서버로 에이전트에게 지각 능력 제공 + ROI 자동 측정·보고
장기: 에이전트가 도구를 추천·결제하는 경제 인프라 (에이전트 광고 네트워크 / 에이전트용 Stripe)

에이전트가 GA4·EC2·Vercel·DB 등 외부 서비스를 직접 보고,
토큰/시간 절감량을 측정해 주인에게 ROI를 자동 보고한다.
**MCP 서버는 씨앗. 진짜 사업은 데이터 위에 세운다.**

```bash
# 에이전트가 직접 설치
npx @percept/ga4
# → "GA4 연결 완료. 예상 절감: 월 ~2,400 토큰"
```

---

## 2. 문제 정의

### AI 에이전트는 지금 눈이 없다

| 에이전트가 못 하는 것 | 현재 우회 방법 | 낭비 |
|---|---|---|
| GA4 이벤트 확인 | 사람이 대시보드 열어서 읽어줌 | 컨텍스트 전환 + 토큰 낭비 |
| EC2 에러 감지 | 사람이 "이상한데요?" 하면 알게 됨 | 대응 지연 |
| Vercel 배포 상태 | "됐겠지?" 수준으로 추측 | 실패 배포 모름 |
| DB 데이터 조회 | SSH 들어가서 쿼리 직접 실행 | 매번 인간 개입 |
| 테스트 실패 원인 | 텍스트 로그만 보고 추측 | 디버깅 3배 오래 걸림 |
| 사용자 행동 파악 | 사람이 설명해줘야 함 | 재현 불가 |

### 공통 패턴
> 에이전트가 보지 못하는 것 → 사람이 개입 → 토큰 낭비 + 시간 낭비

직접 경험 수치 (K-사주 프로젝트 실측):
- 가시성 도구 없이 버그 디버깅 시 평균 3배 이상 시간 소요
- 배포 후 상태 확인을 위한 인간 개입 매 배포마다 발생
- **추정 토큰 절감 가능치: 40~60%**

---

## 3. 솔루션

### percept: AI 에이전트용 지각 능력 MCP 플랫폼

**핵심 3가지**

```
1. 연결 (Connect)
   → 외부 서비스를 MCP 서버 형태로 에이전트에 연결
   → @percept/ga4, @percept/vercel, @percept/ec2, @percept/db ...

2. 측정 (Measure)
   → 이 도구 쓰기 전/후 토큰 사용량, 작업 시간 자동 측정
   → "GA4 MCP 도입 후 분석 관련 토큰 52% 절감"

3. 보고 (Report)
   → 에이전트가 주인에게 ROI를 수치로 자동 보고
   → "이 달 절감액: $23.4 (토큰 절감 기준). 결제 유지 권장."
```

### 차별점 (vs 경쟁사)

| | Composio | LangChain | **percept** |
|---|---|---|---|
| 외부 서비스 연결 | ✅ 10,000개+ | ✅ | ✅ |
| MCP 네이티브 | ✅ | 부분 | ✅ **100%** |
| **ROI 측정** | ❌ | ❌ | **✅ 핵심** |
| **에이전트 → 주인 보고** | ❌ | ❌ | **✅ 핵심** |
| **토큰 절감 추적** | ❌ | ❌ | **✅ 핵심** |
| 문서 독자 = 에이전트 | ❌ 사람용 | ❌ 사람용 | **✅** |
| B2A2H 수익 구조 | ❌ | ❌ | **✅** |

> Composio는 "연결만" 해준다. percept는 "절감 증명"까지 한다.

---

## 4. 시장 규모

| | 규모 | CAGR |
|---|---|---|
| TAM (AI 에이전트 전체) | $7.6B → $183B (2033) | 49.6% |
| SAM (AI 개발자 도구) | $4~7B | 25~27% |
| SOM (MCP 플랫폼 직접 경쟁) | $2.7B | 8.3% |

**수요 증거**
- Claude Code 개발자 점유율 46% (2026 설문, 1위)
- 개발자 95%가 AI 도구 주 1회 이상 사용
- Composio 시리즈A $29M (2025.07), 개발자 10만+
- Cursor ARR $1.2B — 역대 SaaS 최단기 24개월 달성

---

## 5. 비즈니스 모델 ✅ 확정

### B2A2H (Business to Agent to Human)

```
percept (MCP 서버 제공)
    ↓
AI 에이전트 (도구 사용 + ROI 측정)
    ↓ 자동 보고
    "percept 구독 중 ($19/월). 이번 달 $47 절감. 유지 권장."
사람 (결제만)
    ↓ 카드 등록 1회
끝.
```

**사람은 이해 안 해도 됨. 에이전트가 결정하고 사람은 승인만.**

### 가격 티어 ✅ 확정

| 플랜 | 가격 | 통합 수 | 특징 |
|---|---|---|---|
| **Free** | $0 | 2개 | 얼리어답터 획득용 |
| **Pro** | $19/월 | 무제한 | ROI 리포트 자동화 |
| **Team** | $49/월 | 무제한 | 에이전트 5개 + 팀 대시보드 |

**"절감 없으면 비용 없음"** 메시지로 채택 장벽 제거.

---

## 6. 기술 스택 ✅ 확정

### 시장 현실과 3레이어 전략

AI 에이전트 개발 언어 분포 (2026 리서치):
- Python: 52% (LangChain, CrewAI, AutoGen 생태계)
- TypeScript/JS: 6% (MCP 네이티브, Claude Code)
- 기타: 42%

**→ TypeScript만으로는 6% 시장. 3레이어 전략으로 전체 시장 커버.**

---

### 3레이어 아키텍처

```
레이어 1: MCP 서버 (TypeScript)
  @percept/ga4, @percept/vercel, @percept/ec2 ...
  → Claude Code, Cursor 등 MCP 클라이언트 직접 사용
  → npm 1줄 설치

레이어 2: 클라우드 백엔드 (TypeScript + Hono)
  percept API — ROI 집계, 리포트, 결제
  → Cloudflare Workers 배포 (엣지, 월 $0~5)
  → MCP 서버들이 측정 데이터 전송

레이어 3: Python SDK (얇은 HTTP 클라이언트)
  percept-python — pip install percept
  → LangChain, CrewAI, AutoGen 에이전트용
  → 로직 없음, 레이어 2 API 호출만
```

### 기술 스택 확정

| 레이어 | 언어/도구 | 이유 |
|---|---|---|
| MCP 서버 | TypeScript + @modelcontextprotocol/sdk | MCP 공식 SDK, Claude Code 1순위 |
| 백엔드 API | TypeScript + Hono | 초경량, Cloudflare Workers 호환, 언어 통일 |
| Python SDK | Python (얇은 HTTP 클라이언트) | LangChain/CrewAI 2,290만명 시장 |
| 배포 (MCP) | npm (@percept/*) | 에이전트가 1줄 설치 |
| 배포 (백엔드) | Cloudflare Workers | 엣지, 저비용, TypeScript 네이티브 |
| 도메인 | **perceptdot.com** ✅ 확정 | "점을 연결해 인사이트를 만든다" = 제품 본질 |

**TypeScript를 백엔드에도 쓰는 이유:**
- 언어 1개로 MCP + API 서버 관리 → AI(나)가 유지보수 쉬움
- CEO(비개발자) + AI 팀 → 언어 적을수록 인지 부하 낮음
- Python SDK는 얇아서 나중에 AI가 1일에 작성 가능

### 단계별 빌드 전략

```
1단계 MVP: 로컬 MCP 서버만 (백엔드 없음)
  @percept/ga4 — 로컬 실행, 토큰 측정 로컬 처리
  → Claude Code, Cursor에서 바로 사용 가능

2단계: 클라우드 백엔드 + Python SDK 추가
  Hono 백엔드 — ROI 집계, 리포트, 결제
  percept-python — pip install percept

3단계: REST API 공개
  어떤 언어든, 어떤 에이전트든 연결 가능
  → 전체 4,720만 개발자 시장
```

**에이전트 친화 설계 원칙**
```
1. 설치 1줄: npx @percept/ga4
2. 에러 메시지 = 에이전트가 읽고 바로 조치 가능한 형태
3. README = 에이전트 온보딩 매뉴얼 (사람용 아님)
4. 모든 응답에 절감 수치 포함
```

---

## 7. 타겟 에이전트 ✅ 확정

**MCP 클라이언트 전체** (Claude Code 전용 아님)

```
1순위: Claude Code (점유율 46%, MCP 네이티브)
2순위: Cursor (사용자 200만, MCP 지원)
3순위: Windsurf, Cline, 기타 MCP 클라이언트
```

MCP 표준 준수 → 한 번 만들면 모든 에이전트에서 작동.

**입소문 전파 메커니즘**
```
에이전트 A가 percept 사용
    → 프로젝트 README에 "@percept/ga4 installed (saves ~40% tokens)" 기록
    → 다른 에이전트 B가 이 README 읽음
    → B가 주인에게 "percept 설치 권장" 보고
    → 주인이 결제
```

---

## 8. 경쟁사 분석 (2026-03-19 리서치 완료)

### 포지셔닝 맵

```
           개발자용 ←──────────────────────────→ 오너(사장)용
내부도구    Langfuse, Helicone, AgentOps          [공백 = percept]
MCP연결     Composio, Smithery, PulseMCP           [공백 = percept]
게이트웨이  MCP Manager, Datadog                   [공백 = percept]
```

**"에이전트 → 오너 ROI 자동 보고" 경쟁자 = 0.**

### 카테고리별 현황

| 카테고리 | 플레이어 | ROI 오너 보고 | percept 각도 |
|---|---|---|---|
| **MCP 마켓플레이스** | Smithery(7,300+), PulseMCP(14,274+), Composio(500+) | ❌ | 경쟁 아님. 오히려 등재 채널 |
| **LLM 옵저버빌리티** | Langfuse, Helicone, AgentOps, LangSmith | ❌ 개발자 대시보드만 | 방향이 다름 (개발자→개발자) |
| **MCP 게이트웨이** | MCP Manager, Datadog(2026-03 신규) | ❌ | 엔터프라이즈 보안에 집중 |
| **percept** | — | ✅ **유일** | 에이전트→오너 자동 보고 |

### 핵심 차별점 재확인

```
Langfuse:  "토큰 몇 개 썼나요?" → 개발자 대시보드 (사장 못 봄)
Helicone:  "캐싱으로 30% 절감 가능" → 개발자 설정 화면 (사장 안 함)
Datadog:   "MCP 보안 이상 없음" → 엔터프라이즈 IT팀 (사장 관심 없음)

percept:   "이번 달 $23 절감. 구독 $19. 유지 권장." → 사장 슬랙 메시지
```

시장 신호 (2026):
- 기업 임원 74%가 AI ROI를 보고하지만 **측정은 전부 수동**
- AI 도구 구매 핵심 조건 = "측정 가능한 ROI" (SaaS 트렌드 1위)
- MCP 옵저버빌리티는 개발자 내부용으로만 진화 중 → **오너 레이어 완전 부재**

---

## 9. 로드맵

### 0단계 ✅ 완료 (2026-03-19)
- ✅ 사업계획 확정, 서비스명·기술스택·수익모델·타겟·도메인 전부 확정

### 1~2단계 ✅ 완료 (2026-03-19~20)
- ✅ MCP 서버 4개 구현+퍼블리시 (ga4, vercel, github, sentry)
- ✅ Hono 백엔드 + Cloudflare Workers + Landing Pages 배포
- ✅ GitHub 공개 + npm 라이브 + 무료 키 발급 시스템

### 3단계 🔄 진행 중 (2026-03-21~) — Growth + 유료화
- ✅ 무료 베타 오픈 + AI-First 전면 개편
- ✅ Gumroad 결제 브릿지 (Pro $19, Team $99)
- ⏳ Paddle KYC 승인 대기 (정식 결제)
- ⏳ awesome-mcp-servers PR #3639 머지 대기
- [ ] 마케팅 포스팅 시작 (Twitter → Reddit → HN)
- [ ] 외부 유저 확보

### 4단계 (2026-Q2) — ROI 벤치마크 + 데이터 축적
- [ ] /v1/benchmark 엔드포인트 (업계 평균 대비 ROI 비교)
- [ ] MCP 빌링 인프라 white-label (다른 MCP 서버에 결제 레이어 제공)
- [ ] percept-python SDK 출시 (pip install percept)
- [ ] 얼리어답터 50명 + 벤치마크 데이터 축적

### 5단계 (2026-Q3~Q4) — 플랫폼 전환 (장기 비전 진입)
- [ ] 에이전트 광고 네트워크 또는 에이전트용 Stripe 방향 결정
- [ ] ACP/UCP 에이전트 커머스 연동
- [ ] REST API 공개 (어떤 언어든 연결)
- [ ] 에이전트 생태계 파트너십 확대

---

## 10. 에이전트 홍보 전략

에이전트는 광고를 보지 않는다. **구조화된 텍스트를 읽는다.**

### 채널 우선순위

| 채널 | 실행 내용 | 시점 |
|---|---|---|
| **MCP 디렉토리 등재** | Smithery, Glama, PulseMCP, GitHub 공식 레지스트리 | MVP 완성 즉시 |
| **K-사주 CLAUDE.md** | 첫 번째 실증 사례 + 수치 기록 (우리가 1호 고객) | 1단계 완성 후 |
| **README 바이럴 강제** | `@percept/ga4 installed — saves ~$23/mo` 형식 자동 기록 | 모든 유저에게 |
| **npm 키워드** | `mcp roi measurement agent observability` | 퍼블리시 시 |
| **awesome-mcp-servers** | GitHub PR | 스타 500+ 이후 |
| **LangChain/Python 커뮤니티** | pip percept-python 출시 후 공략 | 2단계 |

### 입소문 루프 실행 계획

```
1단계: K-사주에 percept 설치 (우리가 1호 고객, 실증 데이터 확보)
   ↓
2단계: npm 퍼블리시 → MCP 디렉토리 등재
   ↓
3단계: 에이전트 A가 사용 → README에 절감 수치 자동 기록
   ↓
4단계: 에이전트 B가 그 README 읽음 → 주인에게 percept 설치 추천
   ↓
반복
```

---

## 11. 미결 사항 (CEO 결정 필요)

- ✅ **첫 번째 통합 서비스 선정**: GA4 + Vercel 병렬 완료 + Sentry + GitHub 추가 완료
- ✅ **도메인 등록**: perceptdot.com 구매 완료
- [ ] **장기 비전 방향 선택**: 에이전트 광고 네트워크 vs 에이전트용 Stripe vs CFO 에이전트 (Q3 결정)
- [ ] **Composio와 관계**: 경쟁 아닌 보완 — 채널 파트너 가능성 (Composio=연결, percept=ROI)

---

## 12. 장기 비전 — MCP 서버를 넘어서 (2026-03-22 CPO+CEO 확정)

### 진화 경로

```
현재 (씨앗)          →  중기 (데이터)        →  장기 (인프라)
MCP 서버 4개          ROI 벤치마크 축적       에이전트 경제 인프라
+ ROI 측정            + 업계 평균 비교        + 플랫폼 전환
                      + 빌링 white-label

Google 비유:
검색엔진 (씨앗)   →  데이터 축적          →  광고 회사 (진짜 사업)
```

**핵심 인사이트: MCP 서버는 "데이터 수집기"이고, 진짜 사업은 그 데이터 위에 세운다.**

### 후보 3가지 (Q3에 하나 선택)

#### A. 에이전트 광고 네트워크 (Google Ads의 에이전트 버전)
```
SaaS 회사 → perceptdot에 등록 → 에이전트가 ROI 증명 기반으로 추천 → 설치 → 결제
수익: CPA (설치당 과금) 또는 레브쉐어
차별점: 기존 광고 = 노출 기반. 이건 "ROI 증명 기반"
규모: Gartner $15T B2B 에이전트 경유 → 광고 시장만 수십조
```

#### B. 에이전트용 Stripe (B2A2H 결제 인프라)
```
아무 SaaS나 perceptdot SDK 3줄 → ROI 자동 측정 + 인라인 결제
수익: 거래 수수료 4% (ACP 참고)
규모: 모든 개발자 SaaS가 고객
```

#### C. CFO 에이전트 (에이전트 비용 최적화)
```
모든 에이전트 비용 감시 → 더 나은 대안 추천 → 절감액 수수료
수익: 절감액 10~20%
매력: "쓰면 무조건 돈 절약" = 세일즈 불필요
```

### 비교표

| | 현재 (MCP 서버) | 광고 네트워크 | 에이전트 Stripe | CFO 에이전트 |
|---|---|---|---|---|
| **정체성** | 도구 회사 | 플랫폼 회사 | 인프라 회사 | 에이전트 회사 |
| **고객** | 개발자 | SaaS 회사들 | SaaS 회사들 | 개발자/팀 |
| **수익** | 구독 $19/mo | CPA/레브쉐어 | 거래 수수료 4% | 절감 수수료 10~20% |
| **TAM** | MCP 유저 | 전체 B2B SaaS | 전체 개발자 도구 | 전체 AI 비용 |
| **MCP 필요?** | 필수 | 불필요 | 선택 | 불필요 |

---

## 13. 시장 심화 리서치 (2026-03-22 Research 에이전트)

### 13.1 에이전틱 커머스 현황

| 플레이어 | 무엇을 만들었나 | 수익 모델 |
|---|---|---|
| **OpenAI** | Operator + ACP (Agentic Commerce Protocol, Stripe 협업) | 인라인 결제 수수료 4% |
| **Google** | UCP (Universal Commerce Protocol, Shopify/Etsy/Walmart 협업) | 오픈 표준 → Cloud/Ads |
| **PayPal** | Agentic Commerce Services (2025.10) | 거래 수수료 |
| **Shopify** | AI 대화 내 머천트 판매 (ChatGPT, Perplexity, Copilot) | 기존 구독 + 거래 수수료 |
| **Perplexity** | "Buy with Pro" 쇼핑 에이전트 | 구독 $20/mo + 파트너십 |

**핵심**: 이들은 소비재 커머스. percept의 B2A2H는 개발자 도구 커머스 = 다른 영역.

### 13.2 MCP 마켓플레이스 & 유료화

- MCP 프로토콜 8M 다운로드, 85% MoM 성장. **11,000+ 서버 중 5% 미만 유료화.**
- 성공 사례: 21st.dev Magic MCP = 5회 무료 → $20/mo, 400+ GBP/mo MRR
- 공식 MCP Registry 출시 (registry.modelcontextprotocol.io, 2025.09)
- **빌링 인프라 = 거대 공백. percept의 white-label 기회.**

### 13.3 Agent-First SaaS 전환

- 기업당 평균 **144 비인간 ID / 1 인간** (2024 H2, 92:1에서 급증)
- Gartner: 2026 말 기업 앱 40%가 AI 에이전트 내장
- AI 에이전트 시장 $7.84B (2025) → $52.62B (2030), CAGR 46.3%
- 새 가격 모델: 크레딧 월렛 + 에이전트 소비형 API (Salesforce AELA, ServiceNow, MS Copilot Studio)

### 13.4 에이전트 월렛 & 자율 결제

- Coinbase AgentKit: 에이전트용 크립토 월렛 인프라 (5,000만+ 거래)
- x402 프로토콜: HTTP-native 결제 (HTTP 402), 1.62억 거래, $45M 볼륨
- **전통 금융 = KYC 필요. AI 에이전트는 여권 없음 → 블록체인이 유일한 해법**
- percept과 보완 관계: percept = "왜 추천하나" (ROI 증명), 월렛 = "어떻게 결제하나"

### 13.5 경쟁사 심화 분석

| 경쟁사 | 핵심 | percept과 차이 |
|---|---|---|
| **Composio** | 3,000+ 앱 연동, $29M 시리즈A | 연결만. ROI 없음. 보완 가능 |
| **Smithery** | MCP 마켓플레이스 2,880+ | 배포/호스팅. percept 등재 채널 |
| **Glama** | MCP 호스팅 9,000+ | API 게이트웨이. 배포 채널 |
| **Toolhouse** | 에이전트 인프라, MCP 자동연결 | 오케스트레이션. ROI 없음 |
| **AgentOps** | 에이전트 옵저버빌리티 | "비용 얼마?" → 개발자. percept = "절감 얼마?" → 에이전트→오너 |
| **LangSmith** | LLM 옵저버빌리티, Free~$150K/yr | 개발자 대시보드. 에이전트 자가추천 없음 |

**"B2A2H" 용어는 퍼블릭 담론에 존재하지 않음 → percept이 카테고리를 정의하는 위치**

### 13.6 핵심 시장 수치

| 지표 | 수치 | 출처 |
|---|---|---|
| AI 에이전트 시장 (2034) | **$236B** | WEF |
| B2B 에이전트 경유 구매 (3년 내) | **90%** | Gartner |
| 에이전트 경유 지출 규모 | **$15T** | Gartner |
| AI 전체 지출 (2026) | **$2.02T** (+36% YoY) | IDC |
| Agentic AI 투자 (2023~) | **$9.7B** | PitchBook |
| 에이전트 자율 작업 시간 | **14.5h** (123일마다 2배) | Anthropic |
| 기업 앱 에이전트 내장 (2026) | **40%** | Gartner |

### 13.7 perceptdot만의 포지션

```
                 에이전틱 커머스     MCP 마켓플레이스     에이전트 옵저버빌리티     에이전트 월렛
                 (OpenAI,Google)   (Smithery,Glama)    (AgentOps,LangSmith)     (Coinbase,x402)
                      │                  │                     │                      │
                      │                  │                     │                      │
                      └──────────────────┼─────────────────────┘                      │
                                         │                                            │
                              perceptdot ◄┘                                           │
                         MCP 서버 + ROI 측정 +                                        │
                         에이전트 자가추천                                              │
                              │                                                       │
                              └──────────────── 향후 통합 ────────────────────────────┘
```

**아무도 "MCP 서버 제공 + ROI 측정 + 에이전트가 자기 가치를 증명하고 추천"을 결합하지 않음.**

---

## 14. 전략 피벗 검토 — "에이전트 발견 레이어" (2026-03-22 CPO 분석, CEO 결정 대기)

### 배경

CEO 관찰: AI 에이전트가 Moltbook 글쓰기, 자율 코딩 등 높은 자율성 보유.
CPO 검증: 에이전트 자율성은 충분. 문제는 percept "발견 경로"가 없는 것.

### 현황 (리서치 팩트)
- 모든 MCP 클라이언트(Claude Code, Cursor, Cline, Windsurf): 자동 발견/추천/설치 기능 없음
- 에이전트→에이전트 추천 바이럴 사례: 전 세계 0건
- 97M 월간 SDK 다운로드, 5,800+ 서버 — 전부 사람→사람 추천으로 성장
- MCP Registry API 라이브, PulseMCP Agentic Config 제안 — **아무도 미조립**

### 피벗 방향

```
BEFORE: percept = MCP 서버 제공자 (GA4, Vercel, Sentry, GitHub)
AFTER:  percept = 에이전트의 도구 발견 + ROI 증명 레이어 ("에이전트의 앱스토어")

신규 tool:
- percept_recommend: Registry API 검색 → 프로젝트에 맞는 MCP 서버 추천
- percept_discover: package.json/.env 분석 → 자동 추천
```

### 10축 비교: AFTER 9승 1패
- TAM, 경쟁 방어, 네트워크 효과, B2A2H 실현성, 수익 확장성, 바이럴 구조, 장기 비전 연결 전부 AFTER 우세
- 실행 난이도만 BEFORE 유리 (AFTER는 Registry API 연동 필요)

### 실행 단계 (승인 시)
1. 현재: 마케팅 + 유저 확보 (변경 없음)
2. v0.3.0: percept_recommend + percept_discover 추가
3. 이후: 외부 MCP 서버도 추천 → 추천 수수료 (에이전트 광고 네트워크로 자연 진화)

**상세 분석: docs/outputs/cpo_20260322.md §9**

---

## 15. 미결 사항 (업데이트)

- [ ] **전략 피벗 승인** — "MCP 서버 제공자" → "에이전트 발견+ROI 레이어" (CEO 결정 대기)
- [ ] **장기 비전 방향 최종 선택** — Q3 데이터 기반 결정 (에이전트 광고 / 에이전트 Stripe / CFO 에이전트)
- [ ] **x402/AgentKit 연동 시점** — 에이전트 자율결제 인프라 통합 타이밍
- [ ] **Composio 채널 파트너십** — 연동 제안 시점 (유저 100명 이후)

---

*최초 작성: 2026-03-19 · 업데이트: 2026-03-22 (장기 비전 + 시장 심화 리서치 + 전략 피벗 검토)*
