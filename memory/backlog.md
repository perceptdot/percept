# percept — 백로그

> 업데이트: 2026-03-22

---

## CRITICAL (CEO 결정 블로킹)

- ✅ **BIZ-06** 첫 번째 통합 서비스 선정: GA4 + Vercel 병렬 (2026-03-19)
- ✅ **INFRA-01** 도메인 등록 완료 — perceptdot.com (2026-03-19)

---

## CRITICAL — 상용화 MVP 필수

- ✅ **INFRA-03** GitHub repo 공개 완료 — github.com/perceptdot/percept (2026-03-20)
- ✅ **INFRA-04** Cloudflare Workers 배포 완료 — perceptdot-api.perceptdot.workers.dev (2026-03-20)
- ✅ **INFRA-05** 커스텀 도메인 연결 (Pages) — perceptdot.com → Cloudflare Pages (2026-03-20, AWS→Cloudflare 네임서버 변경, Zone 활성화, Pages 연결 완료)
- ✅ **INFRA-06** API 커스텀 도메인 — api.perceptdot.com → Cloudflare Workers 배포 (2026-03-20, wrangler.toml 수정 + npm run deploy + CLOUDFLARE_API_TOKEN 설정)
- ✅ **MCP 서버 빌드** + .mcp.json 경로 업데이트 완료 (2026-03-20)

## CRITICAL — 계정 이전 (soondoobu1111 → thunova0318)

- [ ] **ACCT-01** GitHub: soondoobu1111-star에 thunova0318 이메일 추가 + perceptdot org Owner 이전
- [ ] **ACCT-02** Vercel: thunova0318@gmail.com으로 이전 (K-사주 배포 포함)
- [ ] **ACCT-03** AWS: 루트 계정 이메일 soondoobu1111 → thunova0318 변경
- [ ] **ACCT-04** Gitbook: thunova0318 Admin 초대
- [ ] **ACCT-05** npm: 퍼블리시 계정 확인 + thunova0318으로 통일

---

## HIGH (다음 단계)

- ✅ **INFRA-02** npm `@perceptdot` 네임스페이스 선점 완료 (2026-03-19, @percept 선점됨 → @perceptdot 확정)
- ✅ **ARCH-01** Hono 백엔드 기초 셋업 완료 (2026-03-19) → api/ (5개 파일, 4 엔드포인트, Cloudflare Workers)
- ✅ **ARCH-02** percept-python SDK 설계 완료 (2026-03-19) → python-sdk/ (7개 파일, 동기+비동기+데코레이터)
- ✅ **TECH-03** 토큰 절감 측정 방법론 설계 완료 (2026-03-19) → docs/tech/token_measurement.md
- ✅ **TECH-01** TypeScript MCP SDK 기술 설계 문서 완료 (2026-03-19) → docs/tech/mcp_sdk_design.md
- ✅ **TECH-02** Composio MCP 서버 구조 분석 완료 (2026-03-19) → docs/outputs/research_20260319.md
- ✅ **BRAND-01** 픽셀 로고 제작 완료 (2026-03-20) — 아이콘(8×8 픽셀 눈) + 워드마크(Press Start 2P), 5종 변형, 사이트 적용 완료
- [ ] **GROWTH-01** B2A2H 세일즈 플로우 설계 (에이전트 → 결제 링크 보고 UX)
- 🔄 **GROWTH-02** Moltbook 전략 실행 — 에이전트 등록 완료 + 포스팅 초안 완료 (2026-03-22)
  - ✅ Moltbook 에이전트 등록 완료 — pending_claim 상태
  - ✅ API Key: moltbook_sk_LIL54qRyJCOyAWi6Y3fPdc87ngiSFweU
  - ✅ skill.md 확인 완료 — API base: https://www.moltbook.com/api/v1
  - ✅ 포스팅 초안 작성 완료 → docs/outputs/marketing_ready_to_post.md
  - [ ] CEO 클레임 (트윗 인증, 코드: ocean-D2WD)
  - [ ] **클레임 후 에이전트가 API로 직접 홍보 포스트 작성** (CEO 지시: "읽고 글쓰게 할걸")
    - POST /posts로 submolt에 포스트 작성
    - 신규 에이전트 math challenge 해결 필요 (/verify)
    - Rate limit: 1 post/30min
    - 전략: GET /home → 기존 글 댓글/업보트 참여 → 홍보 포스트
  - [ ] percept 에이전트가 Moltbook에서 피드백 수집
  - [ ] moltbook-skill / moltbook-mcp-server 연동 검토
  - ※ 인간 얼리어답터 → AI 에이전트로 방향 전환 (2026-03-20 CEO 결정)
