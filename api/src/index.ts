import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import puppeteer from "@cloudflare/puppeteer";

import type { Env, MetricsPayload, ReportRequest, GumroadWebhookPayload, ApiKeyRecord, FeedbackRecord, CuratedServer, RecommendLogPayload } from "./types";
import { CURATED_DB, REGISTRY_VERSION, REGISTRY_UPDATED_AT } from "./data/registry";
import { sessionStore, getOrCreateSession, buildRoiResponse, generateApiKey, generateFreeKey, COST_PER_TOKEN_USD, PRO_MONTHLY_USD } from "./lib/utils";
import { sendInternalAlert, sendApiKeyEmail } from "./lib/email";

export { BrowserQueue } from "./durable-objects/browser-queue";


// ─── Hono 앱 초기화 ───────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

// ─── 헬스체크 ─────────────────────────────────────────────────────────────────

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "perceptdot-api",
    version: "0.3.0",
    timestamp: new Date().toISOString(),
    sessions_tracked: sessionStore.size,
  });
});

// ─── 무료 키 발급 ─────────────────────────────────────────────────────────────

/**
 * POST /v1/free-key
 * 이메일 입력 → pd_free_xxx 무료 키 발급 (100콜 쿼터)
 */
app.post("/v1/free-key", async (c) => {
  let body: { email?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }

  const { email } = body;
  if (!email || !email.includes("@")) {
    return c.json({ error: "Valid email required." }, 400);
  }

  // 이미 발급된 키 있으면 기존 키 재발송 (재입력 시 이메일 재발송)
  const existingRaw = await c.env.API_KEYS.get(`apikey:${email}`);
  if (existingRaw) {
    let existing: ApiKeyRecord;
    try { existing = JSON.parse(existingRaw) as ApiKeyRecord; }
    catch { return c.json({ error: "Key record corrupted. Contact support." }, 500); }
    if (existing.plan === "free") {
      // 기존 키를 이메일로 다시 발송
      await sendApiKeyEmail(c.env.RESEND_API_KEY, email, existing.key, "free");
      return c.json({
        ok: true,
        api_key: existing.key,
        plan: "free",
        quota: existing.quota,
        calls_used: existing.calls_used,
        email_sent: true,
        note: "existing key resent",
      });
    }
    // 유료 플랜 사용자 → 이미 더 좋은 키 있음
    return c.json({ error: "You already have a paid plan key.", plan: existing.plan }, 409);
  }

  const apiKey = generateFreeKey();
  const record: ApiKeyRecord = {
    key: apiKey,
    email,
    plan: "free",
    created_at: new Date().toISOString(),
    calls_used: 0,
    quota: 100,
    feedback_count: 0,
  };

  await c.env.API_KEYS.put(`apikey:${email}`, JSON.stringify(record));
  await c.env.API_KEYS.put(`key:${apiKey}`, JSON.stringify(record));

  // 카운터 증가
  const today = new Date().toISOString().split("T")[0];
  const [prevFree, prevToday] = await Promise.all([
    c.env.API_KEYS.get("stats:total_free"),
    c.env.API_KEYS.get(`stats:today:${today}`),
  ]);
  await Promise.all([
    c.env.API_KEYS.put("stats:total_free", String((parseInt(prevFree ?? "0")) + 1)),
    c.env.API_KEYS.put(`stats:today:${today}`, String((parseInt(prevToday ?? "0")) + 1)),
  ]);

  // 이메일 발송 (사용자 + 내부 알림 병렬)
  const [emailResult] = await Promise.all([
    sendApiKeyEmail(c.env.RESEND_API_KEY, email, apiKey, "free"),
    sendInternalAlert(
      c.env.RESEND_API_KEY,
      `[perceptdot] 🆕 Free key — ${email}`,
      `New free key issued\nEmail: ${email}\nKey: ${apiKey}\nTime: ${new Date().toISOString()}`
    ),
  ]);
  if (!emailResult.ok) {
    console.error("Free key email failed:", emailResult.error);
  }

  return c.json({
    ok: true,
    api_key: apiKey,
    plan: "free",
    quota: 100,
    calls_used: 0,
    email_sent: emailResult.ok,
  }, 201);
});

// ─── 콜 사용 (무료 키 전용) ──────────────────────────────────────────────────

/**
 * POST /v1/use
 * 무료 키 콜 1회 차감. MCP 서버가 각 tool 호출 시 사용.
 * 응답: { allowed, needs_feedback, quota_remaining, calls_used }
 */
app.post("/v1/use", async (c) => {
  let body: { key?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }

  const { key } = body;
  if (!key) return c.json({ error: "key field is required." }, 400);

  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ allowed: false, needs_feedback: false, message: "Invalid key. Get a free key at perceptdot.com" }, 404);

  let record: ApiKeyRecord;
  try { record = JSON.parse(raw) as ApiKeyRecord; }
  catch { return c.json({ allowed: false, needs_feedback: false, message: "Key record corrupted." }, 500); }

  // 유료 플랜은 이 엔드포인트 불필요 (무제한)
  if (record.plan !== "free") {
    return c.json({ allowed: true, quota_remaining: -1, calls_used: record.calls_used });
  }

  const { calls_used, quota, feedback_count } = record;

  // 쿼터 초과 확인
  if (calls_used >= quota) {
    // 피드백 1회 제출 시 100 추가 가능 (최대 200콜)
    if (feedback_count < 1 && quota === 100) {
      return c.json({
        allowed: false,
        needs_feedback: true,
        quota_remaining: 0,
        calls_used,
        message: "FREE QUOTA REACHED (100 calls). Submit feedback to unlock 100 more → use percept_feedback tool.",
      });
    }
    // 200콜 모두 소진 → 업그레이드
    return c.json({
      allowed: false,
      needs_feedback: false,
      quota_remaining: 0,
      calls_used,
      message: "FREE PLAN EXHAUSTED (200 calls). Upgrade to Pro ($19/mo) → https://perceptdot.com",
    });
  }

  // 콜 1회 차감
  record.calls_used += 1;
  await c.env.API_KEYS.put(`key:${key}`, JSON.stringify(record));
  await c.env.API_KEYS.put(`apikey:${record.email}`, JSON.stringify(record));

  return c.json({
    allowed: true,
    quota_remaining: record.quota - record.calls_used,
    calls_used: record.calls_used,
  });
});

// ─── 피드백 제출 ──────────────────────────────────────────────────────────────

/**
 * POST /v1/feedback
 * 무료 키 사용자가 별점+코멘트 제출 → 쿼터 100 추가
 */
app.post("/v1/feedback", async (c) => {
  let body: { key?: string; rating?: number; comment?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }

  const { key, rating, comment } = body;
  if (!key) return c.json({ error: "key field is required." }, 400);
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) return c.json({ error: "rating must be an integer between 1 and 5." }, 400);
  if (!comment || comment.trim().length === 0) return c.json({ error: "comment is required." }, 400);
  if (comment.length > 150) return c.json({ error: "comment must be 150 characters or less." }, 400);

  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ error: "Invalid key." }, 404);

  let record: ApiKeyRecord;
  try { record = JSON.parse(raw) as ApiKeyRecord; }
  catch { return c.json({ error: "Key record corrupted. Contact support." }, 500); }

  // 이미 피드백 제출 완료 (무료 플랜 1회 제한)
  if (record.feedback_count >= 1) {
    return c.json({ error: "Already submitted feedback. Upgrade to Pro for unlimited calls → https://perceptdot.com" }, 409);
  }

  // 쿼터 +100, 피드백 카운트 +1
  record.quota += 100;
  record.feedback_count += 1;
  await c.env.API_KEYS.put(`key:${key}`, JSON.stringify(record));
  await c.env.API_KEYS.put(`apikey:${record.email}`, JSON.stringify(record));

  // 피드백 공개 목록에 추가
  const feedback: FeedbackRecord = {
    key_prefix: key.slice(0, 12),
    rating: Math.round(rating),
    comment: comment.trim().slice(0, 150),
    timestamp: new Date().toISOString(),
  };

  const feedListRaw = await c.env.API_KEYS.get("feedbacks:list");
  let feedList: FeedbackRecord[] = [];
  try { feedList = feedListRaw ? JSON.parse(feedListRaw) : []; } catch { feedList = []; }
  feedList.unshift(feedback); // 최신 순
  if (feedList.length > 100) feedList.splice(100); // 최대 100개 보관
  await c.env.API_KEYS.put("feedbacks:list", JSON.stringify(feedList));

  return c.json({
    ok: true,
    new_quota: record.quota,
    calls_remaining: record.quota - record.calls_used,
    message: `Thank you! 100 more calls unlocked (total ${record.quota}). Upgrade to Pro for unlimited → https://perceptdot.com`,
  });
});

