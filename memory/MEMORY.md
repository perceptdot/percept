# percept — 프로젝트 메모리

> 이 프로젝트는 K-사주와 **별개**. K-사주 메모리와 혼동 금지.
> 최초 생성: 2026-03-19 | 업데이트: 2026-03-24

---

## 현재 Phase

### 🔴 현재: @perceptdot/eye (EYE-06 단계 — 데모 영상)
```
✅ EYE-01: CF Browser Rendering API POC 완료 (2026-03-24)
   → 7.4초 / $0.000012/체크 / api.perceptdot.com/v1/eye/check 라이브
✅ EYE-04: Remote MCP 서버 완료 (2026-03-24)
   → mcp.perceptdot.com/mcp (Hono + CF Workers)
   → `claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp`
✅ EYE-05: 랜딩 "Give Your AI Eyes." 메시지 교체 완료 (2026-03-24)
✅ EYE-GHA: GitHub Action MVP 완성 (2026-03-24)
   → eye-action/ (action.yml + src/index.js + ncc 번들 dist/ + README)
   → 다음: perceptdot/eye-action GitHub repo 생성 → Marketplace 등록 (EYE-11)
🔴 BUG-EYE-01: waitUntil:"load" → perceptdot.com 18초 초과 (Paddle.js 때문) → networkidle2로 수정
🔴 BUG-EYE-02: has_issues/summary 필드 미배포 → wrangler deploy 필요 (GHA 연동 전 필수)
⭐ EYE-06: 데모 영상/GIF 제작 (1순위 — 없으면 홍보 불가)
EYE-02: r/ClaudeCode 수요 설문 50명 (EYE-06 완료 후)
EYE-07: Show HN + r/ClaudeCode 포스팅 (EYE-06 완료 후)
```

### POC 라이브 검증 결과 (2026-03-25)
```
example.com: 7.7초 ✅ / $0.000012 ✅ / poc_passed: true
perceptdot.com: 18초 ❌ (Paddle.js 로드 대기) / poc_passed: false
→ waitUntil 수정 후 재검증 필요
배포 미완: has_issues/summary 필드 로컬에만 존재
```

### Paddle 결제 현황 (2026-03-24~25 완료)
```
Free: 100 checks/month
Pro: $19/month  | pri_01kmg45jn3dx41vcz3hxemjwkz
Unlimited: $49/month | pri_01kmg8vwgm41gkycqn9y5fhzem
Client token: live_b1bd10e2c2ab4e9f8a05d259c46
도메인: perceptdot.com ✅ 승인됨
```

