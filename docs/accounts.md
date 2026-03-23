# 계정 맵 · perceptdot + K-사주
> 최종 업데이트: 2026-03-22 | 관리: thunova0318@gmail.com

---

## 기본 계정 원칙

| 계정 | 용도 | 비고 |
|------|------|------|
| **thunova0318@gmail.com** | 신규 계정 기본 (perceptdot 전용) | 앞으로 모든 신규 가입 |
| **soondoobu1111@gmail.com** | 구 계정 (K-사주 레거시) | 이전 진행 중 |
| **service@perceptdot.com** | 공식 서비스 이메일 | Cloudflare Routing → thunova0318 포워딩 + Brevo SMTP 발송 |

---

## 개발 인프라

| 서비스 | 현재 계정 | 목표 계정 | 상태 | 프로젝트 |
|--------|-----------|-----------|------|----------|
| **GitHub** (soondoobu1111-star) | thunova0318@gmail.com (Primary) | ✅ 완료 | 완료 (2026-03-23) | K-사주 + perceptdot |
| **GitHub Org** (perceptdot) | soondoobu1111-star 소유 | thunova0318 계정 Owner로 추가 | ⏸️ 대기 | perceptdot |
| **Vercel** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 | K-사주 FE |
| **AWS EC2** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 | K-사주 BE |
| **Cloudflare** | thunova0318@gmail.com | ✅ 신규 계정 | 완료 | perceptdot |
| **npm** | 미확인 | thunova0318으로 통일 | ❓ 확인 필요 | perceptdot 패키지 |
| **Gitbook** | soondoobu1111@gmail.com | thunova0318으로 이전 | ⏸️ 대기 | K-사주 문서 |

---

## 결제

| 서비스 | 현재 계정 | 상태 | 용도 |
|--------|-----------|------|------|
| **Paddle** | thunova0318@gmail.com (THUNOVA / Sorina Lee) | ⏳ KYC 심사 중 (1~2 영업일) | perceptdot 유료화 |
| **Gumroad** | 확인 필요 | ✅ 임시 라이브 (Pro $19, Team $99) | perceptdot 임시 결제 |

---

## Analytics / SEO

| 서비스 | 계정 | 상태 | 속성/ID |
|--------|------|------|---------|
| **GA4** | 확인 필요 | ✅ 랜딩 삽입 완료 | G-982JCXJW0N |
| **Google Search Console** | 확인 필요 | ✅ 등록 완료, 3 pages 인덱스 | perceptdot.com |

---

## SNS / 마케팅 API

| 서비스 | 계정 | API 상태 | env 파일 |
|--------|------|----------|----------|
| **X (Twitter)** | thunova0318@gmail.com | ✅ API 키 재발급 완료 (GitGuardian 탐지 후) | `api_keys/x_api.env` ✅ |
| **Reddit** | 미확인 | ⏸️ 미신청 | `api_keys/reddit_api.env` |
| **LinkedIn** | 미확인 | ⏸️ 미신청 | `api_keys/linkedin_api.env` |
| **Discord** | 미확인 | ⏸️ 미신청 | `api_keys/discord_api.env` |
| **Product Hunt** | 미확인 | ⏸️ 미신청 | `api_keys/producthunt_api.env` |

> ✅ X API 키 재발급 완료 (2026-03-22, GitGuardian 탐지 → CEO 수동 Regenerate)

---

## MCP 디렉토리 (수동 제출 · API 없음)

| 플랫폼 | 계정 | 상태 | 비고 |
|--------|------|------|------|
| **mcp.so** | thunova0318@gmail.com | ✅ 등록 완료 | 2026-03-22 |
| **Moltbook** | thunova0318@gmail.com | ✅ 에이전트 등록 완료 | API Key 확보, 클레임 인증 코드 필요 |
| **Glama.ai** | thunova0318@gmail.com | ⏳ 리뷰 대기 | 제출 완료 |
| **Smithery** | 미확인 | ⏸️ 미제출 | 예정 |
| **awesome-mcp-servers** | soondoobu1111-star | ⏳ PR #3639 리뷰 대기 | Glama 승인 후 배지 추가 |

---

## 이메일 인프라

| 서비스 | 계정 | 상태 | 용도 |
|--------|------|------|------|
| **Cloudflare Email Routing** | thunova0318@gmail.com | ✅ 완료 | service@perceptdot.com 수신 → Gmail 포워딩 |
| **Brevo SMTP** | service@perceptdot.com | ✅ 완료 | service@perceptdot.com 발송 |

---

## 우선 액션

| 우선순위 | 액션 | 이유 |
|----------|------|------|
| ✅ 완료 | X API 키 Regenerate | 재발급 완료 (2026-03-22) |
| 🟡 이번 주 | npm 계정 확인 | @perceptdot/* 패키지 소유자 확인 필요 |
| 🟡 이번 주 | Paddle KYC 답변 확인 | 승인 후 Gumroad 대체 |
| 🟠 다음 주 | GitHub thunova0318 이전 | perceptdot org Owner 변경 |
| 🟠 다음 주 | Vercel / AWS 이전 | soondoobu1111 → thunova0318 |
| ⚪ 여유 | Reddit/LinkedIn API 신청 | 마케팅 자동화 준비 |
