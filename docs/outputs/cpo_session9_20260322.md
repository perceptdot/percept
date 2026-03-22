# CPO 종합 전략 보고서 — 세션 9

> 2026-03-22 · 모바일 Claude · CEO 요청 종합 분석
> 상태: 80% 완료 (시장조사 완료, 보고서 작성 완료, daily 미갱신)

---

## 1. CEO 결의 기록

**"이 사업을 반드시 성공해야 한다"** — 2026-03-22 CEO 선언
→ MEMORY.md 기록 완료

---

## 2. 기존 마케팅 진행상황 + 대처방안

### 현황 (심각)

| 채널 | 상태 | 비고 |
|---|---|---|
| awesome-mcp-servers PR #3639 | Open, `missing-glama` | Glama 등록 승인 필요 |
| Glama.ai 서버 등록 | 리뷰 대기 | 기다리는 중 |
| 1단계 디렉토리 6곳 | **전부 미등록** | DevHunt/BetaList/TAAFT/AlternativeTo/LaunchingNext/Microlaunch |
| Twitter/Reddit/HN | 초안 ready, **미포스팅** | X API 앱 생성완료, .env 미설정 |
| Product Hunt | 준비 미완 | 스크린샷/Maker 프로필 없음 |

**핵심 문제: 코드 95점, 마케팅 실행 0점, 유저 0명**

### 대처방안

1. **즉시** — 1단계 디렉토리 6곳 등록 (피벗과 무관, 현재 메시지로 충분, CEO 수동 10분/개)
2. **피벗 승인 즉시** — 마케팅 메시지 업데이트 → Twitter/Reddit 순차 포스팅
3. **Glama** — 승인 안 되면 다른 awesome-list에도 직접 PR
4. **현재 제품으로 마케팅 시작 + 동시에 core 개발** (완벽한 피벗 후 마케팅 X)

---

## 3. 피벗 시장조사 + 경쟁사 분석

### 경쟁사 전수 조사

| 서비스 | 뭐 하는 곳 | 프로젝트분석 추천? | ROI 측정? | 위협도 |
|---|---|---|---|---|
| **MCP Registry** (공식, Linux Foundation) | 서버 메타데이터 저장소, DNS 역할 | ❌ 검색 API만 | ❌ | 낮음 |
| **Smithery** (7,300+ 서버) | MCP 디렉토리+호스팅+CLI | ❌ 검색+카테고리 | ❌ | **중** |
| **PulseMCP** (뉴스레터+서버) | MCP 디렉토리+pulsemcp-server | ⚠️ 서버 검색 tool 있음 | ❌ | **중** |
| **mcp.run** (Turbo MCP) | Wasm 기반 MCP 호스팅+프로필 번들 | ⚠️ 동적 발견 지원 | ❌ | **중** |
| **Composio** ($29M 시리즈A) | 3,000+ 앱 연결 허브 | ❌ | ❌ | 중 |
| **Glama** | MCP 디렉토리+스코어링 | ❌ | ❌ | 낮음 |
| **MCP Market** | MCP 디렉토리 | ❌ | ❌ | 낮음 |
| **MCPize** | MCP 유료화 플랫폼 | ❌ | ❌ | 낮음 |
| **Obot AI** | MCP Discovery 카탈로그 | ⚠️ 검색+연결 | ❌ | **중** |
| **AgentOps/LangSmith/Helicone** | LLM 옵저버빌리티 | ❌ | ⚠️ 비용 추적만 | 낮음 |

### 핵심 발견

1. **"프로젝트 분석 → 자동 추천 + ROI 측정" 조합 = 경쟁자 0**
2. PulseMCP `pulsemcp-server`가 가장 가까운 경쟁자 (서버 검색 tool) — 하지만 프로젝트 분석/ROI 없음
3. mcp.run의 동적 발견은 Wasm 서블릿 한정 — 일반 MCP 서버 추천 안 함
4. MCP Steering Committee가 "Agentic MCP Configuration" 표준화 진행 중 — 장기적으로 이 표준에 맞춰야 함
5. MCP Registry는 의도적으로 "최소한의 인프라"만 제공 → 검색/추천/UI는 서드파티 몫 = perceptdot 영역

### 시장 규모 (업데이트)

- MCP 서버: 11,000+개 (Smithery 7,300+, Registry 수백개)
- MCP 클라이언트: 542개 (PulseMCP 집계)
- MCP SDK 다운로드: 월 9,700만+
- MCP 유료화: 5% 미만 → 거대 공백
- 공식 제공사 서버: 700+개 (사이드 프로젝트 아닌 공식 서버)

