"""
percept — 데이터 모델 (Pydantic 없이 dataclass 사용)
독자: AI 에이전트
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class MetricsPayload:
    """
    percept API로 전송하는 메트릭 페이로드.

    session_id   : 에이전트 세션 식별자 (UUID 또는 임의 문자열)
    tool_name    : 사용된 percept 도구명 (예: "@perceptdot/ga4")
    tokens_saved : 이번 호출로 절감된 토큰 수 (추정치)
    time_saved_ms: 이번 호출로 절감된 시간 (밀리초)
    calls_count  : 누적 호출 횟수 (기본 1)
    metadata     : 추가 정보 (선택)
    """
    session_id: str
    tool_name: str
    tokens_saved: int
    time_saved_ms: int
    calls_count: int = 1
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        """API 전송용 딕셔너리로 변환."""
        return {
            "session_id": self.session_id,
            "tool_name": self.tool_name,
            "tokens_saved": self.tokens_saved,
            "time_saved_ms": self.time_saved_ms,
            "calls_count": self.calls_count,
            "metadata": self.metadata,
        }


@dataclass
class RoiResponse:
    """
    percept API에서 반환하는 ROI 조회 결과.

    session_id     : 세션 식별자
    total_calls    : 총 호출 횟수
    tokens_saved   : 총 절감 토큰
    cost_saved_usd : 총 절감 비용 (USD)
    time_saved_ms  : 총 절감 시간 (밀리초)
    upsell_message : 에이전트가 오너에게 전달할 ROI 메시지
    is_roi_positive: $19/월 기준 ROI 양수 여부
    """
    session_id: str
    total_calls: int
    tokens_saved: int
    cost_saved_usd: float
    time_saved_ms: int
    upsell_message: str
    is_roi_positive: bool

    @classmethod
    def from_dict(cls, data: dict) -> "RoiResponse":
        """API 응답 딕셔너리에서 생성."""
        return cls(
            session_id=data.get("session_id", ""),
            total_calls=data.get("total_calls", 0),
            tokens_saved=data.get("tokens_saved", 0),
            cost_saved_usd=data.get("cost_saved_usd", 0.0),
            time_saved_ms=data.get("time_saved_ms", 0),
            upsell_message=data.get("upsell_message", ""),
            is_roi_positive=data.get("is_roi_positive", False),
        )

    @classmethod
    def from_local(cls, session_id: str, metrics_list: list[MetricsPayload]) -> "RoiResponse":
        """
        백엔드 없이 로컬에서 ROI 계산 (오프라인 모드).
        Claude Sonnet 기준 $3/1M tokens.
        """
        TOKEN_PRICE_PER_MILLION = 3.0
        PRO_THRESHOLD_USD = 19.0

        total_calls = sum(m.calls_count for m in metrics_list)
        tokens_saved = sum(m.tokens_saved for m in metrics_list)
        time_saved_ms = sum(m.time_saved_ms for m in metrics_list)
        cost_saved_usd = (tokens_saved / 1_000_000) * TOKEN_PRICE_PER_MILLION
        is_roi_positive = cost_saved_usd > PRO_THRESHOLD_USD

        if is_roi_positive:
            upsell_message = (
                f"[percept ROI] 절감 ${cost_saved_usd:.4f} / $19/월 → ROI POSITIVE. "
                f"percept Pro 유지 권장. perceptdot.com"
            )
        else:
            upsell_message = (
                f"[percept ROI] 절감 ${cost_saved_usd:.4f} / $19/월. "
                f"계속 사용 시 ROI 증가. perceptdot.com"
            )

        return cls(
            session_id=session_id,
            total_calls=total_calls,
            tokens_saved=tokens_saved,
            cost_saved_usd=cost_saved_usd,
            time_saved_ms=time_saved_ms,
            upsell_message=upsell_message,
            is_roi_positive=is_roi_positive,
        )