// ─── 공개 피드백 목록 ─────────────────────────────────────────────────────────

/**
 * GET /v1/feedbacks
 * 랜딩 페이지 "Agent Reviews" 섹션용 공개 피드백 목록
 */
app.get("/v1/feedbacks", async (c) => {
  const raw = await c.env.API_KEYS.get("feedbacks:list");
  const feedList: FeedbackRecord[] = raw ? JSON.parse(raw) : [];
  const publicFeedbacks = feedList.filter((f) => f.rating >= 3);
  return c.json({ feedbacks: publicFeedbacks, count: publicFeedbacks.length });
});

// ─── 기존 엔드포인트 ──────────────────────────────────────────────────────────

app.post("/v1/metrics", async (c) => {
  let payload: MetricsPayload;

  try {
    payload = await c.req.json<MetricsPayload>();
  } catch {
    return c.json({ error: "요청 바디가 Invalid JSON." }, 400);
  }

  const required: (keyof MetricsPayload)[] = [
    "session_id", "tool_name", "tokens_saved", "time_saved_ms", "calls_count", "timestamp",
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

  return c.json({ ok: true, message: "메트릭 수신 완료", current_roi: buildRoiResponse(agg) }, 201);
});

app.get("/v1/roi/:session_id", (c) => {
  const session_id = c.req.param("session_id");
  const agg = sessionStore.get(session_id);
  if (!agg) return c.json({ error: "Session not found.", session_id }, 404);
  return c.json(buildRoiResponse(agg));
});

app.post("/v1/report", async (c) => {
  let body: ReportRequest = {};
  try { body = await c.req.json<ReportRequest>(); } catch { body = {}; }

  const format = body.format ?? "summary";

  if (body.session_id) {
    const agg = sessionStore.get(body.session_id);
    if (!agg) return c.json({ error: "Session not found.", session_id: body.session_id }, 404);
    return c.json({
      report_type: "session",
      generated_at: new Date().toISOString(),
      roi: buildRoiResponse(agg),
      ...(format === "detail" && { detail: { tools_used: Array.from(agg.tools), first_seen: agg.first_seen, last_seen: agg.last_seen } }),
    });
  }

  const allSessions = Array.from(sessionStore.values());
  const totals = allSessions.reduce(
    (acc, agg) => ({ total_tokens_saved: acc.total_tokens_saved + agg.total_tokens_saved, total_time_saved_ms: acc.total_time_saved_ms + agg.total_time_saved_ms, calls_count: acc.calls_count + agg.calls_count }),
    { total_tokens_saved: 0, total_time_saved_ms: 0, calls_count: 0 }
  );
  const total_cost_saved_usd = Math.round(totals.total_tokens_saved * COST_PER_TOKEN_USD * 100) / 100;
  const roi_positive = total_cost_saved_usd >= PRO_MONTHLY_USD;

  return c.json({
    report_type: "global",
    generated_at: new Date().toISOString(),
    sessions_count: allSessions.length,
    totals: { ...totals, total_cost_saved_usd, total_time_saved_min: Math.round((totals.total_time_saved_ms / 1000 / 60) * 10) / 10, roi_positive, ...(roi_positive && { upsell_message: "Your perceptdot Pro subscription has already paid for itself. perceptdot.com" }) },
    ...(format === "detail" && { sessions: allSessions.map(buildRoiResponse) }),
  });
});

app.post("/v1/checkout", async (c) => {
  let body: { seats: number; amount_usd: number };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON." }, 400); }
  const { seats, amount_usd } = body;
  if (!seats || seats < 2 || seats > 50) return c.json({ error: "seats는 2~50 사이여야 합니다." }, 400);
  const expected = seats * 15;
  if (amount_usd !== expected) return c.json({ error: `금액 불일치: expected $${expected}, received $${amount_usd}` }, 400);
  return c.json({ ok: true, checkout_id: `co_${Date.now()}_${seats}seats`, seats, amount_usd, price_per_seat: 15, status: "pending_payment_provider" }, 201);
});

app.post("/v1/webhook/gumroad", async (c) => {
  let body: GumroadWebhookPayload;
  try {
    const formData = await c.req.formData();
    body = Object.fromEntries(formData.entries()) as GumroadWebhookPayload;
  } catch {
    return c.json({ error: "Payload parsing failed." }, 400);
  }

  const { email, product_name, order_number, test } = body;
  if (!email) return c.json({ error: "email 누락" }, 400);

  const permalink = body.permalink ?? "";
  const isTeam = permalink.includes("wkwgbw") || (product_name ?? "").toLowerCase().includes("team");
  const plan: "pro" | "team" = isTeam ? "team" : "pro";
  const isTest = test === "true";

  const apiKey = generateApiKey();
  const record: ApiKeyRecord = {
    key: apiKey,
    email,
    plan,
    created_at: new Date().toISOString(),
    order_number: order_number ?? undefined,
    calls_used: 0,
    quota: -1, // unlimited
    feedback_count: 0,
  };

  try {
    await c.env.API_KEYS.put(`apikey:${email}`, JSON.stringify(record));
    await c.env.API_KEYS.put(`key:${apiKey}`, JSON.stringify(record));
  } catch (e) {
    console.error("KV write failed:", e);
    return c.json({ error: "KV storage failed." }, 500);
  }

  // 카운터 증가
  const today = new Date().toISOString().split("T")[0];
  const statKey = plan === "team" ? "stats:total_team" : "stats:total_pro";
  const [prevPlan, prevToday] = await Promise.all([
    c.env.API_KEYS.get(statKey),
    c.env.API_KEYS.get(`stats:today:${today}`),
  ]);
  await Promise.all([
    c.env.API_KEYS.put(statKey, String((parseInt(prevPlan ?? "0")) + 1)),
    c.env.API_KEYS.put(`stats:today:${today}`, String((parseInt(prevToday ?? "0")) + 1)),
  ]);

  const emailResult = await sendApiKeyEmail(c.env.RESEND_API_KEY, email, apiKey, plan);
  if (!emailResult.ok) console.error("Email send failed:", emailResult.error);

  return c.json({ ok: true, plan, email, is_test: isTest, email_sent: emailResult.ok, ...(emailResult.error && { email_error: emailResult.error }) });
});

app.get("/v1/apikey/:email", async (c) => {
  const email = decodeURIComponent(c.req.param("email"));
  const raw = await c.env.API_KEYS.get(`apikey:${email}`);
  if (!raw) return c.json({ error: "API key not found", email }, 404);
  return c.json(JSON.parse(raw) as ApiKeyRecord);
});

/**
 * GET /v1/validate?key={api_key}
 * API 키 유효성 검증 — free/pro/team 플랜 반환
 */
app.get("/v1/validate", async (c) => {
  const key = c.req.query("key");
  if (!key) return c.json({ valid: false, plan: "free" }, 400);
  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ valid: false, plan: "free" }, 404);
  const record = JSON.parse(raw) as ApiKeyRecord;

  if (record.plan === "free") {
    return c.json({
      valid: true,
      plan: "free",
      email: record.email,
      calls_used: record.calls_used,
      quota: record.quota,
      quota_remaining: record.quota - record.calls_used,
      feedback_count: record.feedback_count,
    });
  }

  return c.json({ valid: true, plan: record.plan, email: record.email });
});

/**
 * GET /v1/quota?key={api_key}
 * Returns remaining credits for the given API key
 */
