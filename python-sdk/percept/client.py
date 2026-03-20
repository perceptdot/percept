"""
percept — 핵심 HTTP 클라이언트 (동기 + 비동기)
독자: AI 에이전트
의존성: httpx 만 사용
"""
from __future__ import annotations

import time
import uuid
from typing import Optional

import httpx

from .models import MetricsPayload, RoiResponse


# ─── 동기 클라이언트 ──────────────────────────────────────────────────────────

class PerceptClient:
    """
    percept API 동기 클라이언트.

    사용법:
        client = PerceptClient(api_key="pk_live_xxx")
        client.track(session_id="abc", tool_name="@perceptdot/ga4", tokens_saved=450, time_saved_ms=1200)
        roi = client.get_roi("abc")
        print(roi.upsell_message)
    """

    # 기본 API URL (백엔드 배포 전까지 로컬 계산 사용)
    DEFAULT_API_URL = "https://api.perceptdot.com"

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: str = DEFAULT_API_URL,
        timeout: float = 10.0,
        offline: bool = False,
    ) -> None:
        """
        api_key : percept API 키 (현재 오픈 베타 — 없어도 동작)
        api_url : 백엔드 URL (기본: https://api.perceptdot.com)
        timeout : 요청 타임아웃 (초)
        offline : True이면 로컬 계산만 사용 (백엔드 미연동 시 자동으로 True)
        """
        self.api_key = api_key
        self.api_url = api_url.rstrip("/")
        self.timeout = timeout
        self.offline = offline

        # 로컬 메트릭 캐시 (오프라인 모드 또는 백엔드 폴백용)
        self._local_metrics: dict[str, list[MetricsPayload]] = {}

        # httpx 세션
        self._headers = {"Content-Type": "application/json"}
        if api_key:
            self._headers["X-Percept-Key"] = api_key

    # ─── 메트릭 전송 ─────────────────────────────────────────────────────────

    def track(
        self,
        session_id: str,
        tool_name: str,
        tokens_saved: int,
        time_saved_ms: int,
        calls_count: int = 1,
        metadata: Optional[dict] = None,
    ) -> bool:
        """
        메트릭을 percept 백엔드로 전송.
        백엔드 미연동 시 로컬 캐시에 저장 (get_roi 로컬 계산용).

        반환값: True = 백엔드 전송 성공, False = 로컬 저장
        """
        payload = MetricsPayload(
            session_id=session_id,
            tool_name=tool_name,
            tokens_saved=tokens_saved,
            time_saved_ms=time_saved_ms,
            calls_count=calls_count,
            metadata=metadata or {},
        )

        # 로컬 캐시에 항상 저장 (폴백용)
        if session_id not in self._local_metrics:
            self._local_metrics[session_id] = []
        self._local_metrics[session_id].append(payload)

        # 오프라인 모드이면 로컬만 사용
        if self.offline:
            return False

        # 백엔드 전송 시도
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(
                    f"{self.api_url}/v1/track",
                    json=payload.to_dict(),
                    headers=self._headers,
                )
                return resp.status_code == 200
        except Exception:
            # 백엔드 미연동 → 조용히 로컬 폴백 (에이전트 흐름 방해 안 함)
            return False

    # ─── ROI 조회 ─────────────────────────────────────────────────────────────

    def get_roi(self, session_id: str) -> RoiResponse:
        """
        세션의 ROI 조회. 백엔드 미연동 시 로컬 계산 반환.

        반환값: RoiResponse (upsell_message 포함)
        """
        if not self.offline:
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.get(
                        f"{self.api_url}/v1/roi/{session_id}",
                        headers=self._headers,
                    )
                    if resp.status_code == 200:
                        return RoiResponse.from_dict(resp.json())
            except Exception:
                pass  # 폴백 to 로컬

        # 로컬 계산 (오프라인 모드 또는 백엔드 실패 시)
        local = self._local_metrics.get(session_id, [])
        return RoiResponse.from_local(session_id, local)

    # ─── 편의 메서드 ─────────────────────────────────────────────────────────

    def new_session(self) -> str:
        """새 세션 ID 생성 (UUID4)."""
        return str(uuid.uuid4())

    def get_roi_message(self, session_id: str) -> str:
        """ROI 요약 메시지만 반환 (에이전트 응답 삽입용)."""
        return self.get_roi(session_id).upsell_message


# ─── 비동기 클라이언트 ────────────────────────────────────────────────────────

class AsyncPerceptClient:
    """
    percept API 비동기 클라이언트 (asyncio / LangChain async tools 등).

    사용법:
        async with AsyncPerceptClient(api_key="pk_live_xxx") as client:
            await client.track(session_id="abc", tool_name="@perceptdot/ga4", ...)
            roi = await client.get_roi("abc")
    """

    DEFAULT_API_URL = "https://api.perceptdot.com"

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: str = DEFAULT_API_URL,
        timeout: float = 10.0,
        offline: bool = False,
    ) -> None:
        self.api_key = api_key
        self.api_url = api_url.rstrip("/")
        self.timeout = timeout
        self.offline = offline
        self._local_metrics: dict[str, list[MetricsPayload]] = {}
        self._headers = {"Content-Type": "application/json"}
        if api_key:
            self._headers["X-Percept-Key"] = api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self) -> "AsyncPerceptClient":
        self._client = httpx.AsyncClient(timeout=self.timeout, headers=self._headers)
        return self

    async def __aexit__(self, *args) -> None:
        if self._client:
            await self._client.aclose()

    async def track(
        self,
        session_id: str,
        tool_name: str,
        tokens_saved: int,
        time_saved_ms: int,
        calls_count: int = 1,
        metadata: Optional[dict] = None,
    ) -> bool:
        """비동기 메트릭 전송."""
        payload = MetricsPayload(
            session_id=session_id,
            tool_name=tool_name,
            tokens_saved=tokens_saved,
            time_saved_ms=time_saved_ms,
            calls_count=calls_count,
            metadata=metadata or {},
        )

        if session_id not in self._local_metrics:
            self._local_metrics[session_id] = []
        self._local_metrics[session_id].append(payload)

        if self.offline:
            return False

        try:
            client = self._client or httpx.AsyncClient(timeout=self.timeout)
            resp = await client.post(
                f"{self.api_url}/v1/track",
                json=payload.to_dict(),
                headers=self._headers,
            )
            return resp.status_code == 200
        except Exception:
            return False

    async def get_roi(self, session_id: str) -> RoiResponse:
        """비동기 ROI 조회."""
        if not self.offline:
            try:
                client = self._client or httpx.AsyncClient(timeout=self.timeout)
                resp = await client.get(
                    f"{self.api_url}/v1/roi/{session_id}",
                    headers=self._headers,
                )
                if resp.status_code == 200:
                    return RoiResponse.from_dict(resp.json())
            except Exception:
                pass

        local = self._local_metrics.get(session_id, [])
        return RoiResponse.from_local(session_id, local)

    async def get_roi_message(self, session_id: str) -> str:
        """비동기 ROI 메시지 반환."""
        roi = await self.get_roi(session_id)
        return roi.upsell_message

    def new_session(self) -> str:
        return str(uuid.uuid4())