### ✅ 완료된 단계
- **0단계** (2026-03-19): 아이디어 검증 + 사업계획 + 기술 스택 결정
- **1단계** (2026-03-19): npm 퍼블리시 완료 (@perceptdot/ga4, vercel 첫 버전)
- **2단계** (2026-03-20): GitHub 공개 + Cloudflare Workers + Landing Pages 배포
- **3단계** (2026-03-21~22): 도메인 + 결제 + Growth + v0.2.x
  - ✅ @perceptdot/sentry@0.1.1, @perceptdot/github@0.1.1, vercel@0.1.2 npm 라이브
  - ✅ @perceptdot/ga4@0.2.1 — Named Profiles + 플랜 검증
  - ✅ Landing 가격 개편: Free 2통합/200콜, Team $99/10시트
  - ✅ SEO: sitemap.xml + robots.txt + OG/Twitter 메타 + canonical
  - ✅ Google Search Console 등록 + sitemap 3 pages 인덱스 완료
  - ✅ GA4 Property G-982JCXJW0N 발급 + 랜딩 삽입 완료
  - ✅ Gumroad 결제 라이브 (Pro $19, Team $99)
  - ✅ api.perceptdot.com Workers 재배포 완료 (DNS 전파 완료)
  - ✅ .mcp.json 보안 이슈 수정 + Vercel/GitHub 토큰 재발급 완료
  - ✅ service@perceptdot.com 이메일 셋업 완료 (Cloudflare Routing + Brevo SMTP)
  - ✅ RSS 피드 구현 완료 (/rss/changelog + /rss/feedback)
  - ✅ PAY-06: API 키 검증 + 무료/유료 차별화 완료
  - ✅ AI-First 전면 개편 완료 (2026-03-22) — 4개 MCP 서버 영어 에이전트 설득형, counterfactual ROI, "NOTE TO HUMAN" / "TELL YOUR HUMAN" 설치 설득
  - ✅ 랜딩 무료 베타 전환 완료 (2026-03-22) — "Open Beta · Free Starter", Pro/Team "Coming Soon", 가격 TBD
  - ✅ npm 키워드 최적화 + 버전 범프 (2026-03-22) — ga4@0.2.5, vercel@0.1.5, github@0.1.4, sentry@0.1.4
  - ✅ README 마케팅 중심 재작성 + 마케팅 초안 5채널 작성 (2026-03-22)
  - ✅ GitHub 6커밋 + Cloudflare Pages/Workers 재배포 완료 (2026-03-22)
  - ✅ COST-01: 10K유저 $5/mo, 100K유저 $65/mo 분석 완료
  - ✅ awesome-mcp-servers PR #3639 제출 완료 (2026-03-22)
  - ✅ og-image.png 제작 완료 (2026-03-22 01:17 KST · 모바일 Claude)
  - ✅ Moltbook 포스팅 초안 + API 조사 완료 (2026-03-22 01:17 KST · 모바일 Claude) — 실행 보류
  - ✅ 3단계 런칭 스택 전략 수립 (2026-03-22 01:40 KST · 모바일 Claude) — 12개 채널 확보
  - ✅ Growth 런칭 실행 계획서 작성 (docs/outputs/growth_20260322.md)
  - ✅ Glama.ai MCP 서버 등록 제출 완료 (리뷰 대기)
  - ✅ Paddle KYC 이름 불일치 답신 발송 (CheonKyu Jang → Sorina Lee/THUNOVA 설명 + Account Settings 변경 요청)
  - ✅ 랜딩 푸터 사업자번호 라인 제거 (국제 SaaS 불필요)
  - ⏳ **Lemon Squeezy** KYC 답변 대기 (Paddle 아님 — 수정) — 데모영상+가격+X프로필 제출 후 승인 진행
  - ⏳ Glama 서버 리뷰 승인 대기 → 승인 후 PR #3639에 배지 추가
  - 🔴 BUG-01: Cloudflare Bot Fight Mode — ClaudeBot 차단 (CEO 수동)
  - ✅ og-image.png 제작 완료 (2026-03-22 01:17 KST · 모바일 Claude, scripts/generate_og_image.py)
  - ✅ X (Twitter) API 앱 "perceptdot" 생성 완료 (2026-03-22 02:50 KST · 모바일 Claude)
    - App ID: 32625109, Free tier, Read and Write 권한
    - ✅ 키 재발급 완료 (GitGuardian X-API-Key Secret 탐지 → CEO 수동 Regenerate)
    - 키 파일: `api_keys/x_api.env` (절대 값 노출 금지, CLAUDE.md Rule 12)
  - ✅ PIVOT 전체 완료 (Phase 1~4): core@0.1.0 npm + 백엔드 Registry + 랜딩 + README
  - ✅ X 3/3 스레드 수동 포스팅 완료 (2026-03-22) — "human clipboard" 후킹, API 402→수동 전환
  - ✅ Reddit 댓글 3개 게시 완료 (2026-03-23) — r/ClaudeCode 1 + r/ClaudeAI 2 (MCP 토론 참여)
  - ❌ Reddit 포스트 차단 (신규 계정 + Brand Affiliate) → 댓글 카르마 빌딩 전략
  - 🟡 외부 설치 유저 0명 (현재 KV에 내부/테스트 키만 존재)
  - ✅ 마케팅 강화 플랜 실행 완료 (2026-03-23 · 데스크탑 Claude) — 산출물 5개 파일:
    - directory_submission_sheet.md (10개 디렉토리 복붙 제출 시트)
    - community_posts.md (r/mcp + HN 첫댓글 + PR 머지 촉구 + 댓글 템플릿)
    - blog_devto_mcp_tokens.md (Dev.to 기술 블로그 + Indie Hackers 아웃라인)
    - producthunt_launch_kit.md (PH 런칭 키트: 제출필드 + 첫댓글 + 스크린샷 가이드 + 데모GIF)
    - outreach_templates.md (Discord/DM/Reddit/X 리플라이 + 주간 체크리스트)
  - ✅ **PIVOT-01 승인 + PIVOT-02 완료** (2026-03-22 세션 10)
    - @perceptdot/core@0.1.0 npm 퍼블리시 완료
    - 4 tools: percept_discover, percept_recommend, percept_installed, percept_roi_summary
    - 15 curated servers, SIGNAL_MAP 자동 추천, K_saju 테스트 통과
  - npm 패키지: core@0.1.0, ga4@0.2.6, vercel@0.1.6, github@0.1.5, sentry@0.1.5
  - ✅ **AlternativeTo 등록 완료** (2026-03-23) — alternativeto.net/software/perceptdot/, Composio alternative, 승인 대기 24h
  - ⏳ **Paddle KYC 최종 승인 임박** (2026-03-23) — Stevan이 계정정보 Sorina Lee로 업데이트, 검증 곧 완료
  - ✅ **@perceptdot/ga4-perceptdot MCP 설정 완료** (2026-03-23) — GCP perceptdot 프로젝트, percept-ga4 서비스 계정, GA4 속성 529351391, ~/.claude.json 추가. Claude Code 재시작 후 활성화

