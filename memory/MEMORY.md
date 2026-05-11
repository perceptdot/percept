# perceptdot 메모리 (CLAUDE.md 제외)

## ⚡ NEXT ACTION (2026-05-11 갱신)

- **즉시 (CEO)**: CLOUDFLARE_API_TOKEN GitHub Secrets 갱신 → `.github/workflows/deploy-landing.yml`의 `push:` 블록 주석 해제 (INFRA-DEPLOY-01)
- **다음 (CPO/PM)**: `agents/*.md` 복원 또는 CLAUDE.md 경로 정정 (INFRA-AGENTS-01) — 현재 PRE_TASK Hook이 참조 문서 로드 불가
- **다음 (Dev)**: 토큰 재활성화 후 landing/ 변경 → 자동 배포 검증 (INFRA-GITHUB-02)
- **나중**: Paddle 결제 통합 (수익화, FEATURE-PAY-02)

### 이전 NEXT ACTION (2026-04-04, 완료/만료)
- ~~perceptdot.com hard refresh → UI 센터링 확인~~ (완료)
- ~~파일 수정 후 push → 자동 배포 검증~~ (05-02 토큰 만료로 보류, INFRA-DEPLOY-01 선행 필요)

---

## 🏗️ 인프라 결정

### CF Pages 배포 구조 (2026-04-04 확정)
- **도메인 분리**:
  - api.perceptdot.com = CF Workers (Hono API)
  - perceptdot.com = CF Pages (정적 HTML/landing)
- **배포 방식**: GitHub Actions 워크플로우 + 수동 배포 병행
- **Git 연결**: CF Pages 프로젝트는 수동 배포 모드 → Git 옵션 없음 (정상)
- **자동화**: `.github/workflows/deploy-landing.yml` 설정 완료

### GitHub Actions 워크플로우 (2026-04-04 배포)
```
trigger: main push + perceptdot/landing/** 변경
action: npx wrangler pages deploy .
secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
status: ✅ 활성화
```

---

## 🔧 기술 노트

### CSS 센터링 패턴 (학습)
- ❌ `width: 100%; max-width: 600px;` → margin auto 무효화
- ✅ `max-width: 600px; margin: 0 auto;` → 올바른 센터링
- 적용 클래스: .hero-code, .hero-sub, .install-tabs, .steps-grid

### Cloudflare API 토큰 관리
- Keychain 저장 위치: `thunova.cloudflare_api.CLOUDFLARE_API_TOKEN`
- 로드 명령: `./kw-key.sh get cloudflare_api CLOUDFLARE_API_TOKEN`
- GitHub Secrets 추가 시: CEO가 workflow scope 활성화 필요

---

## 📊 진행 상황 (2026-05-11 기준)

| 항목 | 상태 | 비고 |
|------|------|------|
| UI 센터링 | ✅ 완료 | 배포됨 |
| CF Pages 배포 | ✅ 완료 | 직접 연동 방식 |
| GitHub Actions workflow | ⚠️ 일시 비활성화 | 05-02 토큰 만료로 `push:` 트리거 주석 처리 (커밋 49ef7e9) |
| CLOUDFLARE_API_TOKEN 갱신 | 🔄 CEO 대기 | INFRA-DEPLOY-01 |
| `agents/*.md` 디렉터리 | ❌ 부재 | 40bd19f 삭제 후 미복원, INFRA-AGENTS-01 |
| stale 브랜치 정리 | 🔄 CEO 승인 대기 | `claude/check-records-GzlvV` (INFRA-GIT-02) |
| Paddle 결제 | ⏳ 대기 | 우선순위 중간 |

---

## 📚 참조

- 일일 보고서: `docs/outputs/daily_20260404.md`
- 백로그: `memory/backlog.md`
- 워크플로우 파일: `.github/workflows/deploy-landing.yml`
- 설정: GitHub Repo → Settings → Secrets and variables → Actions