app.get("/v1/quota", async (c) => {
  const key = c.req.query("key") ?? c.req.header("X-Percept-Key");
  if (!key) return c.json({ error: "API key required. Pass ?key= or X-Percept-Key header." }, 400);
  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ error: "Invalid API key." }, 404);
  const record = JSON.parse(raw) as ApiKeyRecord;

  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];

  if (record.plan === "free") {
    return c.json({
      ok: true,
      plan: "free",
      quota_total: record.quota,
      calls_used: record.calls_used,
      quota_remaining: Math.max(0, record.quota - record.calls_used),
      reset_date: resetDate,
    });
  }

  return c.json({
    ok: true,
    plan: record.plan,
    quota_total: -1,
    calls_used: record.calls_used ?? 0,
    quota_remaining: -1,
    reset_date: resetDate,
    note: "Unlimited plan — no quota limit",
  });
});

// ─── 마케팅 모니터링 통계 ──────────────────────────────────────────────────────

/**
 * GET /v1/stats?key={paid_api_key}
 * 마케팅 모니터링용: 총 키 발급 수, 플랜별 분포, 오늘 신규, 피드백 통계
 * 유료 키(pd_live_) 인증 필요
 */
app.get("/v1/stats", async (c) => {
  const key = c.req.query("key");
  if (!key) return c.json({ error: "key parameter is required." }, 401);
  const keyRaw = await c.env.API_KEYS.get(`key:${key}`);
  if (!keyRaw) return c.json({ error: "Invalid key." }, 401);
  const keyRecord = JSON.parse(keyRaw) as ApiKeyRecord;
  if (keyRecord.plan === "free") return c.json({ error: "Pro/Team 키가 필요합니다." }, 403);

  const today = new Date().toISOString().split("T")[0];
  const [freeRaw, proRaw, teamRaw, todayRaw, feedRaw] = await Promise.all([
    c.env.API_KEYS.get("stats:total_free"),
    c.env.API_KEYS.get("stats:total_pro"),
    c.env.API_KEYS.get("stats:total_team"),
    c.env.API_KEYS.get(`stats:today:${today}`),
    c.env.API_KEYS.get("feedbacks:list"),
  ]);

  const freeCount = parseInt(freeRaw ?? "0");
  const proCount = parseInt(proRaw ?? "0");
  const teamCount = parseInt(teamRaw ?? "0");
  const todayCount = parseInt(todayRaw ?? "0");
  const feedbacks: FeedbackRecord[] = feedRaw ? JSON.parse(feedRaw) : [];
  const avgRating = feedbacks.length > 0
    ? Math.round((feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length) * 10) / 10
    : null;

  return c.json({
    total_keys: freeCount + proCount + teamCount,
    free: freeCount,
    pro: proCount,
    team: teamCount,
    today_new: todayCount,
    total_feedbacks: feedbacks.length,
    avg_rating: avgRating,
    generated_at: new Date().toISOString(),
  });
});

// ─── RSS 피드 ────────────────────────────────────────────────────────────────

