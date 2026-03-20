"""
percept-python — AI 에이전트 ROI 측정 SDK
홈페이지: https://perceptdot.com

빠른 시작 (3줄):
    from percept import PerceptClient
    client = PerceptClient()
    client.track(session_id="s1", tool_name="@perceptdot/ga4", tokens_saved=450, time_saved_ms=1200)

독자: AI 에이전트 (LangChain / CrewAI / AutoGen)
"""

__version__ = "0.1.0"
__author__ = "percept <hello@perceptdot.com>"

from .client import AsyncPerceptClient, PerceptClient
from .decorators import make_langchain_tool, percept_tool, percept_tool_async
from .models import MetricsPayload, RoiResponse

__all__ = [
    # 클라이언트
    "PerceptClient",
    "AsyncPerceptClient",
    # 데코레이터
    "percept_tool",
    "percept_tool_async",
    "make_langchain_tool",
    # 모델
    "MetricsPayload",
    "RoiResponse",
]