- ✅ **GROWTH-03** awesome-mcp-servers PR #3639 제출 완료 (2026-03-22) — Glama 배지 추가 필요 (리뷰 승인 후)
- [ ] **GROWTH-04** Anthropic Discord #tools 채널 포스팅 ⏸️ 대기
- [ ] **GROWTH-05** r/ClaudeAI Reddit 소개 포스트 ⏸️ 대기
- [ ] **GROWTH-06** 런칭 플랫폼 다단계 전략 (2026-03-22 CEO 지시 — 최적·최고 홍보)
  - 담당: Growth (실행) + DevRel (콘텐츠) + CPO (감독)
  - **1단계 — 즉시 등록 (복수 가능, 부담 없음)**
    - [ ] DevHunt 등록 (개발자 도구 전용 PH, MCP/CLI 정확 타겟)
    - [ ] BetaList 등록 (베타 제품 전용, 얼리어답터 모집)
    - [ ] There's An AI For That (TAAFT) 등록 (AI 도구 디렉토리, 월 수백만 방문)
    - [ ] AlternativeTo 등록 ("Composio 대안" 검색 노출)
    - [ ] Launching Next 등록 (큐레이션 스타트업 디렉토리)
    - [ ] Microlaunch 등록 (월간 노출, 장기 발견)
  - **2단계 — 반응 확인 후 실행**
    - [ ] Hacker News Show HN (화/수 US 오전, 초안 ready)
    - [ ] Reddit r/ClaudeAI + r/cursor + r/webdev + r/SideProject
    - 🔄 Twitter/X 단일 트윗 → 스레드 (반응 보고) — **X API 앱 "perceptdot" 생성 완료, 키 6개 확보 (2026-03-22), 데스크탑에서 .env 설정 + 포스팅 예정**
    - [ ] Moltbook 포스팅 (API 키 발급 후)
    - [ ] Anthropic Discord #tools
    - [ ] Indie Hackers (빌드인퍼블릭 스토리)
    - [ ] Smol Launch (주간 포맷, 개발자 특화)
  - **3단계 — 올인 (준비 완벽 시, 1회성)**
    - [ ] Product Hunt 런칭 (Maker 프로필 + 스크린샷 5장 + First Comment)
    - 필요: og-image ✅, 랜딩 ✅, 태그라인 ✅, 스크린샷/데모, 런칭일(화~목)
  - **공통 준비물**
    - [x] og-image.png (1200×630px)
    - [x] 랜딩 페이지 라이브 (perceptdot.com)
    - [x] npm 4개 서버 퍼블리시
    - [x] GitHub 공개 repo
    - [x] 마케팅 초안 5채널 (docs/outputs/marketing_ready_to_post.md)
    - [ ] 스크린샷 3~5장 (터미널 MCP 실사용 장면) — Dev 담당
    - [ ] 데모 GIF or 30초 영상 (선택, 효과 극대화)
    - [ ] 각 플랫폼별 프로필/계정 생성 — CEO 수동

---

## CRITICAL — 전략 피벗 (2026-03-22 세션 8 · CEO 결정 대기)

- [ ] **PIVOT-01** 전략 피벗 승인 — "MCP 서버 제공자" → "에이전트 발견+ROI 레이어" (CEO 결정 대기)
  - CEO 통찰: 에이전트 자율성 충분, 문제는 발견 경로
  - CPO 비교 분석: AFTER 9승 1패
  - 상세: docs/outputs/cpo_20260322.md §9
