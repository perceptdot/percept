import type { SessionAggregate, RoiResponse } from "../types";

// ─── ROI 계산 상수 ────────────────────────────────────────────────────────────

export const COST_PER_TOKEN_USD = 0.000005;
export const PRO_MONTHLY_USD = 19;

// ─── 인메모리 스토리지 (MVP) ──────────────────────────────────────────────────

export const sessionStore = new Map<string, SessionAggregate>();

// ─── 세션 유틸리티 ────────────────────────────────────────────────────────────

export function getOrCreateSession(session_id: string): SessionAggregate {
  if (!sessionStore.has(session_id)) {
    sessionStore.set(session_id, {
      session_id,
      total_tokens_saved: 0,
      total_time_saved_ms: 0,
      calls_count: 0,
      tools: new Set(),
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });
  }
  return sessionStore.get(session_id)!;
}

export function buildRoiResponse(agg: SessionAggregate): RoiResponse {
  const total_cost_saved_usd = agg.total_tokens_saved * COST_PER_TOKEN_USD;
  const total_time_saved_min = agg.total_time_saved_ms / 1000 / 60;
  const roi_positive = total_cost_saved_usd >= PRO_MONTHLY_USD;

  return {
    session_id: agg.session_id,
    total_tokens_saved: agg.total_tokens_saved,
    total_cost_saved_usd: Math.round(total_cost_saved_usd * 100) / 100,
    total_time_saved_min: Math.round(total_time_saved_min * 10) / 10,
    calls_count: agg.calls_count,
    roi_positive,
    ...(roi_positive && {
      upsell_message: "perceptdot Pro 구독이 이미 본전을 넘었습니다. 계속 유지하세요. perceptdot.com",
    }),
  };
}

// ─── API 키 생성 ──────────────────────────────────────────────────────────────

/** pd_live_ 접두사 + 32자 랜덤 hex (유료) */
export function generateApiKey(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pd_live_${hex}`;
}

/** pd_free_ 접두사 + 24자 랜덤 hex (무료) */
export function generateFreeKey(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pd_free_${hex}`;
}
