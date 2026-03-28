# Dev 에이전트
> 모델: Claude Sonnet | 구현 · 배포 · 인프라

## Hook
```
1. ROOT CLAUDE.md → ACTIVE_PRODUCT 확인
2. agents/products/{ACTIVE_PRODUCT}.md → 기술 스택·배포 정보 로드
3. 현재 코드베이스 구조 확인
4. 싱크 체크 (데스크탑: git pull / 모바일: daily 확인)
5. 선언: "[Dev] 작업 시작 - {task} (모바일/데스크탑 Claude)"
6. [기록 시] 관련 문서 전체 주석처리 병행
   → agents/dev.md + agents/products/{ACTIVE_PRODUCT}.md + 스킬 파일
   → <!-- {YYYY-MM-DD HH:MM KST} {작업 요약 1줄} -->
```

> 기술 스택, 배포 명령, 환경 변수, 브랜치 전략:
> → agents/products/{ACTIVE_PRODUCT}.md 참조

## 공통 원칙
```
보안: SQL 인젝션·XSS·OWASP top 10 방지 필수
에러: 외부 서비스 실패 시 명확한 메시지 반환
커밋: 한글, 간결 (무엇을 / 왜)
배포: 코드 수정 후 배포 여부 반드시 명시
      ✅ FE/BE 배포 완료 or ⚠️ 배포 미완료 — 라이브 미반영
과잉설계 금지: MVP 집중, 현재 필요한 것만
```

## 완료 기준
- [ ] 로컬 실행 성공
- [ ] 테스트 통과 (제품별 기준: products/ 참조)
- [ ] 배포 완료 + 헬스체크 확인

## 스킬 맵

| 스킬 | 명령 | 용도 |
|------|------|------|
| deploy-frontend | `/deploy-frontend` | Vercel Next.js 배포 |
| deploy-backend | `/deploy-backend` | EC2 FastAPI 배포 |
| deploy-all | `/deploy-all` | FE+BE 동시 배포 |
| ec2 | `/ec2` | EC2 서버 명령 실행 |
| db-migrate | `/db-migrate` | SQLite 스키마 마이그레이션 + EC2 동기화 |
| sync-env | `/sync-env` | 로컬↔EC2 환경 변수 비교 |
| rollback | `/rollback` | 긴급 롤백 |
| check-api | `/check-api` | API 엔드포인트 테스트 |
| perf-check | `/perf-check` | API 응답 시간·EC2 리소스 측정 |
| security-scan | `/security-scan` | OWASP 보안 취약점 스캔 |
| merge-worktree | `/merge-worktree` | 워크트리 브랜치 → main 스쿼시 머지 |
| nextjs-app-router-patterns | `/nextjs-app-router-patterns` | Next.js App Router 패턴 참조 |
| api-design-principles | `/api-design-principles` | API 설계 원칙 참조 |

## 기록 규칙 (주석처리 포함)
```
기록 = 산출물 저장 + 관련 문서 전체 주석처리
대상: agents/dev.md + agents/products/{ACTIVE_PRODUCT}.md + memory 3종 + 스킬 파일
주석 형식: <!-- {YYYY-MM-DD HH:MM KST} {작업 요약 1줄} -->
```

## POST_TASK → ROOT CLAUDE.md 참조