- [ ] **PIVOT-02** Phase 1: @perceptdot/core 개발 (1~2일, Dev 담당, 백엔드 변경 없음)
  - sdk/packages/core/ 생성 (ga4 패턴 따름)
  - percept_discover: 로컬 파일 분석 → SIGNAL_MAP 매핑
  - percept_recommend: 큐레이션 DB + Registry API 직접 호출
  - percept_installed: .mcp.json 읽기
  - curated-db.ts: perceptdot 4개 + 외부 ~20개 하드코딩
  - npm publish @perceptdot/core@0.1.0
- [ ] **PIVOT-03** Phase 2: 백엔드 Registry 프록시 (1일, Dev 담당)
  - GET /v1/registry/curated, GET /v1/registry/search, POST /v1/recommend/log
  - core@0.2.0: 백엔드 프록시 사용 전환
- [ ] **PIVOT-04** Phase 3: 랜딩 페이지 업데이트 (0.5일, DevRel+Dev)
  - Hero "Your Agent's App Store", Feature 카드 2개 교체
  - Output Preview에 percept_discover 예시 추가
- [ ] **PIVOT-05** Phase 4: README + 마케팅 초안 업데이트 (0.5일, DevRel)
  - "One install. Your agent discovers the rest."

---

## HIGH — B2A2H 확장 BM (2026-03-22 CPO 리서치)

- [ ] **BM-01** 에이전트 ROI 벤치마크 플랫폼 — /v1/use 집계 → /v1/benchmark 엔드포인트 (v0.3.0 목표)
  - "상위 N%" 비교, 업계 평균 대비 성과 보고
  - 기존 인프라 100% 재활용, 난이도 낮음
- [ ] **BM-02** MCP 빌링 인프라 (white-label) — 다른 MCP 서버에 perceptdot 결제 레이어 제공 (Q2)
  - 레브쉐어 10~15%, 11,000+ MCP 서버 5% 미만 유료화 = 거대 공백
- [ ] **BM-03** ACP/UCP 에이전트 커머스 연동 — 에이전트 인라인 결제 중개 (Q3)
  - OpenAI ACP + Google UCP, 개발자 도구 커머스

## HIGH — 장기 비전 (2026-03-22 CPO+CEO 확정)

- [ ] **VISION-01** 장기 방향 최종 선택 — Q3 데이터 기반 (에이전트 광고 네트워크 / 에이전트 Stripe / CFO 에이전트)
  - MCP 서버 = 씨앗 (데이터 수집기), 진짜 사업 = 데이터 위의 인프라
  - 상세: docs/bizplan.md §12
- [ ] **VISION-02** x402/Coinbase AgentKit 연동 PoC — 에이전트 자율결제 인프라 (Q3~Q4)
  - HTTP 402 네이티브 결제 또는 크립토 월렛 통합
- [ ] **VISION-03** Composio 채널 파트너십 제안 — 유저 100명 이후
  - Composio = 연결(3,000+ 앱), percept = ROI 측정. 보완 관계

---

## HIGH (다음 스프린트)

- [ ] **SEO-01** perceptdot.com GA4 설치 + SEO 최적화 (2026-03-21 추가)
  - ✅ sitemap.xml + robots.txt 생성 완료
  - ✅ og:image, twitter:image, canonical 메타 태그 추가 완료
  - ✅ GA4 Property ID 발급 → landing/index.html gtag 삽입 완료 (G-982JCXJW0N, 스트림 ID: 14162535672, 2026-03-21)
  - [ ] og-image.png 실제 파일 제작 (CEO 수동)
  - [ ] GA4_PROFILES에 "perceptdot" 프로필 추가 (Property ID 발급 후)

- ✅ **FEED-01** 무료 키 발급 + 피드백 루프 구현 완료 (2026-03-21)
  - POST /v1/free-key (이메일 → pd_free_xxx 키 발급, KV 저장, Resend 이메일)
  - POST /v1/use (무료 키 콜 추적, 100콜 초과 시 피드백 요청)
  - POST /v1/feedback (별점+코멘트 제출 → 쿼터 +100, 공개 피드백 목록 저장)
  - GET /v1/feedbacks (공개 피드백 목록)
  - MCP 4개 서버: pd_free_ 키 분기 + percept_feedback 새 tool 추가
  - 랜딩: "Get Free API Key" 버튼 + 이메일 모달 추가
  - npm: ga4@0.2.2, vercel@0.1.3, github@0.1.2, sentry@0.1.2 퍼블리시

