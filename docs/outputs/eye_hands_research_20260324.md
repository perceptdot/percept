# @perceptdot/eye — "눈 + 손" 로드맵 리서치
> 생성: 2026-03-24 · Opus 에이전트 조사 취합 · 데스크탑 Claude

---

## 핵심 결론

> **"눈 + 손 = E2E 비주얼 유저 저니 감사"로 묶은 MCP 서버는 전 세계에 없다.**
> Anthropic·MS·Applitools가 각자 조각을 갖고 있지만 아무도 통합하지 않았다.

---

## 1. 현재 존재하는 것들

### "손" 도구들 (navigation 가능, 시각 판단 없음)

| 도구 | 무엇 | 시각 판단 | MCP? | 한계 |
|------|------|---------|------|------|
| Stagehand (Browserbase, $300M 기업가치) | AI 브라우저 자동화 SDK | ❌ | ❌ | 클릭/이동만, QA 리포트 없음 |
| Browser Use (YC W25, $17M) | Python AI 브라우저 라이브러리 | ❌ | ❌ | Python 전용, QA 없음 |
| Playwright MCP (MS, 97M+ 다운) | 브라우저 제어 MCP | ⚠️ vision 모드 있지만 판단 없음 | ✅ | 픽셀 diff만, 자연어 QA 없음 |
| BrowserMCP (browsermcp.io) | Chrome 확장 + MCP | ❌ | ✅ | 로컬만, CI/CD 불가 |

### "눈" 도구들 (시각 가능, navigation 없음)

| 도구 | 무엇 | Navigation | MCP? | 한계 |
|------|------|-----------|------|------|
| Applitools Eyes | 엔터프라이즈 비주얼 AI | ❌ (스크립트 필요) | ⚠️ Eyes MCP 있음 | 엔터프라이즈 전용, 비쌈 |
| mcp-browser-lens | 디자인 스펙 비교 MCP | ❌ | ✅ | CSS 수동 입력 필요 |
| Browser-Tools-MCP | 개발자 브라우저 관찰 | ❌ (사람 브라우저 감시) | ✅ | 자율 탐색 불가 |

### "눈 + 손" 둘 다 있다고 주장하는 것

| 도구 | 실제? | 한계 |
|------|------|------|
| TestSprite MCP ($8.1M) | 기능 QA + 일부 비주얼 | 범용(기능+API+비주얼), 비주얼 특화 아님. 크레딧 기반 |
| Browser-Tools-MCP | "eyes and hands" 마케팅 | 실제론 사람 브라우저 관찰만. 자율 탐색 불가 |
| Devin 2.2 | GUI 상호작용 가능 | 범용 AI 엔지니어. MCP 아님. $500/월 |

---

## 2. 진짜 갭 (아무도 안 한 것)

### 갭 1: 눈 + 손 통합 MCP 서버

```
현재:
  Applitools = 최고의 눈 (베이스라인 비교) + 손 없음
  Stagehand = 최고의 손 (자율 탐색) + 눈 없음

perceptdot/eye = 눈 + 손 통합
  visual_check(url) → AI가 페이지 보고 문제 설명
  user_flow(url, "로그인 후 대시보드까지") → 실제 유저처럼 탐색
  visual_journey(url, steps[]) → 탐색하면서 각 페이지 시각 감사
```

### 갭 2: 크로스 에이전트 지원

- Anthropic Computer Use → Claude 전용 잠금
- Playwright MCP → 브라우저 자동화만
- perceptdot → Claude Code, Cursor, Windsurf, Cline 모두 지원

### 갭 3: 세션 간 영속 베이스라인

- Playwright MCP: 세션마다 리셋
- Applitools: 영속 베이스라인 있지만 MCP 없음
- perceptdot + Cloudflare R2 → "지난 주와 비교해서 뭐가 달라졌나?"

### 갭 4: 구조화된 QA 여정 리포트

현재 아무도 이런 출력을 안 함:
```json
{
  "journey": "로그인 → 대시보드 → 결제",
  "total_issues": 5,
  "pages": [
    {
      "url": "/login",
      "issues": [{ "severity": "high", "description": "제출 버튼이 모바일에서 폼 밖으로 삐져나옴" }]
    }
  ]
}
```

### 갭 5: CI/CD 비주얼 저니 테스팅

- GitHub Action에서 "비주얼 여정 감사" 실행 → PR에 결과 코멘트
- 아무도 안 함

---

## 3. Anthropic·MS가 못하는 것 (우리가 지켜야 할 영역)

| 영역 | Anthropic | MS Playwright MCP | perceptdot 기회 |
|------|---------|----------------|--------------|
| 크로스 에이전트 | ❌ Claude 전용 | ⚠️ MCP 표준이지만 비주얼 QA 없음 | ✅ 모든 에이전트 지원 |
| 영속 베이스라인 | ❌ | ❌ | ✅ Cloudflare R2 |
| E2E 비주얼 여정 | ❌ | ❌ | ✅ visual_journey() |
| 구조화 QA 리포트 | ❌ | ❌ | ✅ JSON severity 리포트 |
| 디자인 시스템 컴플라이언스 | ❌ | ❌ | 🔜 Phase 5 목표 |
| CI/CD 비주얼 저니 | ❌ | ❌ | 🔜 GitHub Action |

**Anthropic 주목**: 2026.02 써드파티 Claude 접근 제한 발표 → 크로스 에이전트 수요 증가

---

## 4. 제품 로드맵 (눈 → 손 진화)

```
Phase 1 (현재): 눈
  visual_check(url) → 스크린샷 + AI 분석
  → MVP. 지금 바로 시작 가능

Phase 2 (다음): 영속 베이스라인
  visual_check(url) → "지난번과 3가지 달라짐"
  → Cloudflare R2에 베이스라인 저장
  → 이것만으로도 차별점

Phase 3: 기본 손
  click(description), fill(field, value), navigate(url)
  → Playwright 래핑 (Stagehand 수준 복잡도 없이)
  → 에이전트가 직접 탐색

Phase 4: 눈 + 손 = 진짜 차별점
  visual_journey(url, steps[])
  → 각 단계 탐색 + 각 페이지 비주얼 체크 + 전체 리포트
  → 이게 아무도 안 한 것

Phase 5: 모트 구축
  → CI/CD GitHub Action
  → Vercel Integration (배포 시 자동 실행)
  → 디자인 시스템 컴플라이언스 (Figma 토큰 vs 라이브 UI)
  → 시각 패턴 DB 축적 (장기 해자)
```

---

## 5. 경쟁 위험 재평가

| 위험 | 확률 | 우리 대응 |
|------|------|---------|
| Stagehand + Applitools 합작 | 낮음 (서로 다른 회사) | 속도전으로 선점 |
| Playwright MCP vision 강화 | 높음 (MS 리소스) | 베이스라인+저니+리포트로 차별화 |
| Anthropic 네이티브 비주얼 QA | 높음 | 크로스 에이전트 + CI/CD 포지셔닝 |
| TestSprite 비주얼 집중화 | 중간 | 더 가볍고 MCP 네이티브로 차별화 |

---

*생성: 2026-03-24 · Opus 에이전트 · 데스크탑 Claude*