## B2A2H 확장 BM 리서치 결론 (2026-03-22 CPO)

- **시장 검증**: OpenAI ACP + Google UCP 출시 → B2A2H 모델 메인스트림 진입 확인
- **핵심 수치**: Gartner 3년 내 B2B 90% 에이전트 경유, $15T 규모
- **경쟁 공백**: 옵저버빌리티 도구 전부 개발자→개발자 판매. 에이전트 자가추천 = perceptdot 유일
- **1순위 확장**: BM-01 벤치마크 플랫폼 (/v1/benchmark, v0.3.0)
- **2순위 확장**: BM-02 MCP 빌링 인프라 (white-label, Q2)
- **3순위 확장**: BM-03 ACP 연동 (에이전트 인라인 결제, Q3)
- **보고서**: docs/outputs/cpo_20260322.md

## 장기 비전 확정 (2026-03-22 CPO+CEO)

**"MCP 서버는 씨앗, 진짜 사업은 데이터 위에 세운다"**

- **진화 경로**: MCP 서버 (현재) → ROI 데이터 축적 (Q2) → 에이전트 경제 인프라 (Q3~)
- **Google 비유**: 검색엔진(씨앗) → 데이터 축적 → 광고 회사(진짜 사업)
- **후보 3개** (Q3 데이터 기반 택1):
  1. 에이전트 광고 네트워크 — ROI 증명 기반 도구 추천, CPA/레브쉐어
  2. 에이전트용 Stripe — B2A2H 결제 인프라 SDK, 거래 수수료 4%
  3. CFO 에이전트 — 에이전트 비용 최적화, 절감 수수료 10~20%
- **"B2A2H" 용어는 퍼블릭 담론에 미존재** → perceptdot이 카테고리 정의
- **시장 규모**: AI 에이전트 $236B (2034, WEF), B2B 에이전트 경유 $15T (Gartner)
- **포지셔닝**: MCP 서버 + ROI 측정 + 에이전트 자가추천 결합 = 경쟁자 0
- **에이전트 자율결제 인프라**: x402, Coinbase AgentKit — 향후 통합 후보
- **상세 리서치**: docs/bizplan.md §12~§13

---

## 경쟁사/보완사 워치리스트 (2026-03-22 추가)

| 이름 | 분류 | 무엇 | 장기 겹침 위험 | 모니터링 |
|---|---|---|---|---|
| Composio | 보완 | 3,000+ 앱 연결 | 낮음 (연결만) | 주 1회 |
| Smithery/Glama | 채널 | MCP 마켓플레이스 | 없음 | 월 1회 |
| AgentOps/LangSmith | 간접 경쟁 | 옵저버빌리티 | 중간 (에이전트 자가추천 추가 시) | 주 1회 |
| **Spix** | **보완/잠재 경쟁** | 에이전트 통신 (전화/이메일/음성) | **중간** (B2A2H 보고 채널 겹침) | 월 1회 |
| 21st.dev | 벤치마크 | MCP 유료화 성공 사례 | 낮음 | 월 1회 |

- Spix (spix.sh, GitHub: Spix-HQ, bluman1/Michael Ogundare)
  - 26 tools, Deepgram+Claude Haiku+Cartesia, ~500ms 레이턴시
  - 위협: 에이전트→사람 보고를 통신 채널(이메일/전화)로 대체 가능
  - 기회: percept(측정) + Spix(전달) 통합 시 시너지

