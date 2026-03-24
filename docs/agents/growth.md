# Growth 에이전트 역할 문서

## 역할
에이전트 생태계 진입 전략 · 얼리어답터 확보 · 커뮤니티 빌딩 · @perceptdot/eye 수요 검증.

## 작업 시작 Hook
```
1. CLAUDE.md 확인
2. 이 문서 확인
3. 현재 Phase 확인 (memory/backlog.md)
4. 싱크 체크:
   - 데스크탑: git pull origin main + 원격 claude/* 브랜치 확인 → 있으면 머지
   - 모바일: docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
5. 작업 시작 선언: "## [Growth] 작업 시작 - {task} (모바일/데스크탑 Claude)"
```

## 현재 마케팅 현황 (2026-03-24 기준)

### 완료
- ✅ Twitter/X 스레드 3개 포스팅 (2026-03-22)
- ✅ awesome-mcp-servers PR #3639 머지 + Glama 배지 (2026-03-23)
- ✅ Reddit 댓글 3개 (r/ClaudeCode 1 + r/ClaudeAI 2, 2026-03-23)
- ✅ Moltbook Verified 배지 + 포스트 5개 + 댓글 9개 (2026-03-23)
- ✅ AlternativeTo 등록 완료 (승인 대기, 2026-03-23)
- ✅ Dev.to 블로그 게시 (2026-03-23)
- ✅ Lemon Squeezy KYC 제출 완료 (승인 대기)

### 진행 중 / 대기
- [ ] 디렉토리 제출: BetaList, Launching Next, Microlaunch, mcpservers.org, PulseMCP
- [ ] Product Hunt 런칭 (스크린샷 5장 + 데모 영상 완성 후)
- [ ] HN Show HN (화/수 US 오전)

## @perceptdot/eye GTM 전략 (2026-03-24 피벗 후)

### EYE-02 — r/ClaudeCode 수요 설문 (최우선)
```
포스트 제목: "Does your AI agent catch visual bugs? 👁️"
내용: "에이전트가 박스 삐져나온 버그 못 잡아서 답답했던 경험 있으신가요?
     비주얼 QA MCP 서버 만들고 있는데, 사용하실 의향이 있다면?
     [투표: Yes, 무조건 / Yes, 가격 맞으면 / 별로 / 에이전트 안 씀]"
목표: 50명 이상 응답
계정 이슈: 신규 계정 포스트 차단 → 댓글 방식 또는 카르마 확보 후 포스트
```

### eye 핵심 GTM 메시지
```
타겟: Claude Code를 일평균 2시간+ 쓰는 개발자/팀
페인포인트: "배포했는데 UI 버그 → 인간이 직접 눈으로 확인 → 비효율"
솔루션: "visual_check() 한 줄 → 에이전트가 버그 텍스트로 보고"
가격: Free 50체크 / Pro $19 / Team $49
차별점: "전용 MCP 비주얼 QA — 전 세계 최초"
```

### 채널 우선순위 (eye 출시 후)
```
1. r/ClaudeCode — EYE-02 수요 설문 + Show & Tell (가장 핵심)
2. Anthropic Discord #tools — MCP 유저 직접 접근
3. Hacker News Show HN — 개발자 커뮤니티 바이럴
4. Product Hunt — 3단계 올인
5. Moltbook — 지속 포스팅 (Rate limit: 1 post/30min)
```

## 기존 perceptdot (로컬 MCP 서버) 마케팅

### Go-to-Market 메시지
```
핵심: "AI 에이전트에게 눈을 달아줍니다"
수치: "체크당 $0.002, 평균 토큰 450개 절감"
차별점: "ROI를 수치로 증명하는 유일한 MCP 플랫폼"
```

## 플랫폼 제출 현황

| 플랫폼 | 상태 | 비고 |
|--------|------|------|
| awesome-mcp-servers | ✅ 머지 + Glama 배지 | |
| AlternativeTo | ✅ 제출 (승인 대기) | |
| Smithery | ✅ 등록 | |
| Dev.to | ✅ 게시 완료 | |
| BetaList | 📋 미제출 | 무료, 심사 4개월 |
| mcpservers.org | 📋 미제출 | 무료 |
| PulseMCP | 📋 미제출 | 무료 |
| Product Hunt | ⏸️ 대기 | 데모 영상 완성 후 |
| HN Show HN | ⏸️ 대기 | eye 완성 후 |

## 장기 비전 인지 (2026-03-22 확정)
```
현재: Claude Code / Cursor 개발자 (MCP 서버 유저 확보)
Q2: MCP 서버 운영자 (빌링 white-label)
Q3: SaaS 회사 (에이전트 광고/결제 인프라)

"B2A2H" = perceptdot이 정의하는 신규 카테고리.
카테고리 크리에이터 포지셔닝 마케팅 필요.
상세: docs/bizplan.md §12
```

## 작업 완료 Hook (필수 — 스킵 시 작업 무효)
```
[HOOK: POST_TASK]
1. docs/outputs/growth_{YYYYMMDD}.md 에 산출물 저장
2. docs/outputs/daily_{YYYYMMDD}.md 에 세션 기록 추가
3. memory/backlog.md 해당 항목 상태 업데이트
4. memory/MEMORY.md 에 주요 성과/수치 추가
5. 다음 에이전트 인수인계 내용 작성
6. 완료 선언: "## [Growth] 작업 완료 - {결과 3줄} (모바일/데스크탑 Claude, HH:MM KST)"
```

## 도구 권한
- 파일 읽기/쓰기: ✅ (docs만)
- WebSearch/WebFetch: ✅
- 코드 수정: ❌
