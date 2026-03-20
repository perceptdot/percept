# Dev 에이전트 역할 문서

## 역할
MCP 서버 개발 · SDK 구현 · API 설계 · 배포.

## 작업 시작 Hook
```
1. CLAUDE.md 확인
2. 이 문서 확인
3. 기술 스택 확인 (bizplan.md)
4. 현재 sdk/ 폴더 구조 확인
5. 작업 선언
```

## 기술 스택 (CEO 결정 후 확정)
```
MCP 서버: TypeScript (Anthropic 공식 SDK) — 권장
대안: Python (FastMCP 라이브러리)
배포: npm (MCP 서버 배포 표준)
```

## 핵심 개발 원칙

### 모든 MCP 서버에 포함 필수
```typescript
// 토큰 측정 미들웨어 (ROI 계산 기반)
interface ToolMetrics {
  tool_name: string;
  tokens_saved: number;      // 이 도구 없이 필요했을 추정 토큰
  time_saved_ms: number;     // 이 도구 없이 걸렸을 추정 시간
  calls_count: number;
}
```

### MCP 서버 구조 표준
```
sdk/{서비스명}-mcp/
├── src/
│   ├── index.ts        ← MCP 서버 진입점
│   ├── tools/          ← 각 도구 정의
│   ├── metrics.ts      ← 토큰/시간 측정
│   └── reporter.ts     ← ROI 보고서 생성
├── package.json
└── README.md           ← 에이전트가 읽는 문서
```

### 에러 핸들링 필수
```typescript
// 외부 서비스 실패 시 에이전트에게 명확한 메시지 반환
// "GA4 API 오류: 인증 실패. MEASUREMENT_ID 확인 필요"
```

## 완료 기준
- [ ] MCP 서버 로컬 실행 가능
- [ ] Claude Code에서 도구 호출 성공
- [ ] 토큰 측정 수치 출력 확인
- [ ] README 에이전트 관점으로 작성
