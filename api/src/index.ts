import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// ─── 환경 바인딩 타입 ──────────────────────────────────────────────────────────

interface Env {
  /** Cloudflare KV: API 키 저장소 */
  API_KEYS: KVNamespace;
  /** Resend API 키 (wrangler secret) */
  RESEND_API_KEY: string;
  /** Gumroad 웹훅 시크릿 (선택) */
  GUMROAD_WEBHOOK_SECRET?: string;
}

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

interface MetricsPayload {
  session_id: string;
  tool_name: string;
  tokens_saved: number;
  time_saved_ms: number;
  calls_count: number;
  timestamp: string;
}

interface SessionAggregate {
  session_id: string;
  total_tokens_saved: number;
  total_time_saved_ms: number;
  calls_count: number;
  tools: Set<string>;
  first_seen: string;
  last_seen: string;
}

interface RoiResponse {
  session_id: string;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  total_time_saved_min: number;
  calls_count: number;
  roi_positive: boolean;
  upsell_message?: string;
}

interface ReportRequest {
  session_id?: string;
  format?: "summary" | "detail";
}

/** Gumroad 웹훅 페이로드 (form-encoded) */
interface GumroadWebhookPayload {
  seller_id?: string;
  product_id?: string;
  product_name?: string;
  permalink?: string;
  email?: string;
  price?: string;        // 센트 단위 문자열
  sale_timestamp?: string;
  order_number?: string;
  license_key?: string;
  test?: string;         // "true" if test purchase
}

/** KV에 저장되는 API 키 레코드 */
interface ApiKeyRecord {
  key: string;
  email: string;
  plan: "pro" | "team";
  created_at: string;
  order_number?: string;
}

// ─── 인메모리 스토리지 (MVP) ──────────────────────────────────────────────────

const sessionStore = new Map<string, SessionAggregate>();

// ─── ROI 계산 상수 ────────────────────────────────────────────────────────────

const COST_PER_TOKEN_USD = 0.000005;
const PRO_MONTHLY_USD = 19;

// ─── 유틸리티 ─────────────────────────────────────────────────────────────────

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

/** pd_live_ 접두사 + 32자 랜덤 hex API 키 생성 */
function generateApiKey(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pd_live_${hex}`;
}

/** Resend로 API 키 이메일 발송 */
async function sendApiKeyEmail(
  resendApiKey: string,
  to: string,
  apiKey: string,
  plan: "pro" | "team"
): Promise<{ ok: boolean; error?: string }> {
  const planLabel = plan === "team" ? "Team ($75/mo · 5 seats)" : "Pro ($19/mo)";
  const mcpExample =
    plan === "team"
      ? `{
  "mcpServers": {
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["-y", "@perceptdot/ga4"],
      "env": { "PERCEPT_API_KEY": "${apiKey}" }
    },
    "@perceptdot/vercel": {
      "command": "npx",
      "args": ["-y", "@perceptdot/vercel"],
      "env": { "PERCEPT_API_KEY": "${apiKey}" }
    }
  }
}`
      : `{
  "mcpServers": {
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["-y", "@perceptdot/ga4"],
      "env": { "PERCEPT_API_KEY": "${apiKey}" }
    }
  }
}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:monospace;background:#0a0a0a;color:#e0e0e0;padding:32px;max-width:600px;">
  <h1 style="color:#00ff88;font-size:20px;">perceptdot ${planLabel}</h1>
  <p style="color:#aaa;">Your API key is ready. Add it to your MCP config.</p>

  <h2 style="color:#e0e0e0;font-size:14px;margin-top:24px;">API KEY</h2>
  <pre style="background:#111;border:1px solid #333;padding:16px;border-radius:6px;font-size:14px;color:#00ff88;word-break:break-all;">${apiKey}</pre>

  <h2 style="color:#e0e0e0;font-size:14px;margin-top:24px;">MCP CONFIG (.mcp.json)</h2>
  <pre style="background:#111;border:1px solid #333;padding:16px;border-radius:6px;font-size:12px;overflow-x:auto;">${mcpExample}</pre>

  <p style="color:#666;font-size:12px;margin-top:24px;">
    Docs: <a href="https://perceptdot.com" style="color:#00ff88;">perceptdot.com</a>
  </p>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "perceptdot <noreply@perceptdot.com>",
        to: [to],
        subject: `[perceptdot] Your API Key — ${planLabel}`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Resend error ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Hono 앱 초기화 ───────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

// ─── 엔드포인트 ───────────────────────────────────────────────────────────────

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "perceptdot-api",
    version: "0.2.0",
    timestamp: new Date().toISOString(),
    sessions_tracked: sessionStore.size,
  });
});