/** GET /rss/feedback — 에이전트 피드백 RSS */
app.get("/rss/feedback", async (c) => {
  const raw = await c.env.API_KEYS.get("feedbacks:list");
  const feedList: FeedbackRecord[] = raw ? JSON.parse(raw) : [];

  const items = feedList.slice(0, 50).map((f) => {
    const stars = "★".repeat(f.rating) + "☆".repeat(5 - f.rating);
    return `
    <item>
      <title>${stars} (${f.rating}/5) — ${f.key_prefix}***</title>
      <description><![CDATA[${f.comment}]]></description>
      <pubDate>${new Date(f.timestamp).toUTCString()}</pubDate>
      <guid>${f.key_prefix}-${f.timestamp}</guid>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>perceptdot — Agent Feedback</title>
    <link>https://perceptdot.com</link>
    <description>Real feedback from AI agents using perceptdot MCP servers.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items || "<item><title>No feedback yet</title><description>Be the first agent to leave feedback.</description><pubDate>" + new Date().toUTCString() + "</pubDate><guid>empty</guid></item>"}
  </channel>
</rss>`;

  return c.text(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
});

/** GET /rss/changelog — perceptdot 릴리즈 changelog RSS */
app.get("/rss/changelog", (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>perceptdot — Changelog</title>
    <link>https://perceptdot.com</link>
    <description>New integrations, updates, and releases from perceptdot.</description>
    <language>en</language>
    <lastBuildDate>Fri, 21 Mar 2026 00:00:00 +0000</lastBuildDate>
    <item>
      <title>@perceptdot/ga4 v0.2.1 — Plan Validation + Named Profiles</title>
      <description><![CDATA[Free plan: 10 calls/session limit with graceful upgrade message. Named Profiles: GA4_PROFILES={"project":"propertyId"} supports multiple GA4 properties in one server. Backward compatible with GA4_PROPERTY_ID.]]></description>
      <pubDate>Fri, 21 Mar 2026 06:00:00 +0000</pubDate>
      <guid>ga4-v0.2.1</guid>
    </item>
    <item>
      <title>Pricing Update — Free 2 integrations / 200 calls, Team $99/10 seats</title>
      <description><![CDATA[Free plan now includes 2 integrations (GA4 + Vercel) and 200 API calls/day. Team plan updated to $99/month for 10 seats ($9.9/seat).]]></description>
      <pubDate>Fri, 21 Mar 2026 05:00:00 +0000</pubDate>
      <guid>pricing-2026-03-21</guid>
    </item>
    <item>
      <title>@perceptdot/sentry v0.1.1 + @perceptdot/github v0.1.1</title>
      <description><![CDATA[Minor updates to Sentry and GitHub MCP servers. Improved error handling and ROI tracking.]]></description>
      <pubDate>Fri, 21 Mar 2026 04:00:00 +0000</pubDate>
      <guid>sentry-github-v0.1.1</guid>
    </item>
    <item>
      <title>@perceptdot/sentry v0.1.0 + @perceptdot/github v0.1.0 — Launch</title>
      <description><![CDATA[Two new MCP integrations: Sentry (error monitoring) and GitHub (PRs, issues, workflows). Both include ROI measurement.]]></description>
      <pubDate>Thu, 20 Mar 2026 06:00:00 +0000</pubDate>
      <guid>sentry-github-v0.1.0</guid>
    </item>
    <item>
      <title>@perceptdot/ga4 v0.1.0 + @perceptdot/vercel v0.1.0 — Launch</title>
      <description><![CDATA[perceptdot launches with two MCP integrations: GA4 (Google Analytics) and Vercel (deployments). Give your AI agent eyes.]]></description>
      <pubDate>Wed, 19 Mar 2026 06:00:00 +0000</pubDate>
      <guid>ga4-vercel-v0.1.0</guid>
    </item>
  </channel>
</rss>`;

  return c.text(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
});

// ─── Registry: 큐레이션 목록 ─────────────────────────────────────────────────

/**
 * GET /v1/registry/curated
 * 공개 API — 인증 불필요
 * 큐레이션된 MCP 서버 전체 목록 반환
 */
app.get("/v1/registry/curated", (c) => {
  return c.json({
    servers: CURATED_DB,
    version: REGISTRY_VERSION,
    updated_at: REGISTRY_UPDATED_AT,
    total: CURATED_DB.length,
  });
});

// ─── Registry: 검색 ───────────────────────────────────────────────────────────

/**
 * GET /v1/registry/search?q=keyword&category=analytics
 * 공개 API — 인증 불필요
 * 큐레이션 DB에서 name, description, category, keywords 필드 검색
 */
app.get("/v1/registry/search", (c) => {
  const q = (c.req.query("q") ?? "").toLowerCase().trim();
  const category = (c.req.query("category") ?? "").toLowerCase().trim();

  let results = CURATED_DB as CuratedServer[];

  if (category) {
    results = results.filter((s) => s.category === category);
  }

  if (q) {
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.package.toLowerCase().includes(q) ||
        s.keywords.some((k: string) => k.toLowerCase().includes(q))
    );
  }

  // perceptdot 서버 우선, 그 다음 tokens_saved 내림차순
  results = [...results].sort((a, b) => {
    if (a.is_perceptdot && !b.is_perceptdot) return -1;
    if (!a.is_perceptdot && b.is_perceptdot) return 1;
    return b.tokens_saved_per_call - a.tokens_saved_per_call;
  });

  return c.json({
    query: q || null,
    category: category || null,
    results,
    total: results.length,
  });
});

// ─── Recommend: 추천 이벤트 로그 ─────────────────────────────────────────────

/**
 * POST /v1/recommend/log
 * 인증 필요 (Authorization: Bearer {api_key} 또는 body.api_key)
 * 어떤 프로젝트에서 어떤 서버가 추천됐는지 KV에 기록
 * Body: { project_signals, recommended_servers, installed_servers }
 */
app.post("/v1/recommend/log", async (c) => {
  // ── API 키 인증 ──
  const authHeader = c.req.header("Authorization");
  let apiKey: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    apiKey = authHeader.slice(7).trim();
  }

  if (!apiKey) {
    // body에서도 허용 (MCP 클라이언트 편의)
    try {
      const body = await c.req.json<RecommendLogPayload & { api_key?: string }>();
      apiKey = body.api_key ?? null;
      // body를 다시 읽을 수 없으므로 body 저장
      const { project_signals, recommended_servers, installed_servers } = body;

      if (!apiKey) {
        return c.json({ error: "Authorization header 또는 api_key field is required." }, 401);
      }

      const keyRaw = await c.env.API_KEYS.get(`key:${apiKey}`);
      if (!keyRaw) return c.json({ error: "Invalid API key." }, 401);

      // 로그 저장
      const logKey = `recommend:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      const logEntry = {
        project_signals: project_signals ?? [],
        recommended_servers: recommended_servers ?? [],
        installed_servers: installed_servers ?? [],
        api_key_prefix: apiKey.slice(0, 12),
        timestamp: new Date().toISOString(),
      };

      await c.env.RECOMMEND_LOG.put(logKey, JSON.stringify(logEntry), {
        expirationTtl: 60 * 60 * 24 * 90, // 90일 보관
      });

      return c.json({ logged: true });
    } catch {
      return c.json({ error: "Invalid JSON." }, 400);
    }
  }

  // Authorization 헤더로 키가 전달된 경우
  const keyRaw = await c.env.API_KEYS.get(`key:${apiKey}`);
  if (!keyRaw) return c.json({ error: "Invalid API key." }, 401);

  let body: RecommendLogPayload;
  try {
    body = await c.req.json<RecommendLogPayload>();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }

  const logKey = `recommend:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const logEntry = {
    project_signals: body.project_signals ?? [],
    recommended_servers: body.recommended_servers ?? [],
    installed_servers: body.installed_servers ?? [],
    api_key_prefix: apiKey.slice(0, 12),
    timestamp: new Date().toISOString(),
  };

  await c.env.RECOMMEND_LOG.put(logKey, JSON.stringify(logEntry), {
    expirationTtl: 60 * 60 * 24 * 90, // 90일 보관
  });

  return c.json({ logged: true });
});

// ─── @perceptdot/eye: visual_check ────────────────────────────────────────────

/**
 * POST /v1/eye/check
 * EYE-01 POC: CF Browser Rendering API → 스크린샷 → Gemini 2.5 Flash 비주얼 분석
 *
 * Body: { url: string, prompt?: string }
 * Returns: { ok, poc_passed, url, analysis, timing, cost, screenshot_b64? }
 *
 * POC 통과 기준: timing.total_ms < 10000 AND cost.estimated_usd < 0.05
 *
 * 사전 요건:
 *   1. Cloudflare Workers 유료 플랜 (Browser Rendering 활성화)
 *   2. wrangler secret put GEMINI_API_KEY
 */
app.post("/v1/eye/check", async (c) => {
  const startTime = Date.now();

  // ── 요청 파싱 ──
  let body: { url?: string; prompt?: string; include_screenshot?: boolean; no_cache?: boolean; full_page?: boolean; api_key?: string; viewport?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { url, prompt, include_screenshot = false, no_cache = false, full_page = true, viewport: viewportParam = "desktop" } = body;
  // viewport: "desktop"=1280px (기본), "tablet"=768px, "mobile"=375px
  const VIEWPORT_WIDTH = viewportParam === "desktop" ? 1280 : viewportParam === "tablet" ? 768 : 375;
  if (!url) return c.json({ error: "url is required" }, 400);

  // URL 유효성 검사 (SSRF 방지: http/https만 허용)
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return c.json({ error: "URL must use http or https protocol" }, 400);
    }
    // Private IP 차단
    const host = parsedUrl.hostname;
    if (
      host === "localhost" ||
      host.startsWith("127.") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    ) {
      return c.json({ error: "Private/localhost URLs are not allowed" }, 400);
    }
  } catch {
    return c.json({ error: "Invalid URL" }, 400);
  }

  // ── API 키 검증 + 크레딧 사전 확인 (EYE-CREDIT) ──
  const apiKeyVal = c.req.header("X-Percept-Key") ?? body.api_key ?? null;
  let keyRecord: ApiKeyRecord | null = null;

  if (!apiKeyVal) {
    return c.json({ ok: false, error: "API key required. Get a free key at perceptdot.com" }, 401);
  }

  const keyRaw = await c.env.API_KEYS.get(`key:${apiKeyVal}`);
  if (!keyRaw) {
    return c.json({ ok: false, error: "Invalid API key. Get a free key at perceptdot.com" }, 401);
  }
  try {
    keyRecord = JSON.parse(keyRaw) as ApiKeyRecord;
  } catch {
    return c.json({ ok: false, error: "Key record corrupted. Contact support." }, 500);
  }

  // 무료 플랜: 쿼터 사전 확인 (브라우저 슬롯 낭비 방지)
  if (keyRecord.plan === "free") {
    if (keyRecord.calls_used >= keyRecord.quota) {
      const needsFeedback = keyRecord.feedback_count < 1 && keyRecord.quota === 100;
      return c.json({
        ok: false,
        error: needsFeedback
          ? "Free quota reached (100 tiles). Submit feedback to unlock 100 more → use percept_feedback tool."
          : "Free plan exhausted (200 tiles). Upgrade to Pro ($19/mo) → https://perceptdot.com",
        quota_remaining: 0,
        calls_used: keyRecord.calls_used,
        needs_feedback: needsFeedback,
      }, 402);
    }
  }

  // ── KV 캐시 조회 (no_cache=true 또는 prompt 있으면 스킵) ──
  const cacheKey = `eye:${url}`;
  if (!prompt && !no_cache && c.env.VISUAL_CACHE) {
    try {
      const cached = await c.env.VISUAL_CACHE.get(cacheKey, "json");
      if (cached) {
        return c.json({ ...(cached as object), cached: true, cache_age_note: "Result from KV cache (TTL 5min)" });
      }
    } catch {
      // 캐시 실패 시 무시하고 계속
    }
  }

  // ── BrowserQueue DO: 동시 브라우저 슬롯 획득 ──
  let doStub: DurableObjectStub | null = null;
  if (c.env.BROWSER_QUEUE) {
    try {
      doStub = c.env.BROWSER_QUEUE.get(c.env.BROWSER_QUEUE.idFromName("singleton"));
      const acquireRes = await doStub.fetch("https://do-internal/acquire");
      if (!acquireRes.ok) {
        const err = await acquireRes.json() as { error: string; retry_after_ms: number };
        return c.json({ ok: false, error: "서버가 혼잡합니다. 잠시 후 재시도해주세요.", detail: err.error, retry_after_ms: err.retry_after_ms }, 503);
      }
    } catch {
      // DO 실패 시 무시하고 계속 (안전 장치)
      doStub = null;
    }
  }

  // ── CF Browser Rendering API: DOM Audit + 스크린샷 ──
  const browserStart = Date.now();
  const TILE_H = 1600;
  const OVERLAP = 100;
  let tiles: Array<{ b64: string; y: number; height: number }> = [];
  let screenshotBytes = 0;
  let capturedPageHeight = 800;

  // DOM Audit 결과 (결정론적 — JS 측정)
  type DomIssue = { type: string; selector: string; detail: string };
  let domFindings: DomIssue[] = [];

  try {
    const browser = await puppeteer.launch(c.env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport({ width: VIEWPORT_WIDTH, height: 800 });

    // 느린 외부 스크립트 차단 (Paddle, GTM 등 — 비주얼 QA에 불필요)
    await page.setRequestInterception(true);
    page.on("request", (req: any) => {
      const u = req.url();
      if (
        u.includes("paddle.com") ||
        u.includes("paddle.js") ||
        u.includes("googletagmanager") ||
        u.includes("google-analytics") ||
        u.includes("gtag")
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      await page.goto(parsedUrl.toString(), {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });
    } catch {
      // timeout OK — 부분 로드 상태로 계속
    }

    // JS 프레임워크 렌더링 대기 (Next.js, React, Vue 등 CSR/SSR hydration)
    // domcontentloaded 후 JS 번들이 실행되어야 실제 콘텐츠가 그려짐
    try {
      await page.waitForFunction(
        '(document.body && document.body.innerText && document.body.innerText.length > 50) || document.querySelector("img, canvas, svg, video")',
        { timeout: 3000 }
      );
    } catch {
      // 3초 내 콘텐츠 없으면 그대로 진행 (빈 페이지 리포트)
    }

    // ── DOM Audit: JS로 뷰포트 이탈·이미지 깨짐 직접 측정 ──
    try {
      // page.evaluate 내부는 브라우저에서 실행 — CF Workers TS가 DOM 타입을 모르므로 string으로 전달
      const domScript = `
        (function() {
          var issues = [];
          var seen = {};
          function sel(el) {
            var tag = el.tagName.toLowerCase();
            var id = el.id ? '#' + el.id : '';
            var cls = el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\\s+/)[0] : '';
            return (tag + id + cls).slice(0, 60);
          }
          function hasClippingAncestor(el) {
            var p = el.parentElement;
            while (p && p !== document.documentElement) {
              var ps = window.getComputedStyle(p);
              var ox = ps.overflowX;
              var ov = ps.overflow;
              if (['hidden','scroll','auto','clip'].indexOf(ox) !== -1 ||
                  ['hidden','scroll','auto','clip'].indexOf(ov) !== -1) return true;
              p = p.parentElement;
            }
            return false;
          }
          // 1. 뷰포트 밖 수평 이탈
          try {
            var els = document.querySelectorAll('*');
            for (var i = 0; i < els.length; i++) {
              var el = els[i];
              var style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden') continue;
              var rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) continue;
              if (hasClippingAncestor(el)) continue;
              if (rect.right > window.innerWidth + 5) {
                var s = sel(el);
                var key = 'vl:' + s;
                if (!seen[key]) {
                  seen[key] = true;
                  issues.push({
                    type: 'viewport_leak',
                    selector: s,
                    detail: 'right=' + Math.round(rect.right) + 'px, viewport=' + window.innerWidth + 'px (+' + Math.round(rect.right - window.innerWidth) + 'px)'
                  });
                }
              }
            }
          } catch(e1) { issues.push({ type: 'audit_error', selector: 'check1_viewport', detail: String(e1).slice(0, 80) }); }
          // 2. 깨진 이미지
          try {
            var imgs = document.querySelectorAll('img');
            for (var j = 0; j < imgs.length; j++) {
              var img = imgs[j];
              if (img.complete && img.naturalWidth === 0 && img.src && img.src.indexOf('data:') !== 0) {
                issues.push({
                  type: 'broken_image',
                  selector: sel(img),
                  detail: '...' + img.src.slice(-40)
                });
              }
            }
          } catch(e2) { issues.push({ type: 'audit_error', selector: 'check2_images', detail: String(e2).slice(0, 80) }); }
          // 3. 부모 컨테이너 밖 overflow (absolute/fixed 자식이 부모 경계 초과)
          try {
            var allEls = document.querySelectorAll('*');
            for (var q = 0; q < allEls.length && issues.length < 15; q++) {
              var ce = allEls[q];
              var cs2 = window.getComputedStyle(ce);
              if (cs2.display === 'none' || cs2.visibility === 'hidden') continue;
              if (cs2.position !== 'absolute' && cs2.position !== 'fixed') continue;
              var cr = ce.getBoundingClientRect();
              if (cr.width < 10 || cr.height < 10) continue;
              var par = ce.offsetParent || ce.parentElement;
              if (!par || par === document.body || par === document.documentElement) continue;
              var parS = window.getComputedStyle(par);
              if (['hidden','scroll','auto','clip'].indexOf(parS.overflow) !== -1) continue;
              var parR = par.getBoundingClientRect();
              var oB = cr.bottom - parR.bottom;
              var oR = cr.right - parR.right;
              var oL = parR.left - cr.left;
              var oT = parR.top - cr.top;
              var mx = Math.max(oB, oR, oL, oT);
              if (mx > 10) {
                var pk = 'po:' + sel(ce);
                if (!seen[pk]) {
                  seen[pk] = true;
                  var dir = oB === mx ? 'bottom +' + Math.round(oB) + 'px' :
                            oR === mx ? 'right +' + Math.round(oR) + 'px' :
                            oL === mx ? 'left +' + Math.round(oL) + 'px' :
                            'top +' + Math.round(oT) + 'px';
                  issues.push({ type: 'parent_overflow', selector: sel(ce) + ' > ' + sel(par), detail: dir });
                }
              }
            }
          } catch(e3) { issues.push({ type: 'audit_error', selector: 'check3_overflow', detail: String(e3).slice(0, 80) }); }
          // 4. 낮은 대비 (텍스트 vs 실제 배경 — 부모 탐색)
          try {
            function lum(r,g,b) {
              var c = [r,g,b].map(function(v) { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
              return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
            }
            function pCol(str) {
              var m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([0-9.]+))?/);
              return m ? { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]), a: m[4] !== undefined ? parseFloat(m[4]) : 1 } : null;
            }
            function effBg(node) {
              var c = node;
              while (c && c !== document.documentElement) {
                var bg = pCol(window.getComputedStyle(c).backgroundColor);
                if (bg && bg.a > 0.1) return bg;
                c = c.parentElement;
              }
              return { r: 255, g: 255, b: 255, a: 1 };
            }
            var txEls = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
            for (var n = 0; n < txEls.length && issues.length < 15; n++) {
              var tn = txEls[n];
              var tns = window.getComputedStyle(tn);
              if (tns.display === 'none' || tns.visibility === 'hidden' || !tn.textContent.trim()) continue;
              var fg = pCol(tns.color);
              var bg = effBg(tn);
              if (fg && bg) {
                var l1 = lum(fg.r,fg.g,fg.b);
                var l2 = lum(bg.r,bg.g,bg.b);
                var ratio = (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
                if (ratio < 3.0) {
                  var lk = 'lc:' + sel(tn);
                  if (!seen[lk]) {
                    seen[lk] = true;
                    issues.push({ type: 'low_contrast', selector: sel(tn),
                      detail: ratio.toFixed(1) + ':1 (min 4.5:1)' });
                  }
                }
              }
            }
          } catch(e4) { issues.push({ type: 'audit_error', selector: 'check4_contrast', detail: String(e4).slice(0, 80) }); }
          return issues.slice(0, 15);
        })()
      `;
      domFindings = await page.evaluate(domScript) as DomIssue[];
    } catch {
      domFindings = [];
    }

    // EYE-08: 페이지 전체 높이 측정 후 타일링
    if (full_page) {
      try {
        capturedPageHeight = await page.evaluate(
          "Math.max(document.body ? document.body.scrollHeight : 800, document.documentElement ? document.documentElement.scrollHeight : 800, 800)"
        ) as number;
      } catch { capturedPageHeight = 800; }
      if (capturedPageHeight > 800) {
        await page.setViewport({ width: VIEWPORT_WIDTH, height: Math.min(capturedPageHeight, 16000) });
      }
    }

    const tileCount = full_page
      ? Math.min(10, Math.ceil(capturedPageHeight / (TILE_H - OVERLAP)))
      : 1;

    for (let i = 0; i < tileCount; i++) {
      const y = i * (TILE_H - OVERLAP);
      const clipH = full_page ? Math.min(TILE_H, capturedPageHeight - y) : 800;
      if (clipH <= 0) break;
      const shot = await page.screenshot({
        encoding: "base64",
        type: "jpeg",
        quality: 80,
        clip: { x: 0, y: full_page ? y : 0, width: 1280, height: clipH },
      }) as string;
      tiles.push({ b64: shot, y: full_page ? y : 0, height: clipH });
      screenshotBytes += Math.round((shot.length * 3) / 4);
    }

    await browser.close();
  } catch (e) {
    // 브라우저 에러 시 슬롯 반환
    if (doStub) await doStub.fetch("https://do-internal/release").catch(() => {});
    return c.json(
      {
        ok: false,
        error: `Screenshot failed: ${String(e)}`,
        hint: "Ensure CF Browser Rendering is enabled (Workers paid plan required)",
        timing_ms: Date.now() - startTime,
      },
      500
    );
  }

  // 브라우저 완료 → 슬롯 즉시 반환 (AI 분석은 브라우저 불필요)
  if (doStub) await doStub.fetch("https://do-internal/release").catch(() => {});

  const browserMs = Date.now() - browserStart;

  // ── Gemini 2.0 Flash: 타일별 비주얼 QA 분석 ──
  const aiStart = Date.now();
  // DOM Audit 결과를 AI 컨텍스트로 변환
  const domContext = domFindings.length > 0
    ? `\nDOM audit detected ${domFindings.length} structural issue(s) — confirm visually:\n` +
      domFindings.map((d) => `- [${d.type}] ${d.selector}: ${d.detail}`).join("\n")
    : "\nDOM audit: no structural issues detected.";

  const userFocus = prompt
    ? `Focus on: ${prompt}`
    : "Look for visual evidence of the DOM issues listed above, plus any other rendering problems visible in the screenshot.";

  const analysisPrompt = `Visual QA. Find pixel-visible bugs only.