---

## 4. 강점 / 차별점 / 킬링포인트

### 강점 3가지
1. **이미 작동하는 MCP 서버 4개** — talk 아닌 ship 상태
2. **ROI 측정 엔진** — trackCall/getRoiSummary 모든 서버 내장
3. **B2A2H 플로우** — 에이전트가 설득, 사람은 결제만

### 차별점 비교표

| | perceptdot | Smithery | PulseMCP | mcp.run |
|---|---|---|---|---|
| 프로젝트 분석 추천 | ✅ percept_discover | ❌ | ❌ | ❌ |
| ROI 측정 | ✅ 모든 콜 | ❌ | ❌ | ❌ |
| 에이전트 자가 추천 | ✅ B2A2H | ❌ | ❌ | ❌ |
| 실제 데이터 조회 | ✅ GA4/Vercel/Sentry/GitHub | ❌ | ❌ | ⚠️ 호스팅만 |

### 킬링포인트

> **"percept는 에이전트한테 눈을 주고, 그 눈이 얼마나 가치 있는지 스스로 증명한다."**
> 다른 곳은 "서버 목록"만 보여주고, perceptdot은 "네 프로젝트에 이게 필요하고, 쓰면 이만큼 아낀다"까지 간다.

---

## 5. 제품 품질 보증 + 플랫폼 관리 계획

### 품질 보증

| 영역 | 현재 | 계획 |
|---|---|---|
| MCP 서버 테스트 | 수동 (K-사주 실사용) | CI 자동 테스트 |
| API 안정성 | Cloudflare Workers 99.9% | /v1/health 헬스체크 추가 |
| npm 버전 관리 | 수동 범프 | semver + CHANGELOG.md |
| 에러 모니터링 | 없음 | dogfooding (@perceptdot/sentry) |
| 코드 리뷰 | 없음 | QA 에이전트 + 릴리즈 체크리스트 |

### 플랫폼 관리

| 영역 | 계획 |
|---|---|
| KV 데이터 | 주 1회 export 백업 |
| API 남용 방지 | rate limit (free: 10/분, pro: 100/분) |
| 큐레이션 DB | 초기 50개 수동 → 월 1회 업데이트 |
| Registry 장애 | 큐레이션 fallback (오프라인 작동) |
| npm 보안 | npm audit CI + 의존성 최소화 |
| 유저 피드백 | /v1/feedback → 주 1회 분석 → backlog 반영 |

### 릴리즈 게이트 체크리스트

```
□ 모든 tool 호출 테스트 통과
□ checkAndUse() 정상 (free/pro 분기)
□ ROI summary 정확도 ±10%
□ npm audit 0 vulnerabilities
□ README 업데이트
□ 기존 서버 regression 없음
```

---

## 6. CPO 최종 권고

**생각은 충분합니다. 실행이 0인 게 위험합니다.**

즉시 실행 3가지:
1. **오늘**: 1단계 디렉토리 6곳 등록 (CEO 수동)
2. **피벗 승인 즉시**: 현재 버전으로 Twitter/Reddit 포스팅 시작
3. **이번 주**: @perceptdot/core Phase 1 개발

**"완벽한 피벗 후 마케팅"이 아니라 "현재 제품으로 마케팅 + 동시에 피벗 개발"**

---

## 7. 미완료 항목 (데스크탑 인수인계)

- [ ] daily_20260322.md 세션 9 섹션 추가
- [ ] backlog.md에 QA 체크리스트/품질관리 태스크 추가
- [ ] 마케팅 초안 피벗 반영 업데이트 (피벗 승인 시)
- [ ] cpo_20260322.md에 §11 (이 보고서 내용) 병합

---

## 출처

- [MCP Registry 공식](https://registry.modelcontextprotocol.io/)
- [PulseMCP Agentic MCP Configuration](https://www.pulsemcp.com/posts/agentic-mcp-configuration)
- [Smithery AI](https://smithery.ai/)
- [mcp.run](https://www.mcp.run/)
- [Obot AI MCP Discovery](https://obot.ai/resources/learning-center/mcp-tool-discovery/)
- [MCP Registry 진화 제안 (Medium)](https://medium.com/@aiforhuman/beyond-service-discovery-54040e716327)
- [MCP Market](https://mcpmarket.com/)