- ✅ **FEED-02** 랜딩 Agent Reviews 섹션 추가 완료 (2026-03-21) | 더미 데이터 삭제 + 섹션 자동 숨김 처리 (03-22, 실제 피드백 올 때만 자동 노출)
  - /v1/feedbacks API 연동, 실시간 로딩, 별점+코멘트 카드, skeleton 로딩 UI
  - [ ] Twitter/X 자동 포스팅 웹훅 (선택, 후순위) — X API 앱 생성 완료, 키 확보됨
  - [ ] README에 실제 에이전트 피드백 인용 (피드백 쌓이면)

## NORMAL — v0.2.0 계획

- ✅ **DEV-11** Named Profiles — @perceptdot/ga4 v0.2.0~0.2.1 완료 (2026-03-21) — 플랜 검증 + 멀티프로젝트
  - `GA4_PROFILES` + `GA4_DEFAULT_PROFILE` env var (하위 호환: GA4_PROPERTY_ID 유지)
  - 모든 tool에 optional `project` 파라미터 추가
  - .mcp.json 업데이트 (ga4-k-saju → @perceptdot/ga4, Named Profiles 방식)
  - npm @perceptdot/ga4@0.2.0 퍼블리시 완료
  - perceptdot GA4 Property ID 확보 시 profiles에 추가만 하면 됨
  - [ ] **DEV-11b** 같은 패턴을 vercel/github/sentry에도 적용 (후순위)

## NORMAL

