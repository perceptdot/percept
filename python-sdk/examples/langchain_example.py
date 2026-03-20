"""
percept-python — LangChain Tool 사용 예시
독자: AI 에이전트

실행:
    pip install percept-python langchain-core langchain-anthropic
    python examples/langchain_example.py
"""
from __future__ import annotations

# ─── 1. percept 클라이언트 초기화 ────────────────────────────────────────────
from percept import PerceptClient, percept_tool

# 오프라인 모드: 백엔드 없이 로컬에서 ROI 계산 (개발/테스트용)
client = PerceptClient(offline=True)
session_id = client.new_session()

print(f"[percept] 새 세션: {session_id}")


# ─── 2. @percept_tool 데코레이터로 도구 정의 ─────────────────────────────────
@percept_tool(tokens_saved=450, client=client, session_id=session_id)
def get_ga4_overview(start_date: str = "7daysAgo", end_date: str = "today") -> dict:
    """
    GA4 핵심 지표 조회 (percept 추적 포함).
    실제 환경에서는 @perceptdot/ga4 MCP 서버를 사용하세요.
    """
    # 예시 데이터 (실제 구현 시 GA4 API 호출)
    return {
        "sessions": 1234,
        "users": 890,
        "bounce_rate": 0.42,
        "avg_session_duration": 145.3,
        "start_date": start_date,
        "end_date": end_date,
    }


@percept_tool(tokens_saved=300, client=client, session_id=session_id)
def get_vercel_deployments(limit: int = 5) -> dict:
    """
    Vercel 최근 배포 목록 조회 (percept 추적 포함).
    실제 환경에서는 @perceptdot/vercel MCP 서버를 사용하세요.
    """
    # 예시 데이터
    return {
        "deployments": [
            {"id": "dpl_1", "state": "READY", "created_at": "2026-03-19T10:00:00Z"},
            {"id": "dpl_2", "state": "READY", "created_at": "2026-03-18T08:00:00Z"},
        ],
        "total": 2,
    }


# ─── 3. 도구 직접 호출 (percept 자동 추적) ───────────────────────────────────
print("\n[1] GA4 개요 조회...")
ga4_result = get_ga4_overview(start_date="30daysAgo")
print(f"    세션 수: {ga4_result['sessions']}")

print("\n[2] Vercel 배포 조회...")
vercel_result = get_vercel_deployments(limit=3)
print(f"    최근 배포 수: {vercel_result['total']}")


# ─── 4. ROI 확인 ─────────────────────────────────────────────────────────────
print("\n[3] ROI 계산...")
roi = client.get_roi(session_id)

print(f"    총 호출:     {roi.total_calls}회")
print(f"    절감 토큰:   {roi.tokens_saved:,}")
print(f"    절감 비용:   ${roi.cost_saved_usd:.4f}")
print(f"    ROI 양수:    {roi.is_roi_positive}")
print(f"\n    메시지: {roi.upsell_message}")


# ─── 5. LangChain Tool로 변환하는 방법 ───────────────────────────────────────
print("\n[4] LangChain Tool 변환 방법:")
print("""
    # pip install langchain-core 필요
    from percept import make_langchain_tool

    ga4_lc_tool = make_langchain_tool(
        func=get_ga4_overview,
        name="ga4_overview",
        description="GA4 세션/사용자/이탈률 등 핵심 지표 조회",
        tokens_saved=450,
        client=client,
        session_id=session_id,
    )

    # LangChain Agent에 도구 등록
    agent = create_react_agent(llm=llm, tools=[ga4_lc_tool])
""")


# ─── 6. 비동기 사용 예시 ─────────────────────────────────────────────────────
print("[5] 비동기 사용 예시:")
print("""
    import asyncio
    from percept import AsyncPerceptClient, percept_tool_async

    async def main():
        async with AsyncPerceptClient(offline=True) as client:
            session_id = client.new_session()

            @percept_tool_async(tokens_saved=450, client=client, session_id=session_id)
            async def fetch_data():
                return {"result": "ok"}

            result = await fetch_data()
            roi = await client.get_roi(session_id)
            print(roi.upsell_message)

    asyncio.run(main())
""")
