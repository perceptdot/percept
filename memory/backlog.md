# percept — 백로그

> 업데이트: 2026-03-20

---

## CRITICAL (CEO 결정 블로킹)

- ✅ **BIZ-06** 첫 번째 통합 서비스 선정: GA4 + Vercel 병렬 (2026-03-19)
- ✅ **INFRA-01** 도메인 등록 완료 — perceptdot.com (2026-03-19)

---

## CRITICAL — 상용화 MVP 필수

- ✅ **INFRA-03** GitHub repo 공개 완료 — github.com/perceptdot/percept (2026-03-20)
- ✅ **INFRA-04** Cloudflare Workers 배포 완료 — perceptdot-api.perceptdot.workers.dev (2026-03-20)
- [ ] **INFRA-05** 커스텀 도메인 연결 + Stripe — perceptdot.com → Cloudflare Pages/Workers + 결제
- ✅ **INFRA-06** MCP 서버 빌드 + .mcp.json 경로 업데이트 완료 (2026-03-20)

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
- [ ] **GROWTH-01** B2A2H 세일즈 플로우 설계 (에이전트 → 결제 링크 보고 UX)
- [ ] **GROWTH-02** Moltbook 전략 실행 — 에이전트 피드백 수집 + 홍보 채널 활용
  - Moltbook에 percept 포스팅 (에이전트 생태계 자연 노출)
  - percept 에이전트가 Moltbook에서 피드백 수집
  - moltbook-skill / moltbook-mcp-server 연동 검토
  - ※ 인간 얼리어답터 → AI 에이전트로 방향 전환 (2026-03-20 CEO 결정)

---

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
- [ ] **PAY-01** Lemon Squeezy 계정 생성 + Free/Pro $19/Team $49 상품 등록
- [ ] **PAY-02** Landing Pricing 섹션 Lemon Squeezy 체크아웃 버튼 연동
- [ ] **LEGAL-06** 통신판매업신고번호 발급 후 Footer 업데이트
- [ ] **GROWTH-03** MCP awesome-list 기여 계획

---

## 완료 이력

- ✅ **BRAND-01** 폴더명 percept→perceptdot 리네임 + 전 문서 브랜드 통일 (2026-03-20)
- ✅ **INFRA-07** git 초기화 + 초기 커밋 + .gitignore 생성 (2026-03-20)
- ✅ **INFRA-08** Landing page 빌드 완료 — landing/index.html 24KB (2026-03-20)
- ✅ **INFRA-09** Cloudflare Pages 배포 완료 — perceptdot-landing.pages.dev (2026-03-20)
- ✅ **INFRA-10** MCP 서버 dist 빌드 + .mcp.json 경로 업데이트 (2026-03-20)

- ✅ **IDEA-01** 아이디어 정의 + 시장 규모 조사 (2026-03-19)
- ✅ **SETUP-01** 프로젝트 폴더 구조 + CLAUDE.md + 사업계획서 초안 (2026-03-19)
- ✅ **BIZ-01** 서비스명 확정: `percept` (2026-03-19)
- ✅ **BIZ-02** 기술 스택 확정: TypeScript + MCP SDK + npm (2026-03-19)
- ✅ **ARCH-00** 3레이어 전략 확정: TypeScript MCP + Hono 백엔드 + Python SDK (2026-03-19)
- ✅ **BIZ-07** 도메인 확정: perceptdot.com (2026-03-19, PO 결정)
- ✅ **BIZ-03** 수익 모델 확정: B2A2H / Free·$19·$49 (2026-03-19)
- ✅ **BIZ-04** 타겟 에이전트 확정: MCP 클라이언트 전체 (2026-03-19)
- ✅ **BIZ-05** 핵심 차별점 확정: ROI 측정 + 자동 보고 (2026-03-19)
