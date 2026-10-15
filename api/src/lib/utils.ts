import type { SessionAggregate, RoiResponse, ApiKeyRecord } from "../types";

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

// ─── 월 사용량 한도 (2026-10-15) ──────────────────────────────────────────────
// 1 크레딧 = 1 타일(1280×1600). 무료는 키에 저장된 quota(100, 피드백 후 200),
// 유료는 공정 사용 한도. 손익분기(타일당 약 $0.0009)를 넘지 않도록 잡은 값이다.
export const PLAN_MONTHLY_LIMITS = { pro: 10_000, team: 30_000 } as const;

/** 이번 달 기준 사용량으로 맞춘다. 달이 바뀌었으면 calls_used를 0으로 되돌린다. */
export function rollPeriod(record: ApiKeyRecord): void {
  const period = new Date().toISOString().slice(0, 7);
  if (record.period !== period) {
    record.period = period;
    record.calls_used = 0;
  }
}

export function monthlyLimit(record: ApiKeyRecord): number {
  return record.plan === "free" ? record.quota : PLAN_MONTHLY_LIMITS[record.plan];
}

/** 다음 달 1일 (UTC) */
export function nextResetDate(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString().split("T")[0];
}

/** 운영자 전용 엔드포인트 토큰 비교 (CANARY_TOKEN) */
export function isAdmin(token: string | undefined, expected: string | undefined): boolean {
  if (!token || !expected || token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// ─── SSRF: 내부망 주소 판정 ───────────────────────────────────────────────────
// WHATWG URL 파서가 10진·16진 IPv4 표기를 점 표기로 정규화하므로 점 표기만 검사하면 된다.
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;

  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) return isPrivateV4(v4.slice(1).map(Number));

  if (host.includes(":")) {
    if (host === "::" || host === "::1") return true;
    const mapped = host.match(/^::ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (mapped) return isPrivateV4(mapped.slice(1).map(Number));
    const hexMapped = host.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMapped) {
      const hi = parseInt(hexMapped[1], 16), lo = parseInt(hexMapped[2], 16);
      return isPrivateV4([hi >> 8, hi & 255, lo >> 8, lo & 255]);
    }
    return /^f[cd]/.test(host) || /^fe[89ab]/.test(host); // fc00::/7 고유 로컬, fe80::/10 링크 로컬
  }
  return false;
}

function isPrivateV4([a, b]: number[]): boolean {
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||  // CGNAT
    (a === 169 && b === 254) ||            // 링크 로컬·클라우드 메타데이터
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224                               // 멀티캐스트·예약
  );
}

// ─── 원가 추정 (2026-10 공개 단가) ────────────────────────────────────────────
// Gemini 2.5 Flash: 입력 $0.30 / 출력 $2.50 per 1M tokens
// Workers AI Llama 4 Scout: 입력 $0.27 / 출력 $0.85 per 1M tokens
// Browser Rendering: $0.09 per browser-hour (Workers Paid 포함분 초과 시)
const TOKEN_PRICES = {
  gemini: { in: 0.30 / 1e6, out: 2.50 / 1e6 },
  cf_ai: { in: 0.27 / 1e6, out: 0.85 / 1e6 },
} as const;
export const BROWSER_USD_PER_MS = 0.09 / 3_600_000;

export function estimateTileCostUsd(usage: { provider: "gemini" | "cf_ai" | "none"; in_tokens: number; out_tokens: number }): number {
  if (usage.provider === "none") return 0;
  const p = TOKEN_PRICES[usage.provider];
  return usage.in_tokens * p.in + usage.out_tokens * p.out;
}
