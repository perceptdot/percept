"""
percept — LangChain / AutoGen / CrewAI 툴 데코레이터
독자: AI 에이전트

사용법:
    from percept import percept_tool, PerceptClient

    client = PerceptClient()
    session_id = client.new_session()

    @percept_tool(client=client, session_id=session_id, tokens_saved=450)
    def get_ga4_overview(start_date: str = "7daysAgo"):
        # 실제 로직
        return {"sessions": 1234}
"""
from __future__ import annotations

import functools
import time
from typing import Any, Callable, Optional


def percept_tool(
    tokens_saved: int = 450,
    tool_name: Optional[str] = None,
    client: Optional[Any] = None,
    session_id: Optional[str] = None,
) -> Callable:
    """
    동기 함수에 percept ROI 측정을 자동으로 추가하는 데코레이터.

    파라미터:
        tokens_saved : 이 도구 호출로 절감하는 추정 토큰 수 (기본 450)
        tool_name    : percept 도구명 (기본: 함수명)
        client       : PerceptClient 인스턴스 (없으면 오프라인 모드)
        session_id   : 추적할 세션 ID (없으면 추적 안 함)

    예시:
        @percept_tool(tokens_saved=450)
        def get_ga4_overview(start_date: str = "7daysAgo"):
            return fetch_ga4_data(start_date)
    """
    def decorator(func: Callable) -> Callable:
        _tool_name = tool_name or f"percept/{func.__name__}"

        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                # percept 클라이언트가 있고 session_id가 있을 때만 추적
                if client is not None and session_id:
                    try:
                        client.track(
                            session_id=session_id,
                            tool_name=_tool_name,
                            tokens_saved=tokens_saved,
                            time_saved_ms=elapsed_ms,
                            calls_count=1,
                        )
                    except Exception:
                        pass  # 추적 실패해도 도구 실행에 영향 없음

        wrapper._percept_tool_name = _tool_name
        wrapper._percept_tokens_saved = tokens_saved
        return wrapper

    return decorator


def percept_tool_async(
    tokens_saved: int = 450,
    tool_name: Optional[str] = None,
    client: Optional[Any] = None,
    session_id: Optional[str] = None,
) -> Callable:
    """
    비동기 함수용 percept ROI 측정 데코레이터.

    예시:
        @percept_tool_async(tokens_saved=450, client=client, session_id=sid)
        async def get_ga4_overview_async(start_date: str = "7daysAgo"):
            return await fetch_ga4_data_async(start_date)
    """
    import asyncio

    def decorator(func: Callable) -> Callable:
        _tool_name = tool_name or f"percept/{func.__name__}"

        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            start = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                elapsed_ms = int((time.perf_counter() - start) * 1000)
                if client is not None and session_id:
                    try:
                        if asyncio.iscoroutinefunction(client.track):
                            await client.track(
                                session_id=session_id,
                                tool_name=_tool_name,
                                tokens_saved=tokens_saved,
                                time_saved_ms=elapsed_ms,
                            )
                        else:
                            client.track(
                                session_id=session_id,
                                tool_name=_tool_name,
                                tokens_saved=tokens_saved,
                                time_saved_ms=elapsed_ms,
                            )
                    except Exception:
                        pass

        wrapper._percept_tool_name = _tool_name
        wrapper._percept_tokens_saved = tokens_saved
        return wrapper

    return decorator


# ─── LangChain BaseTool 래퍼 헬퍼 ────────────────────────────────────────────

def make_langchain_tool(
    func: Callable,
    name: str,
    description: str,
    tokens_saved: int = 450,
    client: Optional[Any] = None,
    session_id: Optional[str] = None,
) -> Any:
    """
    일반 함수를 LangChain Tool로 변환하면서 percept 추적 추가.

    langchain 설치 필요: pip install langchain-core

    사용법:
        tool = make_langchain_tool(
            func=get_ga4_overview,
            name="ga4_overview",
            description="GA4 개요 데이터 조회",
            tokens_saved=450,
            client=client,
            session_id=session_id,
        )
    """
    try:
        from langchain_core.tools import tool as lc_tool
    except ImportError:
        raise ImportError(
            "LangChain 미설치. `pip install langchain-core` 실행 후 사용하세요."
        )

    tracked_func = percept_tool(
        tokens_saved=tokens_saved,
        tool_name=f"percept/{name}",
        client=client,
        session_id=session_id,
    )(func)

    tracked_func.__name__ = name
    tracked_func.__doc__ = description

    return lc_tool(tracked_func)
