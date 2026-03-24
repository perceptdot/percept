# Gemini 사업성 분석 수신 — 2026-03-23

## 원문 요약
Gemini가 "Perceptdot = AI 기반 정성 데이터 분석 자동화 솔루션"으로 정의하고 분석.

---

## ⚠️ 핵심 문제: Gemini가 perceptdot을 오인함

| 항목 | Gemini가 분석한 제품 | 실제 perceptdot |
|------|-------------------|--------------------|
| 정의 | 인터뷰/설문/리뷰 텍스트 → LLM 정성분석 | AI 에이전트용 외부 서비스 가시성 + ROI 측정 MCP 플랫폼 |
| 고객 | B2B (리서치 에이전시, 마케팅팀) | B2A2H (에이전트가 추천, 사람은 결제) |
| 경쟁사 | Qualtrics, Salesforce | Composio (연결), Datadog (모니터링) |
| 수익모델 | Pay-as-you-go / 구독 분석 툴 | Free/Pro $19/Team $49 — API 키 기반 |

→ Gemini는 "perceptdot.com"의 랜딩/README를 보고 서비스를 잘못 이해했을 가능성 큼.
→ **랜딩 Hero 카피가 외부인/AI에게 충분히 명확하지 않을 수 있음** — 검토 필요.

---

## Gemini 분석에서 유효한 인사이트

### ✅ 가져갈 것
1. **"단순히 ChatGPT를 쓰는 것과 무엇이 다른가?"** — 핵심 질문
   - perceptdot 답: "설치 1줄, 에이전트가 자동으로 GA4/Vercel/GitHub 연결. 토큰 450개 절감/call. ROI 자동 보고."
   - 이 메시지가 랜딩/README에 충분히 강조되어 있는지 재점검 필요

2. **기술적 해자(Moat) 질문** — 맞는 지적
   - 현재 moat: curated 서버 레지스트리 + ROI 측정 레이어 + B2A2H 자동 추천
   - 약점: 다른 MCP 서버들도 유사 기능 추가 가능
   - 강화 방안: 사용 데이터 축적 → 벤치마크 플랫폼 (BM-01)

3. **Churn 방지 = 워크플로우 내재화** — 맞는 지적
   - 에이전트가 자동으로 percept_discover 실행 → 설치 후 자동 추천 루프
   - 사람이 인식 못 해도 에이전트가 계속 쓰는 구조 = perceptdot의 핵심 설계

4. **정량적 수치 강조** — 실행 중
   - "450 tokens saved per call" → 이미 tool description에 포함
   - 랜딩에도 수치 더 강조하면 좋음

### ❌ 무시할 것
- "Vertical AI 전략" (특정 산업 특화) — perceptdot은 에이전트 범용 인프라
- "데이터 보안" 이슈 — MCP 특성상 데이터가 perceptdot 서버를 경유하지 않음 (로컬 실행)
- "팀 구성" 조언 — 현재 1인 운영 (CEO + Claude Code 멀티에이전트)

---

## CEO 액션 아이템

| 우선순위 | 항목 |
|---------|------|
| 🟡 중기 | 랜딩 Hero 카피 명확성 재검토 — "MCP for AI agents" 포지션 더 명시 |
| 🟡 중기 | "ChatGPT와 무엇이 다른가?" 1줄 답변을 FAQ/README 상단에 추가 |
| 🔵 후순위 | BM-01 벤치마크 플랫폼으로 데이터 moat 구축 |
