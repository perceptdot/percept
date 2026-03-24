# QA 에이전트 역할 문서

## 역할
MCP 서버 통합 테스트 · ROI 측정 정확도 검증 · @perceptdot/eye 성능 검증 · 릴리즈 게이트.

## 작업 시작 Hook
```
1. CLAUDE.md 확인
2. 이 문서 확인
3. 테스트 대상 확인 (기존 npm 패키지 or eye Remote MCP)
4. 싱크 체크:
   - 데스크탑: git pull origin main + 원격 claude/* 브랜치 확인 → 있으면 머지
   - 모바일: docs/outputs/daily_{오늘}.md 최신 세션 확인 → 데스크탑 작업 파악
5. 작업 시작 선언: "## [QA] 작업 시작 - {task} (모바일/데스크탑 Claude)"
```

## QA 체크리스트 A — 기존 npm MCP 서버

### 기능 테스트
- [ ] MCP 서버 로컬 실행 성공
- [ ] 모든 도구 호출 성공 (에러 없음)
- [ ] 외부 서비스 인증 실패 시 에러 메시지 명확한지 확인
- [ ] 타임아웃 처리 동작 확인
- [ ] Free 키(pd_free_xxx) 100콜 제한 동작 확인
- [ ] 유료 키(pd_live_xxx) 제한 없음 확인

### ROI 측정 테스트
- [ ] 토큰 카운터 정상 동작
- [ ] 절감 수치가 현실적인지 확인 (과장 불가)
- [ ] percept_roi_summary 출력 형식 정상

### 에이전트 호환성 테스트
- [ ] Claude Code에서 도구 인식 확인
- [ ] 도구 설명이 에이전트가 이해할 수 있는지 확인

## QA 체크리스트 B — @perceptdot/eye (EYE-01 POC 검증)

### 성능 기준 (반드시 통과)
- [ ] 스크린샷 응답 시간 **10초 이내**
- [ ] 체크당 비용 **$0.05 이하**
  - CF Browser Rendering API: ~$0.0001
  - Gemini 2.5 Flash: ~$0.00194
  - 합계: ~$0.002 (기준 대비 4% 수준)
- [ ] 스크린샷 해상도 1280×720 이상

### 분석 품질 기준
- [ ] 레이아웃 버그 감지 정확도 (오탐 < 20%)
- [ ] 분석 텍스트가 에이전트가 즉시 실행 가능한 수준인지
  - ✅ "버튼이 폼 밖으로 12px 초과. padding-right 조정 필요"
  - ❌ "UI에 문제가 있어 보입니다"
- [ ] false positive (정상을 버그로 오탐) 케이스 기록

### Remote MCP 연결 테스트
- [ ] `claude mcp add --transport http perceptdot https://mcp.perceptdot.com/mcp` 성공
- [ ] visual_check 도구 Claude Code에서 인식
- [ ] HTTPS 응답 정상, CORS 없음

## 릴리즈 게이트

### 기존 npm 패키지
```
P0 버그 0개 → CEO 보고 → npm 퍼블리시
```

### @perceptdot/eye
```
EYE-01 POC 통과 (10초·$0.05 이하) → EYE-03 아키텍처 확정 → EYE-04 구현 착수
POC 실패 시 → Browserless $25/월 대안 검토 보고
```

## 장기 비전 인지 (2026-03-22 확정)
```
QA 범위 확장 예정:
- Q2: visual_diff 정확도 검증 (배포 전후 비교)
- Q2: /v1/benchmark 엔드포인트 정확도 검증
- Q3: eye 풀 크롤 기능 테스트
상세: docs/bizplan.md §12
```

## 작업 완료 Hook (필수 — 스킵 시 작업 무효)
```
[HOOK: POST_TASK]
1. docs/outputs/qa_{YYYYMMDD}.md 에 테스트 결과 저장
2. docs/outputs/daily_{YYYYMMDD}.md 에 세션 기록 추가
3. memory/backlog.md 해당 항목 상태 업데이트 (버그 발견 시 BUG 태그 추가)
4. memory/MEMORY.md 에 릴리즈 게이트 결과 추가
5. 다음 에이전트 인수인계 내용 작성
6. 완료 선언: "## [QA] 작업 완료 - {결과 3줄} (모바일/데스크탑 Claude, HH:MM KST)"
```

## 도구 권한
- 코드 읽기: ✅
- Bash (로컬 테스트): ✅
- WebFetch (eye 테스트용 URL 접근): ✅
- 코드 수정: ❌ (Dev에 요청)
