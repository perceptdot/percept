# perceptdot 외부 반응 & 피드백 로그

> 최초 생성: 2026-03-24 | 갱신 시 날짜+출처 추가

---

## 채널별 반응 현황

### Reddit (2026-03-23)
- **r/ClaudeAI 포스트**: AutoModerator 제거 (Brand Affiliate) → 2차 시도 "account too new" 차단
- **r/ClaudeCode 댓글** "will MCP be dead soon?": context bloat 반론, 토큰 절감 사례 언급 — 반응 미확인
- **r/ClaudeAI 댓글** "MCP is NOT dead": discovery 문제 + 자동 추천 언급 — 반응 미확인
- **r/ClaudeAI 댓글** "What makes MCP's magically better": CLI vs MCP 구분 — 반응 미확인
- **결론**: 포스트 차단, 댓글 반응 데이터 없음. 신규 계정 한계 명확.

### Twitter/X (2026-03-22)
- 3개 스레드 수동 포스팅 완료
- 반응 데이터: 미확인 (수동 포스팅이라 추적 어려움)

### Moltbook (2026-03-22~23)
- 포스트 5개, 댓글 9개
- 최고 점수: 6pts (5댓글)
- **결론**: 에이전트 생태계 플랫폼이라 실제 유저 반응 아님. 의미 있는 피드백 없음.

### Dev.to (2026-03-23)
- 기술 블로그 게시: "How I built MCP servers that save 450 tokens per GA4 query"
- 반응 데이터: 미확인

### AlternativeTo (2026-03-23)
- 제출 완료. 승인 대기 24h. 반응 없음.

### awesome-mcp-servers PR #3639 (2026-03-22~23)
- Glama 배지 추가, 이모지 수정
- 머지 대기 중. PR 반응 없음.

### Glama.ai (2026-03-22~23)
- 제출 → 즉시 승인. LICENSE 이슈(MIT 추가로 해결). Claim 진행 중.

---

## AI 분석 피드백

### Gemini 사업성 분석 (2026-03-23)
- **⚠️ 제품 오인**: "정성 데이터 분석 자동화 솔루션"으로 분석 (실제와 다름)
- 유효 지적:
  1. "ChatGPT랑 뭐가 달라?" 질문에 명확한 답 필요
  2. 기술적 해자 약함 — 데이터 축적이 장기 moat
  3. Churn 방지 = 워크플로우 내재화 필요
- **함의**: 랜딩/포지셔닝이 외부인(AI 포함)에게 충분히 명확하지 않음
- 상세: `gemini_analysis_20260323.md`

---

## 실사용 데이터 (가장 정직한 피드백)

### GA4 (2026-03-17~23, 7일)
| 지표 | 값 | 해석 |
|------|-----|------|
| 방문 유저 | 61명 | 마케팅 시작 효과 있음 |
| 평균 체류 | 166초 | 랜딩 읽긴 함 |
| 이탈률 | 0.9% | 매우 낮음 (SPA 특성도 있음) |
| 무료 키 신청 | **0건** | ⚠️ 전환 완전 실패 |
| 결제 | **0건** | ⚠️ |

### npm 다운로드 (추정)
- 퍼블리시 이후 다운로드 수 미집계 (npmjs.com 직접 확인 필요)

### API 사용
- KV API_KEYS: 내부/테스트 키 5개만 (외부 실사용 0)

---

## 커뮤니티 분위기 (간접 관찰)

### MCP 생태계 전반
- "will MCP be dead soon?" 같은 회의론 존재
- MCP 서버 11,000+개 — 발견/선택 문제 실재
- Claude Code 사용자들은 대체로 자체 MCP 설정에 익숙

### 경쟁 환경
- GA4/Vercel/Sentry 공식 MCP 서버 무료로 존재
- Composio 500+ 앱 무료 연결
- perceptdot의 ROI 측정 차별점이 충분히 전달되지 않음

---

## 업데이트 이력
- 2026-03-24: 최초 생성 (데스크탑 Claude)
