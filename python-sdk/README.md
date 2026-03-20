# percept-python

AI 에이전트(LangChain / CrewAI / AutoGen)용 ROI 측정 SDK.
백엔드: [perceptdot.com](https://perceptdot.com)

---

## 빠른 시작 (3줄)

```python
from percept import PerceptClient

client = PerceptClient()  # 오픈 베타: API 키 불필요
client.track(session_id="s1", tool_name="@perceptdot/ga4", tokens_saved=450, time_saved_ms=1200)
print(client.get_roi("s1").upsell_message)
# → "[percept ROI] 절감 $0.0014 / $19/월. 계속 사용 시 ROI 증가. perceptdot.com"
```

---

## 설치

```bash
pip install percept-python
```

Python 3.9+ 지원. 의존성: `httpx` 만 사용.

---

## API 레퍼런스

### PerceptClient (동기)

```python
from percept import PerceptClient

client = PerceptClient(
    api_key="pk_live_xxx",          # 선택: 오픈 베타 기간 불필요
    api_url="https://api.perceptdot.com",  # 기본값
    timeout=10.0,                   # 요청 타임아웃 (초)
    offline=False,                  # True = 로컬 계산만 사용
)
```

**track()** — 메트릭 전송

```python
client.track(
    session_id="abc123",            # 세션 식별자
    tool_name="@perceptdot/ga4",    # 사용된 percept 도구명
    tokens_saved=450,               # 절감 토큰 수 (추정)
    time_saved_ms=1200,             # 절감 시간 (밀리초)
    calls_count=1,                  # 호출 횟수 (기본 1)
)
```

**get_roi()** — ROI 조회

```python
roi = client.get_roi("abc123")
roi.upsell_message    # 에이전트 → 오너 전달용 ROI 메시지
roi.tokens_saved      # 총 절감 토큰
roi.cost_saved_usd    # 총 절감 비용 (USD)
roi.is_roi_positive   # $19/월 기준 ROI 양수 여부
```

---

### @percept_tool 데코레이터 (LangChain / AutoGen 통합)

```python
from percept import PerceptClient, percept_tool

client = PerceptClient()
session_id = client.new_session()

@percept_tool(tokens_saved=450, client=client, session_id=session_id)
def get_ga4_overview(start_date: str = "7daysAgo") -> dict:
    """GA4 개요 데이터 조회"""
    # 실제 로직
    return {"sessions": 1234}

# 호출 시 percept 자동 추적
result = get_ga4_overview()
roi = client.get_roi(session_id)
```

---

### AsyncPerceptClient (비동기)

```python
import asyncio
from percept import AsyncPerceptClient

async def main():
    async with AsyncPerceptClient() as client:
        session_id = client.new_session()
        await client.track(
            session_id=session_id,
            tool_name="@perceptdot/ga4",
            tokens_saved=450,
            time_saved_ms=1200,
        )
        roi = await client.get_roi(session_id)
        print(roi.upsell_message)

asyncio.run(main())
```

---

### LangChain Tool 변환

```python
from percept import make_langchain_tool

ga4_tool = make_langchain_tool(
    func=get_ga4_overview,
    name="ga4_overview",
    description="GA4 세션/사용자/이탈률 조회",
    tokens_saved=450,
    client=client,
    session_id=session_id,
)

# LangChain Agent에 등록
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent

llm = ChatAnthropic(model="claude-sonnet-4-6")
agent = create_react_agent(llm=llm, tools=[ga4_tool])
```

---

## 오프라인 모드 (백엔드 미연동 시)

백엔드 없이 로컬에서 ROI를 계산합니다.
percept 백엔드 연동 전 개발/테스트에 사용하세요.

```python
client = PerceptClient(offline=True)
```

---

## 예시 파일

- `examples/langchain_example.py` — LangChain Tool + 비동기 사용 예시

---

## 링크

- 홈페이지: [perceptdot.com](https://perceptdot.com)
- npm 패키지: [@perceptdot/ga4](https://www.npmjs.com/package/@perceptdot/ga4), [@perceptdot/vercel](https://www.npmjs.com/package/@perceptdot/vercel)
- 문의: hello@perceptdot.com