- ✅ **DEV-01** @percept/ga4 MCP 서버 구현 완료 (2026-03-19)
- ✅ **DEV-01b** @percept/vercel MCP 서버 구현 완료 (2026-03-19)
- ✅ **DEV-02** PerceptMetrics 토큰 측정 모듈 구현 (2026-03-19)
- ✅ **DEVREL-01** README 초안 완료 (에이전트용, 2026-03-19)
- [ ] **DEV-03** ROI 리포트 자동 생성 모듈 (Hono 백엔드 연동 후)
- ✅ **DEV-04** @percept/ga4 실사용 테스트 완료 — K-사주 GA4 데이터 정상 조회 (2026-03-19)
- ✅ **DEV-05** @percept/vercel 실사용 테스트 완료 — K-사주 sajukorea 배포 데이터 정상 조회 (2026-03-19)
- ✅ **DEV-06** npm 퍼블리시 완료 (@perceptdot/ga4@0.1.0, @perceptdot/vercel@0.1.0, 2026-03-19)
- ✅ **DEV-07** @perceptdot/sentry MCP 서버 구현 + npm 퍼블리시 완료 (2026-03-20, 5 tools)
- ✅ **DEV-08** @perceptdot/github MCP 서버 구현 + npm 퍼블리시 완료 (2026-03-20, 5 tools)
- ✅ **DEV-09** Landing page Features 섹션 Sentry+GitHub 카드 추가 + Cloudflare Pages 재배포 (2026-03-20)
- ✅ **LEGAL-01** 쿠키 동의 배너 구현 완료 (landing/index.html, localStorage, 2026-03-20)
- ✅ **LEGAL-02** 이용약관 + 개인정보처리방침 페이지 생성 (terms.html, privacy.html, 2026-03-20)
- ✅ **LEGAL-03** 한국 SaaS 법적 요건 리서치 완료 (docs/outputs/legal_compliance_report.md, 2026-03-20)
- [ ] **LEGAL-04** 통신판매업 신고 — THUNOVA 722-60-00889로 정부24 신고 (Stripe 결정 후)
- ✅ **LEGAL-05** 결제 구조 확정: **Lemon Squeezy** (MoR, 2026-03-20 CEO 결정) — K-사주와 동일 계정 통합 관리
- ✅ **PAY-01** Lemon Squeezy 계정 생성 (2026-03-20, 인증 제출 완료, 승인 대기 중. 상품 등록은 승인 후 가능)
- ✅ **PROD-01** AI 최적화 설계 확정: 계정없음·로그인없음·대시보드없음·API키 N개 (2026-03-20)
- ✅ **PROD-02** Landing FAQ 섹션 추가 + 배포 완료 (10개 항목, 아코디언, 2026-03-20)
- ⏳ **PAY-02** Paddle 승인 대기 → 승인 시 K-사주 + perceptdot 동시 Gumroad→Paddle 전환 (2026-03-21 CEO 결정: 임시=Gumroad, 정식=Paddle) | 2026-03-22 CEO 결정: 무료 베타 오픈 → Paddle 승인 후 정식 유료 출시. Free Starter 200 calls, 정식 출시 시 100으로 축소
- ✅ **PAY-04** Lemon Squeezy Payout 설정 완료 (한국계좌 KRW, W-8BEN 제출, invoice info, 2026-03-20)
- ✅ **PAY-03** Gumroad 결제 브릿지 완료 (2026-03-21) — Pro $19/mo + Team $99/mo(10seats) 라이브, 랜딩 버튼 연결, No refunds 설정
- ✅ **PAY-05** Gumroad 웹훅 + API 키 자동발급 E2E 검증 완료 (2026-03-21) — KV 저장, Resend 이메일, 4개 MCP 서버 설정. Gumroad Ping URL 등록 + thunova0318 실수신 확인 (pd_live_xxx 키 포함)
- ✅ **DEV-10** 전역 MCP 연결 완료 (2026-03-21) — ~/.claude/.mcp.json 생성, ga4+vercel+github 3개 전역 로드
- ✅ **PAY-06** API 키 검증 + 무료/유료 차별화 완료 (2026-03-21) — /v1/validate 엔드포인트, KV 역인덱스, Free 10회 제한, 4개 MCP 서버 패치 퍼블리시 (ga4@0.2.1, vercel@0.1.2, github@0.1.1, sentry@0.1.1)
- [ ] **LEGAL-06** 통신판매업신고번호 발급 후 Footer 업데이트
- [ ] **GROWTH-03** MCP awesome-list 기여 계획
- ✅ **UX-01** 모바일 코드블록 최적화 — font-size 11px, -webkit-overflow-scrolling (그록 피드백, 2026-03-20)
- [ ] **DOCS-01** Gitbook 사용자 가이드 — Team 플랜 론칭 시 검토 (지금은 불필요)
- [ ] **UX-02** Contact form 추가 (Tally 폼 — mailto 대체)
- ✅ **UX-03** Output Preview 섹션 추가 완료 (2026-03-21) — percept_roi_summary + ga4_realtime + vercel_latest_status 실제 출력 예시, 터미널 UI 스타일
- ✅ **UX-04** 피드백 3점 미만 공개 비노출 필터 추가 (2026-03-21) — GET /v1/feedbacks에서 rating >= 3만 반환
- [ ] **BUG-01** Cloudflare Bot Fight Mode 완화 — 봇(Grok 등) 403 차단 문제
- ✅ **BUG-02** 멀티 프로젝트 지원 — Option B 적용 완료 (2026-03-21): `.mcp.json` 서버명을 `ga4-k-saju` / `ga4-perceptdot`으로 분리. perceptdot GA4 Property ID 확보 후 두 번째 인스턴스 추가 가능. 중기: Option A (Named Profiles, v0.2.0) 검토
- ✅ **BUG-03** ga4_realtime INVALID_ARGUMENT 버그 수정 (2회, 2026-03-21): `pagePath` → `unifiedPagePathScreen` → `deviceCategory`. K-사주 web-only 속성에서 unifiedPagePathScreen 미지원 확인. ga4@0.2.4 퍼블리시.
- ✅ **MKT-01** AI-First 전면 개편 완료 (2026-03-22) — 4개 MCP 서버 tool descriptions 영어 에이전트 설득형 재작성, getRoiSummary() counterfactual 비교 추가, makeFeedbackRequestMessage() "NOTE TO HUMAN" 포함, checkAndUse() "TELL YOUR HUMAN" 설치 설득, 에러 메시지 영어화
- ✅ **MKT-02** 마케팅 초안 5채널 작성 완료 (2026-03-22) — Reddit/HN/Twitter/ProductHunt/Discord, 위치: docs/outputs/marketing_drafts.md | v2 베타 반영 최신화 완료 (03-22)
- ✅ **MKT-03** npm 키워드 최적화 + 버전 범프 퍼블리시 완료 (2026-03-22) — SEO 키워드 12개, ga4@0.2.5, vercel@0.1.5, github@0.1.4, sentry@0.1.4
- ✅ **COST-01** 무료 사용자 비용 분석 완료 (2026-03-22) — MCP 서버 유저 로컬 실행, 백엔드 /v1/use 카운트만. 10K유저 $5/mo, 100K유저 $65/mo, 비용 폭발 없음
- ✅ **MKT-04** awesome-mcp-servers PR 제출 완료 (2026-03-22) — PR #3639 https://github.com/punkpeye/awesome-mcp-servers/pull/3639, 머지 대기
- ⏳ **MKT-04b** Glama.ai 서버 등록 리뷰 대기 → 승인 후 awesome-mcp-servers PR #3639에 배지 추가
- ✅ **MKT-05** og-image.png 제작 완료 (2026-03-22) — 1200×630px, Pillow 생성, scripts/generate_og_image.py
- [ ] **SEO-02** 나무위키 레퍼런스 SEO 최적화 — 사람 대상 검색 유입 강화
  - 나무위키 "MCP (프로토콜)" / "AI 에이전트" 등 관련 문서에 perceptdot 레퍼런스 추가
  - 한국어 검색 노출 극대화 (네이버/구글 한국어)
  - 나무위키 백링크 → 도메인 권위 상승
