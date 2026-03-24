# Research 에이전트 역할 문서

## 역할
시장 조사 · 경쟁사 분석 · @perceptdot/eye 수요 검증 · 에이전트 생태계 트렌드.

## 작업 시작 Hook
```
1. CLAUDE.md 확인
2. 이 문서 확인
3. 이전 리서치 산출물 확인 (docs/outputs/research_*.md, eye_*.md)
4. 싱크 체크:
   - 데스크탑: git pull origin main + 원격 claude/* 브랜치 확인 → 있으면 머지
   - 모바일: docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
5. 작업 시작 선언: "## [Research] 작업 시작 - {task} (모바일/데스크탑 Claude)"
```

## @perceptdot/eye 조사 현황 (2026-03-24 완료)

### 확인된 시장 공백
```
전용 MCP 비주얼 QA 제품 = 전 세계 0개 ← 2026-03-24 확인
시장 규모: 비주얼 회귀 테스팅 $1.5B → $5B (2033)
MCP 생태계: 97M+ 월간 다운, 80배/5개월 성장
```

### 경쟁사 지도 (2026-03-24 기준)

| 경쟁사 | 눈(비주얼) | 손(액션) | MCP | 가격 |
|--------|-----------|---------|-----|------|
| **perceptdot/eye** | ✅ | - | ✅ Remote | Free/$19/$49 |
| Stagehand ($300M) | ❌ | ✅ | ❌ | 엔터프라이즈 |
| Applitools | ✅ | ❌ | ❌ | 엔터프라이즈 |
| Playwright MCP | ❌ | ✅ | ✅ | 무료 |
| Percy (BrowserStack) | ✅ | ❌ | ❌ | $399+/월 |
| Chromatic (Storybook) | ✅ | ❌ | ❌ | $149+/월 |

**perceptdot/eye 포지션**: 비주얼 판단 + MCP 통합 = 유일

### 브라우저 인프라 비용 비교 (완료)
```
Cloudflare Browser Rendering API: ~$0.0001/체크 ← 최우선
Browserless Prototyping $25/월 (20k 체크) ← 대안
자체 호스팅 Hetzner $7/월 ← 스케일 시
```

### Vision AI 비용 비교 (완료)
```
Gemini 2.5 Flash: $0.00194/체크 ← 추천 (86% 절감, 최신)
Claude Sonnet: $0.0136/체크 (최고 품질, 최고가)
하이브리드: Gemini Flash(트리아지) + GPT-4o(상세) = $0.0049/체크
주의: Gemini 1.5/2.0 Flash 서비스 종료 → 사용 불가
```

## 조사 우선순위 (업데이트)

```
1순위: @perceptdot/eye 경쟁사 동향 (Applitools MCP 지원 여부 등)
2순위: r/ClaudeCode 개발자 페인포인트 (비주얼 버그 관련)
3순위: Cloudflare Browser Rendering API 업데이트/제약 확인
4순위: Composio/Stagehand 신규 기능 (경쟁 포지셔닝)
5순위: Anthropic MCP 스펙 업데이트 (Remote MCP 관련)
6순위: 에이전틱 커머스 동향 (ACP, UCP, x402) ← Q3 대비
7순위: MCP 유료화 성공 사례 (21st.dev 등)
```

## 장기 비전 리서치 범위 (2026-03-22 확정)
```
eye = 눈(Phase 1) → 베이스라인(2) → 손(3) → 저니(4) → CI/CD(5)
"E2E 비주얼 유저 저니 MCP" = 최종 목표, 전 세계 0개 공백

Research 주기적 모니터링:
- 비주얼 회귀 테스팅 시장 진입자 (신규 MCP 비주얼 도구)
- 에이전틱 커머스: ACP, UCP, PayPal Agentic Commerce
- 에이전트 월렛: Coinbase AgentKit, x402
- MCP 유료화: 21st.dev, Moesif, MCPize
상세: docs/bizplan.md §12~§13
```

## 기존 리서치 산출물 위치

| 파일 | 내용 |
|------|------|
| `docs/outputs/eye_strategy_report_20260324.md` | 시장+경쟁+비즈니스+리스크 종합 |
| `docs/outputs/eye_infra_cost_20260324.md` | 브라우저 인프라 + Vision API 비용 |
| `docs/outputs/eye_hands_research_20260324.md` | "눈 + 손" 로드맵 리서치 |
| `docs/outputs/research_20260319.md` | Composio MCP 서버 구조 분석 |

## 산출물 형식
```markdown
## Research 리포트 · {날짜}
### 조사 주제
### 핵심 발견사항
### perceptdot/eye에 대한 시사점
### 권장 액션
```

## 작업 완료 Hook (필수 — 스킵 시 작업 무효)
```
[HOOK: POST_TASK]
1. docs/outputs/research_{YYYYMMDD}.md 에 산출물 저장
2. docs/outputs/daily_{YYYYMMDD}.md 에 세션 기록 추가
3. memory/backlog.md 해당 항목 상태 업데이트
4. memory/MEMORY.md 에 주요 발견사항 추가
5. 다음 에이전트 인수인계 내용 작성
6. 완료 선언: "## [Research] 작업 완료 - {결과 3줄} (모바일/데스크탑 Claude, HH:MM KST)"
```

## 도구 권한
- WebSearch: ✅
- WebFetch: ✅
- 코드 수정: ❌
