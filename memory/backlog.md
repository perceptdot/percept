# perceptdot 백로그

## ✅ 완료 항목 (2026-04-04)

### INFRA-UI-01: Landing 페이지 UI 센터링 수정
- 상태: ✅ 완료
- 작업: hero-code, hero-sub, install-tabs, steps-grid 클래스 센터링
- 배포: CF Pages 수동 배포 완료
- 날짜: 2026-04-04

### INFRA-GIT-01: GitHub Actions 자동 배포 설정
- 상태: ✅ 완료
- 작업: `.github/workflows/deploy-landing.yml` 생성 및 배포
- GitHub Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID 설정
- 자동 배포 활성화: main push → 자동 배포
- 날짜: 2026-04-04

---

## 🔄 진행 중

### QA-LANDING-01: perceptdot 랜딩 페이지 최종 검증
- 상태: 준비 완료 (검증 대기)
- 작업: 브라우저 hard refresh → 센터링 확인
- 배포 검증: GitHub Actions 자동 배포 확인

---

## ⏳ 대기 중

### INFRA-DEPLOY-01: CLOUDFLARE_API_TOKEN 갱신 + workflow 재활성화 (2026-05-11 추가)
- 상태: 대기 — CEO 액션 필요
- 우선순위: **높음** (현재 자동 배포 OFF)
- 작업:
  1. CF dashboard > My Profile > API Tokens > "Edit Cloudflare Pages" 템플릿으로 신규 토큰 발급 (Account: Thunova0318)
  2. GitHub repo > Settings > Secrets and variables > Actions → `CLOUDFLARE_API_TOKEN` 갱신
  3. `.github/workflows/deploy-landing.yml`의 `push:` 블록 주석 해제 + 위 안내 주석 정리
- 배경: 05-02 Run #6,7,8 모두 Deploy step 11초 즉시 실패 → 트리거 임시 비활성화 (커밋 49ef7e9)

### INFRA-AGENTS-01: `agents/*.md` 디렉터리 복원 (2026-05-11 추가)
- 상태: 대기
- 우선순위: 중간
- 작업: CLAUDE.md가 참조하는 `agents/{cpo,pm,dev,qa,growth}.md` + `agents/extensions/{devrel,research}.md` 복원 또는 CLAUDE.md 경로 정정
- 배경: 커밋 40bd19f에서 root-level 역할 .md 삭제 시 `agents/` 디렉터리 부재. 현재 각 에이전트가 PRE_TASK Hook에서 자기 역할 문서 로드 불가

### INFRA-GIT-02: stale `claude/check-records-GzlvV` 브랜치 정리 (2026-05-11 추가)
- 상태: 대기 — CEO 승인 필요
- 작업: `git push origin --delete claude/check-records-GzlvV` (destructive → 명시 승인 필수)
- 배경: 03-22 작업, 현 main과 unrelated history. 산출물은 신 히스토리에 흡수 완료.

### INFRA-GITHUB-02: GitHub Actions 자동 배포 모니터링
- 상태: 대기 (다음 push 시 테스트, INFRA-DEPLOY-01 선행)
- 작업: 실제 파일 수정 후 push → 자동 배포 확인

### FEATURE-PAY-02: Paddle 결제 버튼 추가
- 상태: 대기
- 우선순위: 중간
- 설명: perceptdot 수익화 단계

---

## 📌 주의사항

- CF Pages 프로젝트는 현재 "수동 배포" 방식 → Git 연결 옵션 없음 (정상)
- GitHub Actions로 자동 배포 설정 완료 (수동 배포와 병행 가능)
- 다음부터 `perceptdot/landing/**` 변경 시 자동 배포됨

