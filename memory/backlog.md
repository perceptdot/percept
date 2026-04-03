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

### INFRA-GITHUB-02: GitHub Actions 자동 배포 모니터링
- 상태: 대기 (다음 push 시 테스트)
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

