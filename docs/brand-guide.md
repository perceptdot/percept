# perceptdot Brand Guide
> 단일 진실 소스. 디자인·마케팅·개발 모두 이 파일 기준.

---

## 로고

### 픽셀 아이 마크
SVG 소스: `landing/favicon.svg`

8×8 픽셀 그리드 (cell = 4px → 32×32 기준)

| 레이어 | 색상 | 용도 |
|--------|------|------|
| Outer ring (D) | `#cc0030` | 외곽 픽셀 |
| Mid (R) | `#ff1a3c` | 메인 바디 |
| Highlight (H) | `#ff6080` | 중앙 하이라이트 |

### 브랜드명 타이포
- 폰트: **Press Start 2P** (Google Fonts)
- `percept` → `#f2f0f5` (white)
- `dot` → `#ff1a3c` (accent red)

### 금지 사항
- 로고 색상 보라색·파란색 사용 금지
- 로고 비율 변경 금지
- 배경 밝은 색 위에 사용 금지 (다크 배경 전용)

---

## 컬러 시스템

### Backgrounds
```
--bg:  #07000d   ← 메인 배경 (almost black, red-tinted)
--bg2: #0f0018   ← 섹션 배경 / 헤더 바
--bg3: #160024   ← 카드 / 터미널 배경
```

### Brand Primary — RED
```
--accent:       #ff1a3c   ← 메인 액센트
--accent-hover: #ff4060   ← hover / tagline
--accent-dark:  #cc0028   ← 어두운 강조
--accent-dark2: #cc0030   ← 로고 외곽 링
--highlight:    #ff6080   ← 로고 하이라이트 / 부드러운 강조
--glow:         rgba(255,26,60,0.25)
--border:       rgba(255,26,60,0.12)
--border-hover: rgba(255,26,60,0.30)
```

### Text
```
--text:  #f2f0f5   ← 본문
--muted: #7a7580   ← 보조 텍스트
```

### Status Colors
```
--green: #22c55e   ← OK / 성공
--amber: #fbbf24   ← WARNING / 주의
--red:   #ff1a3c   ← ERROR / 실패 (= accent)
```

---

## 타이포그래피

| 용도 | 폰트 | 비고 |
|------|------|------|
| 브랜드명 / 타이틀 | **Press Start 2P** | Google Fonts, 픽셀 레트로 |
| 본문 / UI | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 시스템 폰트 |
| 코드 / 터미널 | `'SF Mono', 'Fira Code', Consolas, monospace` | 모노스페이스 |

---

## OG 이미지 스펙

- 크기: **1200 × 630px**
- 배경: `#07000d`
- 상단 액센트 바: `#ff1a3c` (5px)
- 로고: 픽셀 아이 마크 (SVG 스펙 그대로 렌더링, 136×136px)
- 타이틀: Press Start 2P 44px — `percept` 흰색 / `dot` 레드
- Tagline: SFNS 30px, `#ff4060`
- 터미널 블록: bg `#160024`, 테두리 glow `rgba(255,26,60,0.25)`
- 생성 스크립트: `scripts/gen-og.py` (← 아래 배치)

---

## 컴포넌트 패턴

### 버튼 Primary
```css
background: #ff1a3c;
color: #fff;
font-family: var(--font);
border-radius: 6px;
```

### 터미널 블록
```css
background: #160024;
border: 1px solid rgba(255,26,60,0.12);
border-radius: 10px;
box-shadow: 0 0 24px rgba(255,26,60,0.15);
```

### 배지
```css
background: rgba(accent, 0.15);  /* 각 컬러의 ~1/7 명도 */
color: accent;
border-radius: 5px;
padding: 4px 13px;
font-size: 17px;
```

---

## 브랜드 보이스

- **톤**: 개발자 도구 / 기술적·직접적
- **키워드**: visual_check, headless, ~7s, CI/CD, MCP, AI eyes
- **슬로건**: "Give your AI eyes."
- **금지**: "혁신적인", "세계 최초" 류 과장 표현