app.post("/v1/metrics", async (c) => {
  let payload: MetricsPayload;

  try {
    payload = await c.req.json<MetricsPayload>();
  } catch {
    return c.json({ error: "요청 바디가 유효한 JSON이 아닙니다." }, 400);
  }

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

app.get("/v1/roi/:session_id", (c) => {
  const session_id = c.req.param("session_id");
  const agg = sessionStore.get(session_id);

  if (!agg) {
    return c.json({ error: "세션을 찾을 수 없습니다.", session_id }, 404);
  }

  return c.json(buildRoiResponse(agg));
});

app.post("/v1/report", async (c) => {
  let body: ReportRequest = {};

  try {
    body = await c.req.json<ReportRequest>();
  } catch {
    body = {};
  }

  const format = body.format ?? "summary";

  if (body.session_id) {
    const agg = sessionStore.get(body.session_id);
    if (!agg) {
      return c.json(
        { error: "세션을 찾을 수 없습니다.", session_id: body.session_id },
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

app.post("/v1/checkout", async (c) => {
  let body: { seats: number; amount_usd: number };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
  }

  const { seats, amount_usd } = body;

  if (!seats || seats < 2 || seats > 50) {
    return c.json({ error: "seats는 2~50 사이여야 합니다." }, 400);
  }

  const expected = seats * 15;
  if (amount_usd !== expected) {
    return c.json(
      { error: `금액 불일치: expected $${expected}, received $${amount_usd}` },
      400
    );
  }

  const checkout_id = `co_${Date.now()}_${seats}seats`;

  return c.json(
    {
      ok: true,
      checkout_id,
      seats,
      amount_usd,
      price_per_seat: 15,
      status: "pending_payment_provider",
      note: "Lemon Squeezy 연동(PAY-02) 후 checkout_url 발급 예정",
    },
    201
  );
});

/**
 * POST /v1/webhook/gumroad
 * Gumroad 결제 완료 웹훅 → API 키 자동 발급 → Resend 이메일 발송
 *
 * Gumroad 설정: https://app.gumroad.com/settings/advanced → Webhooks
 * URL: https://api.perceptdot.com/v1/webhook/gumroad
 */
app.post("/v1/webhook/gumroad", async (c) => {
  // Gumroad는 application/x-www-form-urlencoded 로 전송
  let body: GumroadWebhookPayload;

  try {
    const formData = await c.req.formData();
    body = Object.fromEntries(formData.entries()) as GumroadWebhookPayload;
  } catch {
    return c.json({ error: "페이로드 파싱 실패" }, 400);
  }

  const { email, product_name, order_number, test } = body;

  // 이메일 필수
  if (!email) {
    return c.json({ error: "email 누락" }, 400);
  }

  // 플랜 판별 (permalink 또는 product_name 기준)
  const permalink = body.permalink ?? "";
  const isTeam =
    permalink.includes("wkwgbw") ||
    (product_name ?? "").toLowerCase().includes("team");
  const plan: "pro" | "team" = isTeam ? "team" : "pro";

  // 테스트 구매 로그만 남기고 실제 키 발급도 진행 (개발 확인용)
  const isTest = test === "true";

  // API 키 생성
  const apiKey = generateApiKey();

  // Cloudflare KV 저장 (키: apikey:<email>, 만료 없음)
  const record: ApiKeyRecord = {
    key: apiKey,
    email,
    plan,
    created_at: new Date().toISOString(),
    order_number: order_number ?? undefined,
  };

  try {
    await c.env.API_KEYS.put(`apikey:${email}`, JSON.stringify(record));
  } catch (e) {
    console.error("KV write failed:", e);
    return c.json({ error: "KV 저장 실패" }, 500);
  }

  // Resend 이메일 발송
  const emailResult = await sendApiKeyEmail(
    c.env.RESEND_API_KEY,
    email,
    apiKey,
    plan
  );

  if (!emailResult.ok) {
    console.error("Email send failed:", emailResult.error);
    // 이메일 실패해도 키는 KV에 저장됨 → 200 반환 (재전송 가능)
  }

  return c.json({
    ok: true,
    plan,
    email,
    is_test: isTest,
    email_sent: emailResult.ok,
    ...(emailResult.error && { email_error: emailResult.error }),
  });
});

/**
 * GET /v1/apikey/:email
 * 관리자용: 이메일로 발급된 API 키 조회
 */
app.get("/v1/apikey/:email", async (c) => {
  const email = decodeURIComponent(c.req.param("email"));
  const raw = await c.env.API_KEYS.get(`apikey:${email}`);

  if (!raw) {
    return c.json({ error: "API 키 없음", email }, 404);
  }

  const record = JSON.parse(raw) as ApiKeyRecord;
  return c.json(record);
});

// ─── 404 핸들러 ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json(
    { error: "엔드포인트를 찾을 수 없습니다.", path: c.req.path },
    404
  );
});

export default app;