---

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
- ✅ 첫 번째 통합 서비스: GA4 + Vercel 병렬 (2026-03-19 결정)
- ✅ PIVOT-01 전략 피벗 승인 완료 (2026-03-22 CEO 승인, core@0.1.0 퍼블리시 완료)

## Moltbook 활동 목적 5가지 (2026-03-23 CEO 확정 — 항상 상기)

모든 포스트·댓글의 존재 이유. 순서 = 우선순위.
```
1️⃣ 서비스 유입    — perceptdot 써보게 만들기
2️⃣ 피드백 수집    — 댓글/반응 인사이트 추출
3️⃣ 바이럴/언급    — perceptdot이 트렌드가 되게
4️⃣ 서비스 개선    — 피드백 → 제품 발전 루프
5️⃣ 유료 전환      — 최종 결제로 이어지게
```
작성 전 체크: "이 글이 5가지 중 어디에 기여하는가?"

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

**결제**: 임시 Gumroad → 정식 **Paddle** (2026-03-21 CEO 확정)
- Paddle KYC 심사 중 (Sorina Lee / THUNOVA)
- 승인 시 K-사주 + perceptdot 동시 Gumroad→Paddle 전환
- Glama.ai: thunova0318@gmail.com (MCP 서버 디렉토리)
- **Moltbook**: 에이전트 등록 완료 (2026-03-22)
  - API Key: `moltbook_sk_LIL54qRyJCOyAWi6Y3fPdc87ngiSFweU`
  - 프로필: https://www.moltbook.com/u/perceptdot
  - 클레임 URL: https://www.moltbook.com/claim/moltbook_claim_zOhj_siMSDGNaAYcMVyfUeuuINM3fkkw
  - 인증 코드: ocean-D2WD (트윗 필요)
  - API Base: `https://www.moltbook.com/api/v1`
  - **클레임 후 에이전트가 직접 API로 포스팅 가능** (CEO 지시)
  - Rate Limits: 1 post/30min, 1 comment/20sec (50/day), read 60/60s, write 30/60s
  - 신규 에이전트: obfuscated math challenge 풀어야 포스트 가능 → /verify 엔드포인트
  - 워크플로: GET /home → 기존 콘텐츠 참여(댓글/업보트) → 포스트 작성

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
- **작업 환경 구분 기록 필수** (2026-03-22 CEO 지시): 모바일 Claude / 데스크탑 Claude 명시

## QA 원칙 (2026-03-21 CEO 확정)
- **⚠️ 최우선**: QA는 반드시 우리 MCP 서버(@perceptdot/ga4, vercel, sentry, github)를 직접 사용하면서 진행
- 실제로 써봐야 불편한 점 발견 가능 → 개선 우선순위 결정
- QA 중 발견된 UX 불편사항은 backlog에 즉시 기록 (BUG 또는 UX 태그)

## 전략 피벗 검토 (2026-03-22 세션 8 · 모바일 Claude · CEO 결정 대기)

**CEO 통찰**: "에이전트가 Moltbook에 글 쓸 정도면 도구 추천도 할 수 있다"
**CPO 검증**: 맞음. 에이전트 자율성 충분. 문제는 "발견 경로"가 없는 것.

**피벗 방향**: "MCP 서버 제공자" → "에이전트의 도구 발견+ROI 레이어"
- percept_recommend: MCP Registry API 검색 → 프로젝트에 필요한 MCP 서버 추천
- percept_discover: 프로젝트 분석(package.json 등) → 자동 추천
- percept가 "에이전트의 앱스토어" 역할

**MCP 자동 발견 현황 (리서치 팩트)**:
- 모든 MCP 클라이언트: 자동 발견/추천/설치 기능 없음
- 에이전트→에이전트 바이럴 사례: 전 세계 0건
- 부품 존재: Registry API 라이브, PulseMCP 제안, Smithery CLI — 아무도 미조립

**10축 비교**: AFTER(피벗) 9승 1패. 실행 난이도만 BEFORE 유리.
**상세**: docs/outputs/cpo_20260322.md §9

**CEO 결정 대기**: 피벗 승인 여부

## CEO 결의 (2026-03-22 세션 9 · 데스크탑 Claude)

**"이 사업을 반드시 성공해야 한다"** — CEO 직접 선언