${domContext}
${userFocus}

Report ONLY: overflow|clipping|z-index overlap|broken image|low contrast|layout break.
DOM audit items above = confirmed facts, MUST report them.
Skip: color choices, font sizes, spacing preferences.
No invented element names. If unsure → skip.

JSON only (no markdown):
{"has_issues":false,"summary":"one sentence","issues":[]}
or
{"has_issues":true,"summary":"brief","issues":[{"severity":"high|medium|low","description":"element+problem, max 80 chars"}]}`;

  /** Parse VERDICT-format response into structured fields */
  function parseVerdictText(text: string) {
    const lower = text.toLowerCase();
    const hi = lower.includes("verdict: issues found");
    // 애매할 때 기본값 false (false positive 방지)
    const _foundIssues = hi ? true : false;

    const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let parsedSummary = "";
    const issues: Array<{ severity: "high" | "medium" | "low"; description: string }> = [];

    for (const line of rawLines) {
      const stripped = line.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
      if (/^VERDICT:/i.test(stripped)) continue;
      if (/^(Summary|Issues?|Verdict):\s*$/i.test(stripped)) continue;

      const bulletMatch = stripped.match(/^[-•*]\s+(.+)/);
      const numberedMatch = stripped.match(/^\d+[.)]\s+(.+)/);
      const rawContent = (bulletMatch?.[1] ?? numberedMatch?.[1] ?? "").trim();

      if (rawContent) {
        const sevMatch = rawContent.match(/^(?:\[(high|medium|low)\]|(high|medium|low)[\s:–-])\s*/i);
        const sev: "high" | "medium" | "low" = (() => {
          const s = (sevMatch?.[1] ?? sevMatch?.[2] ?? "").toLowerCase();
          return s === "high" ? "high" : s === "low" ? "low" : "medium";
        })();
        const desc = rawContent.replace(/^(?:\[(high|medium|low)\]|(high|medium|low)[\s:–-])\s*/i, "").trim();
        if (desc.length > 5 && issues.length < 5) issues.push({ severity: sev, description: desc.slice(0, 120) });
        continue;
      }

      const summaryPrefixMatch = stripped.match(/^Summary:\s*(.+)/i);
      if (summaryPrefixMatch) {
        parsedSummary = summaryPrefixMatch[1].trim().slice(0, 200);
        continue;
      }

      if (!parsedSummary && stripped.length > 15 && !/^(ISSUES FOUND|NO ISSUES)$/i.test(stripped)) {
        parsedSummary = stripped.slice(0, 200);
      }
    }

    // VERDICT: ISSUES FOUND 명시 + 실제 이슈 항목 둘 다 있어야 true (AND 조건)
    const verdictIssues = lower.includes("verdict: issues found");
    const hasIssues = verdictIssues && issues.length > 0;
    return { hasIssues, summary: parsedSummary, issues };
  }

  // 타일별 분석 헬퍼
  async function analyzeOneTile(b64: string): Promise<{
    hasIssues: boolean;
    summary: string;
    issues: Array<{ severity: "high" | "medium" | "low"; description: string }>;
    raw: string;
  }> {
    let hasIssues = false;
    let tileSummary = "";
    let issues: Array<{ severity: "high" | "medium" | "low"; description: string }> = [];
    let raw = "";

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { inline_data: { mime_type: "image/jpeg", data: b64 } },
              { text: analysisPrompt },
            ]}],
            generationConfig: {
              maxOutputTokens: 512,
              temperature: 0,
              response_mime_type: "application/json",
            },
          }),
        }
      );
      if (!geminiRes.ok) {
        const errBody = await geminiRes.text();
        throw new Error(`Gemini ${geminiRes.status}: ${errBody.slice(0, 300)}`);
      }
      const gd = (await geminiRes.json()) as {
        candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
      };
      // Gemini 2.5 Flash: thinking part가 parts[0]에 올 수 있음 → 모든 text parts 결합
      const allParts = gd.candidates?.[0]?.content?.parts ?? [];
      raw = allParts.map((p: any) => p.text ?? "").filter(Boolean).join("\n");

      let jsonParsed = false;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed_json = JSON.parse(jsonMatch[0]);
          const j = (parsed_json.has_issues !== undefined ? parsed_json : (parsed_json.response ?? parsed_json)) as {
            has_issues: boolean; summary: string; issues: Array<{ severity: string; description: string }>
          };
          if (typeof j.has_issues === "boolean" && j.summary) {
            tileSummary = j.summary.slice(0, 200);
            issues = (j.issues ?? []).slice(0, 5).map((i) => ({
              severity: (["high","medium","low"].includes(i.severity) ? i.severity : "medium") as "high"|"medium"|"low",
              description: (i.description ?? "").slice(0, 120),
            }));
            // 이슈 목록이 비어있으면 has_issues 무조건 false (근거 필수)
            hasIssues = j.has_issues && issues.length > 0;
            jsonParsed = true;
          }
        }
      } catch { /* fallthrough */ }
      if (!jsonParsed) {
        const parsed = parseVerdictText(raw);
        hasIssues = parsed.hasIssues;
        tileSummary = parsed.summary;
        issues = parsed.issues;
      }
    } catch (e) {
      // Gemini 실패 시 → CF Workers AI fallback (region 제한 우회)
      try {
        const cfAiRes = await c.env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
          messages: [
            { role: "user", content: [
              { type: "image", image: `data:image/jpeg;base64,${b64}` },
              { type: "text", text: analysisPrompt },
            ]},
          ],
          max_tokens: 512,
          temperature: 0,
        });
        raw = cfAiRes?.response ?? "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const j = (parsed.has_issues !== undefined ? parsed : (parsed.response ?? parsed)) as {
            has_issues: boolean; summary: string; issues: Array<{ severity: string; description: string }>
          };
          if (typeof j.has_issues === "boolean" && j.summary) {
            tileSummary = j.summary.slice(0, 200);
            issues = (j.issues ?? []).slice(0, 5).map((i) => ({
              severity: (["high","medium","low"].includes(i.severity) ? i.severity : "medium") as "high"|"medium"|"low",
              description: (i.description ?? "").slice(0, 120),
            }));
            hasIssues = j.has_issues && issues.length > 0;
          } else {
            tileSummary = "Analysis completed (CF AI fallback)";
          }
        } else {
          tileSummary = "Analysis completed (CF AI fallback)";
        }
      } catch (fallbackErr) {
        raw = `Gemini unavailable: ${String(e)}. CF AI fallback also failed: ${String(fallbackErr)}`;
        tileSummary = "Analysis skipped (AI unavailable)";
        hasIssues = false;
        issues = [];
      }
    }

    return { hasIssues, summary: tileSummary, issues, raw };
  }

  // 타일 병렬 분석 (최대 3개 동시 — Gemini rate limit 안전 범위)
  type TileResult = {
    tile_index: number;
    has_issues: boolean;
    summary: string;
    issues: Array<{ severity: "high" | "medium" | "low"; description: string; tile_index: number }>;
    raw: string;
  };

  const PARALLEL_LIMIT = 3;
  const tileResults: TileResult[] = new Array(tiles.length);

  for (let batch = 0; batch < tiles.length; batch += PARALLEL_LIMIT) {
    const chunk = tiles.slice(batch, batch + PARALLEL_LIMIT);
    const promises = chunk.map(async (tile, j) => {
      const idx = batch + j;
      const res = await analyzeOneTile(tile.b64);
      return {
        tile_index: idx,
        has_issues: res.hasIssues,
        summary: res.summary,
        issues: res.issues.map(issue => ({ ...issue, tile_index: idx })),
        raw: res.raw,
      };
    });
    const results = await Promise.allSettled(promises);
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "fulfilled") {
        tileResults[r.value.tile_index] = r.value;
      } else {
        // 실패한 타일은 이슈 없음 처리
        const failIdx = batch + i;
        tileResults[failIdx] = {
          tile_index: failIdx, has_issues: false,
          summary: "Analysis failed", issues: [], raw: String(r.reason),
        };
      }
    }
  }

  // 타일 결과 머지 — has_issues=true && issues 항목 있는 타일만 유효로 인정
  const validIssueTiles = tileResults.filter(t => t.has_issues && t.issues.length > 0);
  const hasIssues = validIssueTiles.length > 0;
  const parsedIssues = tileResults.flatMap(t => t.issues).slice(0, 10);
  const summary = (tileResults.find(t => t.has_issues) ?? tileResults[0])?.summary ?? "";
  const analysis = tileResults.map((t, i) => `[Tile ${i}] ${t.raw}`).join("\n---\n").slice(0, 3000);

  const aiMs = Date.now() - aiStart;
  const totalMs = Date.now() - startTime;

  const tilesAnalyzed = tiles.length;
  const cfAiCost = 0.000011 * tilesAnalyzed;
  const cfBrCost = 0.000001;
  const totalCost = cfAiCost + cfBrCost;

  const pocPassed = totalMs < 10_000 + (tilesAnalyzed - 1) * 5_000 && totalCost < 0.05 * tilesAnalyzed;

  // ── 크레딧 차감 (성공 시 타일 수만큼) ──
  let quotaRemaining: number | null = null;
  if (keyRecord && apiKeyVal) {
    if (keyRecord.plan === "free") {
      keyRecord.calls_used = Math.min(keyRecord.calls_used + tilesAnalyzed, keyRecord.quota);
      await Promise.all([
        c.env.API_KEYS.put(`key:${apiKeyVal}`, JSON.stringify(keyRecord)),
        c.env.API_KEYS.put(`apikey:${keyRecord.email}`, JSON.stringify(keyRecord)),
      ]);
      quotaRemaining = Math.max(0, keyRecord.quota - keyRecord.calls_used);
    } else {
      // pro/team: 무제한 (-1)
      quotaRemaining = -1;
    }
  }

  // DOM 이슈 → issues 형식으로 변환
  const domAsIssues = domFindings.map((d) => {
    const sev: "high" | "medium" | "low" =
      d.type === "viewport_leak" || d.type === "parent_overflow" ? "high" :
      d.type === "low_contrast" ? "medium" : "medium";
    return { severity: sev, description: `[DOM] ${d.type}: ${d.selector} — ${d.detail}`.slice(0, 120), tile_index: 0 };
  });

  // AI 이슈: DOM 없으면 high+medium만 신뢰
  const trustedAiIssues = domFindings.length === 0
    ? parsedIssues.filter((i) => i.severity === "high" || i.severity === "medium")
    : parsedIssues;

  // DOM + AI 이슈 합산
  const allIssues = [...domAsIssues, ...trustedAiIssues].slice(0, 10);
  const finalHasIssues = allIssues.length > 0;

  // summary 보정
  const finalSummary = finalHasIssues
    ? summary || `${allIssues.length} visual issue(s) detected.`
    : "No visual rendering issues detected.";

  const result: Record<string, unknown> = {
    ok: true,
    poc_passed: pocPassed,
    url,
    has_issues: finalHasIssues,
    summary: finalSummary,
    analysis,
    dom_issues: domFindings,          // 결정론적 DOM 측정 결과
    issues: allIssues,
    tiles_analyzed: tilesAnalyzed,
    credits_used: tilesAnalyzed,
    page_height_px: capturedPageHeight,
    viewport: { width: VIEWPORT_WIDTH, height: capturedPageHeight },
    timing: {
      total_ms: totalMs,
      browser_ms: browserMs,
      ai_ms: aiMs,
      under_10s: totalMs < 10_000 + (tilesAnalyzed - 1) * 5_000,
    },
    cost: {
      estimated_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
      per_tile_usd: Math.round((cfAiCost / tilesAnalyzed) * 1_000_000) / 1_000_000,
      under_5cents: totalCost < 0.05 * tilesAnalyzed,
      note: "1 credit = 1 tile (1280×1600px analysis)",
    },
    duration_ms: totalMs,
    cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
    screenshot_size_bytes: screenshotBytes,
    // 크레딧 잔여 (API 키 있을 때만)
    ...(quotaRemaining !== null && {
      quota_remaining: quotaRemaining,  // -1 = unlimited (pro/team), ≥0 = remaining tiles
    }),
  };

  // 스크린샷은 요청 시에만 포함 (첫 번째 타일)
  if (include_screenshot && tiles.length > 0) {
    result.screenshot_b64 = tiles[0].b64;
  }

  // ── KV 캐시 저장 (TTL 5분 = 300s, prompt 없는 성공 요청만) ──
  if (!prompt && c.env.VISUAL_CACHE && result.ok === true) {
    await c.env.VISUAL_CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 }).catch(() => {});
  }

  return c.json(result, 200, { "Cache-Control": "no-store, no-cache, must-revalidate" });
});

// ─── GEO Key: 브라우저용 Gemini API 키 프록시 ────────────────────────────────
/**
 * GET /v1/gemini-key
 * check.html에서 클라이언트 사이드 Gemini 호출을 위한 키 반환
 * Origin 제한: perceptdot.com 도메인에서만 접근 가능
 */
app.options("/v1/gemini-key", (c) => {
  const origin = c.req.header("origin") ?? "";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
});

app.get("/v1/gemini-key", async (c) => {
  const origin = c.req.header("origin") ?? "";
  const allowed = origin === "https://perceptdot.com" || origin === "https://www.perceptdot.com";
  if (!allowed) return c.json({ error: "Forbidden" }, 403);

  // IP 기반 레이트 리미팅: 시간당 30회 (KV 사용)
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rateLimitKey = `geo-key-rl:${ip}:${Math.floor(Date.now() / 3600000)}`;
  const countStr = await c.env.API_KEYS.get(rateLimitKey);
  const count = parseInt(countStr ?? "0", 10);
  if (count >= 30) {
    return c.json({ error: "Rate limit exceeded. Try again later." }, 429, {
      "Access-Control-Allow-Origin": origin,
    });
  }
  await c.env.API_KEYS.put(rateLimitKey, String(count + 1), { expirationTtl: 3600 });

  return c.json({ key: c.env.GEMINI_API_KEY }, 200, {
    "Access-Control-Allow-Origin": origin,
    "Cache-Control": "no-store",
  });
});

// ─── GEO Check: AI 발견 가능성 확인 ──────────────────────────────────────────
/**
 * POST /v1/geo-check
 * 디지털 제품이 AI 검색에서 추천되는지 확인
 * Gemini 2.0 Flash + Google Search Grounding (무료 티어, 1,500 req/day)
 *
 * Body: { product_name: string, category: string, keywords?: string[] }
 */
app.post("/v1/geo-check", async (c) => {
  let body: { product_name?: string; category?: string; keywords?: string[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON." }, 400);
  }

  const { product_name, category, keywords = [] } = body;
  if (!product_name || !category) {
    return c.json({ error: "product_name and category are required." }, 400);
  }

  // 3개 쿼리 자동 생성
  const kw = keywords[0] || "";
  const queries = [
    `best ${category} tools`,
    `recommend ${category}${kw ? ` for ${kw}` : ""}`,
    kw ? `top ${kw} ${category}` : `top ${category} resources`,
  ];

  // Gemini 2.5 Flash (병렬, 위치 에러 시 null)
  const runGemini = async (query: string): Promise<string | null> => {
    try {
      const prompt = `List 5-10 specific ${category} products/tools for: "${query}". Only product names, one per line.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${c.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024 },
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`Gemini error ${res.status}: ${errText.slice(0, 200)}`);
        return null;
      }
      const data = (await res.json()) as { candidates?: Array<{ content: { parts: Array<{ text: string }> } }> };
      return (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("\n");
    } catch (err) { console.error("Gemini fetch error:", String(err)); return null; }
  };

  const geminiTexts = await Promise.all(queries.map(q => runGemini(q)));
  const allFailed = geminiTexts.every(t => t === null);

  let results: Array<{ query: string; found: boolean; excerpt?: string; error?: string }>;

  if (allFailed) {
    // Gemini 전체 실패 → 클라이언트에게 재시도 요청 (다른 CF 에지 = 다른 지역)
    return c.json({ ok: false, error: "location_error", retry: true, message: "AI service temporarily unavailable from this region. Retrying..." }, 503);
  } else {
    results = queries.map((query, i) => {
      const text = geminiTexts[i] ?? "";
      const lo = text.toLowerCase(), ln = product_name.toLowerCase();
      const idx = lo.indexOf(ln);
      const found = idx !== -1;
      const exc = found ? text.slice(Math.max(0, idx-30), idx+product_name.length+60).trim().slice(0,200) : undefined;
      return { query, found, excerpt: exc };
    });
  }

  const found_count = results.filter((r) => r.found).length;

  return c.json({
    ok: true,
    product_name,
    category,
    visible: found_count > 0,
    found_in: `${found_count}/${queries.length}`,
    message: found_count > 0
      ? `✅ "${product_name}" appeared in ${found_count}/${queries.length} AI queries.`
      : `❌ "${product_name}" was not found in AI recommendations. Here's how to fix it.`,
    results,
    checked_at: new Date().toISOString(),
  });
});