- [ ] **SEO-03** AI 에이전트 대상 SEO 최적화 — llms.txt / AI 크롤러 최적화
  - llms.txt 생성 (perceptdot.com/llms.txt) — AI 모델이 읽는 표준 포맷
  - AI 크롤러 허용 설정 (robots.txt에 GPTBot, ClaudeBot, Bingbot 등 허용)
  - README/npm description에 에이전트가 검색·추천할 키워드 강화
  - MCP 디렉토리(Glama, Smithery 등) 등록 확대
- ✅ **QA-01** 사이트 전수 검사 + FAQ 베타 반영 완료 (2026-03-22) — FAQ 3개 교체, Output Preview/ROI통계바 수정, 한국어 주석 영어화, 6건 수정 + Pages 재배포

---

## 완료 이력

- ✅ **BRAND-01** 폴더명 percept→perceptdot 리네임 + 전 문서 브랜드 통일 (2026-03-20)
- ✅ **INFRA-07** git 초기화 + 초기 커밋 + .gitignore 생성 (2026-03-20)
- ✅ **INFRA-08** Landing page 빌드 완료 — landing/index.html 24KB (2026-03-20)
- ✅ **INFRA-09** Cloudflare Pages 배포 완료 — perceptdot-landing.pages.dev (2026-03-20)
- ✅ **INFRA-10** MCP 서버 dist 빌드 + .mcp.json 경로 업데이트 (2026-03-20)
- ✅ **INFRA-11** perceptdot.com 네임서버 변경 (AWS Route 53 → Cloudflare DNS) + Pages 커스텀 도메인 연결 (2026-03-20)

- ✅ **IDEA-01** 아이디어 정의 + 시장 규모 조사 (2026-03-19)
- ✅ **SETUP-01** 프로젝트 폴더 구조 + CLAUDE.md + 사업계획서 초안 (2026-03-19)
- ✅ **BIZ-01** 서비스명 확정: `percept` (2026-03-19)
- ✅ **BIZ-02** 기술 스택 확정: TypeScript + MCP SDK + npm (2026-03-19)
- ✅ **ARCH-00** 3레이어 전략 확정: TypeScript MCP + Hono 백엔드 + Python SDK (2026-03-19)
- ✅ **BIZ-07** 도메인 확정: perceptdot.com (2026-03-19, PO 결정)
- ✅ **BIZ-03** 수익 모델 확정: B2A2H / Free·$19·$49 (2026-03-19)
- ✅ **BIZ-04** 타겟 에이전트 확정: MCP 클라이언트 전체 (2026-03-19)
- ✅ **BIZ-05** 핵심 차별점 확정: ROI 측정 + 자동 보고 (2026-03-19)
