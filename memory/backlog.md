# percept — 백로그

> 업데이트: 2026-03-20

---

## CRITICAL (CEO 결정 블로킹)

- ✅ **BIZ-06** 첫 번째 통합 서비스 선정: GA4 + Vercel 병렬 (2026-03-19)
- ✅ **INFRA-01** 도메인 등록 완료 — perceptdot.com (2026-03-19)

---

## CRITICAL — 상용화 MVP 필수 (환경 미구비)

- [ ] **INFRA-03** GitHub repo 생성 + 공개 (`perceptdot/percept`) — 기록/노출 시작
- [ ] **INFRA-04** Cloudflare Workers 배포 (`api.perceptdot.com`) — ROI 측정 작동
- [ ] **INFRA-05** perceptdot.com 랜딩 페이지 + Stripe — landing/index.html ✅ 빌드 완료, 배포+Stripe 대기
- [ ] **INFRA-06** MCP 서버 Claude Code 실제 경유 확인 — 성과 측정 활성화

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
- [ ] **GROWTH-03** MCP awesome-list 기여 계획

---

## 완료 이력

- ✅ **BRAND-01** 폴더명 percept→perceptdot 리네임 + 전 문서 브랜드 통일 (2026-03-20)
- ✅ **INFRA-07** git 초기화 + 초기 커밋 + .gitignore 생성 (2026-03-20)
- ✅ **INFRA-08** Landing page 빌드 완료 — landing/index.html 24KB (2026-03-20)

- ✅ **IDEA-01** 아이디어 정의 + 시장 규모 조사 (2026-03-19)
- ✅ **SETUP-01** 프로젝트 폴더 구조 + CLAUDE.md + 사업계획서 초안 (2026-03-19)
- ✅ **BIZ-01** 서비스명 확정: `percept` (2026-03-19)
- ✅ **BIZ-02** 기술 스택 확정: TypeScript + MCP SDK + npm (2026-03-19)
- ✅ **ARCH-00** 3레이어 전략 확정: TypeScript MCP + Hono 백엔드 + Python SDK (2026-03-19)
- ✅ **BIZ-07** 도메인 확정: perceptdot.com (2026-03-19, PO 결정)
- ✅ **BIZ-03** 수익 모델 확정: B2A2H / Free·$19·$49 (2026-03-19)
- ✅ **BIZ-04** 타겟 에이전트 확정: MCP 클라이언트 전체 (2026-03-19)
- ✅ **BIZ-05** 핵심 차별점 확정: ROI 측정 + 자동 보고 (2026-03-19)