CEO 지시사항:
1. 기존 마케팅 진행상황 + 대처방안 마련
2. 피벗 시 시장상황 조사 + 경쟁사/유사 서비스 전수 파악
3. 강점/차별점/킬링포인트 명확화
4. 제품 품질 보증 + 플랫폼 관리 계획 구체화
5. "돌다리도 두들겨보고 가자" — 리스크 최소화 원칙

**CEO 원문**: "너무 많은 생각을 하는 건가?" → CPO 판단: 아님. 이 단계에서 철저한 검증이 맞음.

---

## API 키 보안 (2026-03-22 확립)
- **CLAUDE.md Rule 12**: .env 파일 Read 시 값 절대 출력 금지. "키 N개 확인" 형태로만 보고
- **GitGuardian**: perceptdot org에 설치 완료 — git push 시 시크릿 자동 탐지
- **api_keys/ 폴더**: 15개 .env 파일 관리 (기존 marketing_sns/ → api_keys/ 리네임)
- **.gitignore**: api_keys/, *.env, marketing_sns/ 추가 완료
- **계정 맵**: `docs/accounts.md` — 전체 서비스별 계정·키·상태 관리
- **사고 이력**: X-API-Key Secret git 노출 → GitGuardian 탐지 → CEO 수동 재발급

## 별도 파일
- `memory/backlog.md` — 전체 백로그
- `docs/bizplan.md` — 사업계획서 (확정)
- `docs/accounts.md` — 계정 맵 (전체 서비스·API 키·상태)
- `IDEA.md` — 최초 아이디어 기록
- `docs/agents/` — 7개 에이전트 문서 (2026-03-24 eye 피벗 반영 전체 업데이트)

## 전략 피벗 확정 (2026-03-24 · 데스크탑 Claude)

**기존 제품 (B2A2H 메트릭 추적) → 폐기**
**신제품: @perceptdot/eye — AI 에이전트 비주얼 QA Remote MCP**

### 핵심 근거
- CEO 원래 직관 복귀: "에이전트에게 눈을 달아준다"
- 전용 MCP 비주얼 QA 제품 = 전 세계 0개 (2026-03-24 리서치 확인)
- 시장: $1.5B 비주얼 테스팅 × $10.9B AI 에이전트 교차점

### 아키텍처 결정
- 인프라: **Cloudflare Browser Rendering API** (이미 CF 사용 중, ~$0.0001/체크)
- Vision: **Gemini 2.5 Flash** (86% 절감, $0.00194/체크) + 하이브리드 옵션
- 배달: **Remote MCP (HTTP)** — `claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp`
- 마진: ~95% (인프라 + API 합산)
- ⚠️ Cloudflare Workers에서 Playwright 직접 실행 불가 (128MB 한도) → CF BR API 사용

### 제품 로드맵
- Phase 1: visual_check(url) — 스크린샷 + AI 분석
- Phase 2: 영속 베이스라인 (Cloudflare R2)
- Phase 3: 기본 손 (click, fill, navigate)
- Phase 4: visual_journey() — 눈+손 E2E 저니 감사 (핵심 차별점)
- Phase 5: CI/CD GitHub Action + Vercel Integration

### 다음 액션 (POC 우선)
- [ ] Cloudflare BR API POC — 10초 이내, $0.05 이하 확인
- [ ] r/ClaudeCode 수요 설문 (50명 목표, 구매 의향 30%+ 기준)
- [ ] POC 통과 시 → Remote MCP 서버 구현

### 산출물
- `docs/outputs/eye_strategy_report_20260324.md` — 종합 전략
- `docs/outputs/eye_infra_cost_20260324.md` — 비용 비교
- `docs/outputs/eye_hands_research_20260324.md` — 눈+손 로드맵
- `docs/outputs/daily_20260324.md` — 일일 보고

## 시장 수치 (리서치 완료 2026-03-19, 2026-03-24 업데이트)
- 비주얼 테스팅 시장: $1.5B → $5B (2033), CAGR 12.5%
- AI 에이전트 시장: $10.9B → $52.6B (2030), CAGR 46.3%
- MCP SDK 다운: 97M+/월, 80배/5개월 성장
- Claude Code ARR: $2.5B+, 분기별 2배
- 직접 경쟁사: TestSprite MCP ($8.1M) — 범용. Applitools — MCP 없음
