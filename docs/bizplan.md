# percept — 사업계획서

> 최초 작성: 2026-03-19
> 상태: 확정 (1단계 진입 준비)
> 마지막 업데이트: 2026-03-19

---

## 1. 한 줄 요약

**AI 에이전트가 지각 능력을 갖게 되는 MCP 플랫폼.**

에이전트가 GA4·EC2·Vercel·DB 등 외부 서비스를 직접 보고,
토큰/시간 절감량을 측정해 주인에게 ROI를 자동 보고한다.

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
- ✅ 사업계획 확정
- ✅ 서비스명 확정 (`percept`)
- ✅ 기술 스택 확정 (3레이어: TypeScript MCP + Hono 백엔드 + Python SDK)
- ✅ 수익 모델 확정 (B2A2H, Free/$19/$49)
- ✅ 타겟 에이전트 확정 (MCP 클라이언트 전체)
- ✅ 도메인 확정 (perceptdot.com)
- ✅ 3레이어 전략 확정 (MCP / Hono 백엔드 / Python SDK)

### 1단계 MVP (2026-04 ~ 05) — 로컬 MCP 서버
- [ ] 도메인 확보 (percept.dev)
- [ ] npm 패키지명 확인 (@percept)
- [ ] 첫 번째 MCP 서버 구현 (CEO가 선택: GA4 / Vercel / EC2)
- [ ] 토큰 측정 모듈 구현 (PerceptMetrics)
- [ ] Claude Code에서 동작 검증
- [ ] 얼리어답터 5명 확보

### 2단계 검증 (2026-05 ~ 06) — 클라우드 + Python SDK
- [ ] npm 퍼블리시 (@percept/*)
- [ ] Hono 백엔드 기초 셋업 (Cloudflare Workers)
- [ ] ROI 리포트 자동 생성
- [ ] percept-python SDK 설계 (얇은 HTTP 클라이언트)
- [ ] 통합 3개 추가
- [ ] 얼리어답터 50명
- [ ] README 전파 실험 (입소문 검증)

### 3단계 유료화 (2026-06~) — REST API 공개
- [ ] B2A2H 결제 플로우 (에이전트 → 결제 링크 보고 → 사람 클릭)
- [ ] $19/월 Pro 런칭
- [ ] REST API 공개 (어떤 언어든 연결)
- [ ] 에이전트 생태계 파트너십 (Anthropic MCP 디렉토리 등재)

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

- [ ] **첫 번째 통합 서비스 선정**: GA4 / Vercel / EC2 / Sentry 중?
- [ ] **도메인 등록**: perceptdot.com ✅ 확정 — 구매 실행 필요 ($15/년)
- [ ] **Composio와 관계**: 경쟁? 보완? 장기적으로 인수 타겟?

---

*최초 작성: 2026-03-19 · 업데이트: 2026-03-19*
