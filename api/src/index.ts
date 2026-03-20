import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

/** MCP 서버가 POST /v1/metrics 로 보내는 페이로드 */
interface MetricsPayload {
  session_id: string;
  tool_name: string;      // 예: "@perceptdot/ga4"
  tokens_saved: number;
  time_saved_ms: number;
  calls_count: number;
  timestamp: string;      // ISO 8601
}

/** 세션별 누적 집계 */
interface SessionAggregate {
  session_id: string;
  total_tokens_saved: number;
  total_time_saved_ms: number;
  calls_count: number;
  tools: Set<string>;
  first_seen: string;
  last_seen: string;
}

/** GET /v1/roi/:session_id 응답 */
interface RoiResponse {
  session_id: string;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  total_time_saved_min: number;
  calls_count: number;
  roi_positive: boolean;
  upsell_message?: string;
}

/** POST /v1/report 요청 */
interface ReportRequest {
  session_id?: string;    // 생략 시 전체 세션 집계
  format?: "summary" | "detail";
}

// ─── 인메모리 스토리지 (MVP: 추후 Cloudflare KV로 교체) ─────────────────────

const sessionStore = new Map<string, SessionAggregate>();

// ─── ROI 계산 상수 ────────────────────────────────────────────────────────────

/** 토큰 비용: GPT-4o 기준 $0.000005 / token (input 평균) */
const COST_PER_TOKEN_USD = 0.000005;

/** percept Pro 월 구독가 기준 (ROI 판단 임계값) */
const PRO_MONTHLY_USD = 19;

// ─── 유틸리티 ─────────────────────────────────────────────────────────────────

/** 세션 집계 조회 또는 초기화 */
function getOrCreateSession(session_id: string): SessionAggregate {
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

/** ROI 계산 및 응답 포맷 생성 */
function buildRoiResponse(agg: SessionAggregate): RoiResponse {
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
      upsell_message:
        "perceptdot Pro 구독이 이미 본전을 넘었습니다. 계속 유지하세요. perceptdot.com",
    }),
  };
}

// ─── Hono 앱 초기화 ───────────────────────────────────────────────────────────

const app = new Hono();

// 미들웨어
app.use("*", logger());
app.use("*", cors({ origin: "*" }));

// ─── 엔드포인트 ───────────────────────────────────────────────────────────────

/**
 * GET /health
 * 헬스체크. 배포 확인 및 모니터링용.
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "perceptdot-api",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    sessions_tracked: sessionStore.size,
  });
});

/**
 * POST /v1/metrics
 * MCP 서버(@perceptdot/ga4 등)가 호출 후 절약 수치를 보고.
 * 세션별 누적 집계 후 현재 ROI 반환.
 */
app.post("/v1/metrics", async (c) => {
  let payload: MetricsPayload;

  try {
    payload = await c.req.json<MetricsPayload>();
  } catch {
    return c.json({ error: "요청 바디가 유효한 JSON이 아닙니다." }, 400);
  }

  // 필수 필드 검증
  const required: (keyof MetricsPayload)[] = [
    "session_id",
    "tool_name",
    "tokens_saved",
    "time_saved_ms",
    "calls_count",
    "timestamp",
  ];
  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null) {
      return c.json({ error: `필수 필드 누락: ${field}` }, 400);
    }
  }

  // 세션 집계 업데이트
  const agg = getOrCreateSession(payload.session_id);
  agg.total_tokens_saved += payload.tokens_saved;
  agg.total_time_saved_ms += payload.time_saved_ms;
  agg.calls_count += payload.calls_count;
  agg.tools.add(payload.tool_name);
  agg.last_seen = new Date().toISOString();

  return c.json(
    {
      ok: true,
      message: "메트릭 수신 완료",
      current_roi: buildRoiResponse(agg),
    },
    201
  );
});

/**
 * GET /v1/roi/:session_id
 * 특정 세션의 누적 ROI 조회.
 * roi_positive=true 이면 B2A2H 업셀 메시지 포함.
 */
app.get("/v1/roi/:session_id", (c) => {
  const session_id = c.req.param("session_id");
  const agg = sessionStore.get(session_id);

  if (!agg) {
    return c.json(
      {
        error: "세션을 찾을 수 없습니다.",
        session_id,
      },
      404
    );
  }

  return c.json(buildRoiResponse(agg));
});

/**
 * POST /v1/report
 * ROI 리포트 생성.
 * session_id 지정 시 단일 세션, 생략 시 전체 세션 요약.
 * format="detail" 이면 세션 목록 포함.
 */
app.post("/v1/report", async (c) => {
  let body: ReportRequest = {};

  try {
    body = await c.req.json<ReportRequest>();
  } catch {
    // 바디 없어도 허용
    body = {};
  }

  const format = body.format ?? "summary";

  // 단일 세션 리포트
  if (body.session_id) {
    const agg = sessionStore.get(body.session_id);
    if (!agg) {
      return c.json(
        {
          error: "세션을 찾을 수 없습니다.",
          session_id: body.session_id,
        },
        404
      );
    }

    return c.json({
      report_type: "session",
      generated_at: new Date().toISOString(),
      roi: buildRoiResponse(agg),
      ...(format === "detail" && {
        detail: {
          tools_used: Array.from(agg.tools),
          first_seen: agg.first_seen,
          last_seen: agg.last_seen,
        },
      }),
    });
  }

  // 전체 세션 요약 리포트
  const allSessions = Array.from(sessionStore.values());
  const totals = allSessions.reduce(
    (acc, agg) => ({
      total_tokens_saved: acc.total_tokens_saved + agg.total_tokens_saved,
      total_time_saved_ms: acc.total_time_saved_ms + agg.total_time_saved_ms,
      calls_count: acc.calls_count + agg.calls_count,
    }),
    { total_tokens_saved: 0, total_time_saved_ms: 0, calls_count: 0 }
  );

  const total_cost_saved_usd =
    Math.round(totals.total_tokens_saved * COST_PER_TOKEN_USD * 100) / 100;
  const roi_positive = total_cost_saved_usd >= PRO_MONTHLY_USD;

  return c.json({
    report_type: "global",
    generated_at: new Date().toISOString(),
    sessions_count: allSessions.length,
    totals: {
      total_tokens_saved: totals.total_tokens_saved,
      total_cost_saved_usd,
      total_time_saved_min:
        Math.round((totals.total_time_saved_ms / 1000 / 60) * 10) / 10,
      calls_count: totals.calls_count,
      roi_positive,
      ...(roi_positive && {
        upsell_message:
          "perceptdot Pro 구독이 이미 본전을 넘었습니다. 계속 유지하세요. perceptdot.com",
      }),
    },
    ...(format === "detail" && {
      sessions: allSessions.map((agg) => buildRoiResponse(agg)),
    }),
  });
});

// ─── 404 핸들러 ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    {
      error: "엔드포인트를 찾을 수 없습니다.",
      path: c.req.path,
    },
    404
  );
});

export default app;