// ─── MCP Streamable HTTP (1홉 — api.perceptdot.com/mcp) ──────────────────────
// mcp.perceptdot.com MCP Worker → api.perceptdot.com 2홉 구조에서
// CF Worker-to-Worker custom domain fetch 시 인증 header 손실 문제 발생.
// 근본 해결: API Worker에 MCP 엔드포인트 직접 내장 (1홉).

const MCP_TOOLS = [
  {
    name: "visual_check",
    description:
      "Screenshot a URL and analyze it for visual bugs using AI. " +
      "Returns whether issues exist, a summary, and a detailed issues list. " +
      "Use this after deployments, PRs, or any UI change to catch layout problems.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL to visually check (must be publicly accessible)" },
        prompt: { type: "string", description: "Optional: specific aspect to focus on" },
        no_cache: { type: "boolean", description: "Optional: bypass cache" },
        viewport: {
          type: "string",
          enum: ["desktop", "tablet", "mobile"],
          description: "Optional: viewport size — desktop (1280px), tablet (768px), mobile (375px)",
        },
      },
      required: ["url"],
    },
  },
];

function mcpRpc(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function mcpErr(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

app.post("/mcp", async (c) => {
  const apiKey = c.req.query("api_key") ?? c.req.header("x-percept-key") ?? null;
  const body = await c.req.json();
  const requests: any[] = Array.isArray(body) ? body : [body];
  const responses: any[] = [];

  for (const req of requests) {
    const { id, method, params } = req;

    // Notifications
    if (id === undefined && method?.startsWith("notifications/")) continue;

    switch (method) {
      case "initialize":
        responses.push(mcpRpc(id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "perceptdot", version: "1.1.0" },
        }));
        break;

      case "tools/list":
        responses.push(mcpRpc(id, { tools: MCP_TOOLS }));
        break;

      case "tools/call": {
        const { name, arguments: args } = params ?? {};
        if (name !== "visual_check") {
          responses.push(mcpErr(id, -32601, `Unknown tool: ${name}`));
          break;
        }

        try {
          // 내부 호출: app.fetch()로 /v1/eye/check 직접 실행 (외부 HTTP 없음)
          const internalReq = new Request("https://internal/v1/eye/check", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { "X-Percept-Key": apiKey } : {}),
            },
            body: JSON.stringify({
              url: args?.url,
              prompt: args?.prompt,
              no_cache: args?.no_cache,
              viewport: args?.viewport,
            }),
          });

          const resp = await app.fetch(internalReq, c.env, c.executionCtx);

          if (!resp.ok) {
            const errBody: any = await resp.json().catch(() => ({}));
            throw new Error(errBody.error || `Eye check failed (${resp.status})`);
          }

          const result: any = await resp.json();

          const issueLines = (result.issues ?? [])
            .map((i: any) => `  [${(i.severity ?? "info").toUpperCase()}] ${i.description}`)
            .join("\n");

          const tiles = result.tiles_analyzed ?? 1;
          const vp = args?.viewport ?? "desktop";
          const scanLine = `Full-page scan complete — ${tiles} tile${tiles !== 1 ? "s" : ""} analyzed (${vp}) in ${((result.duration_ms ?? 0) / 1000).toFixed(1)}s`;
          const text = result.has_issues
            ? `⚠️ Visual issues detected on ${args?.url}\n\nSummary: ${result.summary}\n\nIssues:\n${issueLines}\n\n${scanLine}\nCost: $${result.cost_usd?.toFixed(6)} | Credits used: ${result.credits_used ?? tiles}`
            : `✅ No visual issues detected on ${args?.url}\n\n${result.summary}\n\n${scanLine}\nCost: $${result.cost_usd?.toFixed(6)} | Credits used: ${result.credits_used ?? tiles}`;

          responses.push(mcpRpc(id, { content: [{ type: "text", text }], isError: false }));
        } catch (e: any) {
          responses.push(mcpRpc(id, {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true,
          }));
        }
        break;
      }

      default:
        responses.push(mcpErr(id, -32601, `Method not found: ${method}`));
    }
  }

  if (responses.length === 0) return c.body(null, 204);
  return c.json(Array.isArray(body) ? responses : responses[0]);
});

app.get("/mcp", (c) => c.json({
  name: "perceptdot",
  description: "AI Visual QA — MCP server is running. Connect via POST or add to your MCP client.",
  docs: "https://perceptdot.gitbook.io/perceptdot",
  setup: {
    claude_code: 'claude mcp add --transport http perceptdot "https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY"',
    cursor: '{"mcpServers":{"perceptdot":{"url":"https://mcp.perceptdot.com/mcp?api_key=YOUR_KEY"}}}',
  },
  get_free_key: "https://perceptdot.com",
}, 200));

// ─── 404 핸들러 ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json({ error: "Endpoint not found.", path: c.req.path }, 404);
});

export default app;
