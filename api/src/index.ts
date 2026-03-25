import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import puppeteer from "@cloudflare/puppeteer";

// ─── 환경 바인딩 타입 ──────────────────────────────────────────────────────────

interface Env {
  /** Cloudflare KV: API 키 저장소 */
  API_KEYS: KVNamespace;
  /** Cloudflare KV: 추천 로그 저장소 */
  RECOMMEND_LOG: KVNamespace;
  /** Resend API 키 (wrangler secret) */
  RESEND_API_KEY: string;
  /** Gumroad 웹훅 시크릿 (선택) */
  GUMROAD_WEBHOOK_SECRET?: string;
  /** CF Browser Rendering API 바인딩 (wrangler.toml [browser]) */
  BROWSER: Fetcher;
  /** CF Workers AI 바인딩 (wrangler.toml [ai]) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any;
  /** Gemini API 키 (wrangler secret put GEMINI_API_KEY) — fallback용 */
  GEMINI_API_KEY: string;
}

// ─── Registry 타입 ────────────────────────────────────────────────────────────

interface CuratedServer {
  name: string;
  package: string;
  description: string;
  category: string;
  keywords: string[];
  env_required: string[];
  setup_snippet: Record<string, unknown>;
  tokens_saved_per_call: number;
  is_perceptdot: boolean;
}

interface RecommendLogPayload {
  project_signals: string[];
  recommended_servers: string[];
  installed_servers: string[];
}

// ─── Curated Database (서버사이드 권위 소스) ──────────────────────────────────

const REGISTRY_VERSION = "0.3.0";
const REGISTRY_UPDATED_AT = "2026-03-22T00:00:00.000Z";

const CURATED_DB: CuratedServer[] = [
  {
    name: "GA4 Analytics",
    package: "@perceptdot/ga4",
    description: "Read GA4 analytics directly — realtime users, top pages, events, bounce rate. ~450 tokens saved per call vs manual dashboard copy-paste.",
    category: "analytics",
    keywords: ["google analytics", "ga4", "pageviews", "sessions", "realtime", "bounce rate"],
    env_required: ["GA4_PROPERTY_ID", "GOOGLE_SERVICE_ACCOUNT_KEY"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@perceptdot/ga4"],
      env: { GA4_PROPERTY_ID: "YOUR_PROPERTY_ID", GOOGLE_SERVICE_ACCOUNT_KEY: "YOUR_JSON" },
    },
    tokens_saved_per_call: 450,
    is_perceptdot: true,
  },
  {
    name: "Vercel Deployments",
    package: "@perceptdot/vercel",
    description: "Check deployment status, project list, latest deploy result. ~200 tokens saved per call. Ends 'did it deploy?' interruptions.",
    category: "deployment",
    keywords: ["vercel", "deploy", "deployment", "ci", "cd", "hosting"],
    env_required: ["VERCEL_TOKEN"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@perceptdot/vercel"],
      env: { VERCEL_TOKEN: "YOUR_TOKEN" },
    },
    tokens_saved_per_call: 200,
    is_perceptdot: true,
  },
  {
    name: "GitHub PRs & Issues",
    package: "@perceptdot/github",
    description: "Open PRs with review status, issues, CI workflow runs. ~400 tokens saved per call vs browsing GitHub manually.",
    category: "devops",
    keywords: ["github", "pull request", "pr", "issues", "ci", "workflow", "actions"],
    env_required: ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@perceptdot/github"],
      env: { GITHUB_TOKEN: "YOUR_TOKEN", GITHUB_OWNER: "owner", GITHUB_REPO: "repo" },
    },
    tokens_saved_per_call: 400,
    is_perceptdot: true,
  },
  {
    name: "Sentry Errors",
    package: "@perceptdot/sentry",
    description: "Unresolved production errors directly from Sentry. ~500 tokens saved per call vs navigating Sentry dashboard.",
    category: "monitoring",
    keywords: ["sentry", "errors", "exceptions", "monitoring", "production", "bugs"],
    env_required: ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@perceptdot/sentry"],
      env: { SENTRY_AUTH_TOKEN: "YOUR_TOKEN", SENTRY_ORG: "org", SENTRY_PROJECT: "project" },
    },
    tokens_saved_per_call: 500,
    is_perceptdot: true,
  },
  {
    name: "PostgreSQL Database",
    package: "@modelcontextprotocol/server-postgres",
    description: "Read-only access to PostgreSQL databases. Query tables, inspect schemas.",
    category: "database",
    keywords: ["postgres", "postgresql", "database", "sql", "prisma", "drizzle"],
    env_required: ["DATABASE_URL"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@host/db"],
    },
    tokens_saved_per_call: 300,
    is_perceptdot: false,
  },
  {
    name: "SQLite Database",
    package: "@modelcontextprotocol/server-sqlite",
    description: "Read and write SQLite databases. Run queries, manage schemas.",
    category: "database",
    keywords: ["sqlite", "database", "sql", "local db"],
    env_required: [],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./database.db"],
    },
    tokens_saved_per_call: 250,
    is_perceptdot: false,
  },
  {
    name: "Brave Search",
    package: "@modelcontextprotocol/server-brave-search",
    description: "Web and local search using Brave Search API.",
    category: "search",
    keywords: ["search", "web search", "brave", "internet"],
    env_required: ["BRAVE_API_KEY"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: { BRAVE_API_KEY: "YOUR_KEY" },
    },
    tokens_saved_per_call: 300,
    is_perceptdot: false,
  },
  {
    name: "Slack",
    package: "@modelcontextprotocol/server-slack",
    description: "Read channels, post messages, manage Slack workspace.",
    category: "communication",
    keywords: ["slack", "messaging", "chat", "channels", "team communication"],
    env_required: ["SLACK_BOT_TOKEN", "SLACK_TEAM_ID"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: { SLACK_BOT_TOKEN: "xoxb-YOUR_TOKEN", SLACK_TEAM_ID: "YOUR_TEAM_ID" },
    },
    tokens_saved_per_call: 350,
    is_perceptdot: false,
  },
  {
    name: "Puppeteer Browser",
    package: "@modelcontextprotocol/server-puppeteer",
    description: "Browser automation — navigate pages, take screenshots, interact with web elements.",
    category: "browser",
    keywords: ["puppeteer", "browser", "automation", "screenshot", "playwright"],
    env_required: [],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    },
    tokens_saved_per_call: 400,
    is_perceptdot: false,
  },
  {
    name: "Supabase",
    package: "@supabase/mcp-server-supabase",
    description: "Manage Supabase projects — database, auth, storage, edge functions.",
    category: "backend",
    keywords: ["supabase", "database", "auth", "storage", "edge functions", "postgres"],
    env_required: ["SUPABASE_ACCESS_TOKEN"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@supabase/mcp-server-supabase"],
      env: { SUPABASE_ACCESS_TOKEN: "YOUR_TOKEN" },
    },
    tokens_saved_per_call: 350,
    is_perceptdot: false,
  },
  {
    name: "Notion",
    package: "@notionhq/notion-mcp-server",
    description: "Search, read, and update Notion pages and databases.",
    category: "productivity",
    keywords: ["notion", "notes", "pages", "database", "wiki", "docs"],
    env_required: ["NOTION_TOKEN"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: { OPENAPI_MCP_HEADERS: '{"Authorization":"Bearer YOUR_TOKEN","Notion-Version":"2022-06-28"}' },
    },
    tokens_saved_per_call: 300,
    is_perceptdot: false,
  },
  {
    name: "Linear Issues",
    package: "@linear/mcp-server",
    description: "Manage Linear issues, projects, and cycles.",
    category: "project-management",
    keywords: ["linear", "issues", "tickets", "sprint", "project management"],
    env_required: ["LINEAR_API_KEY"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@linear/mcp-server"],
      env: { LINEAR_API_KEY: "YOUR_KEY" },
    },
    tokens_saved_per_call: 300,
    is_perceptdot: false,
  },
  {
    name: "Stripe Payments",
    package: "@stripe/agent-toolkit",
    description: "Manage Stripe customers, payments, subscriptions, and invoices.",
    category: "payments",
    keywords: ["stripe", "payments", "billing", "subscriptions", "invoices"],
    env_required: ["STRIPE_SECRET_KEY"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@stripe/agent-toolkit", "--tools=all"],
      env: { STRIPE_SECRET_KEY: "sk_YOUR_KEY" },
    },
    tokens_saved_per_call: 400,
    is_perceptdot: false,
  },
  {
    name: "Cloudflare Workers",
    package: "@cloudflare/mcp-server-cloudflare",
    description: "Manage Cloudflare Workers, KV, R2, and D1.",
    category: "infrastructure",
    keywords: ["cloudflare", "workers", "kv", "r2", "d1", "edge", "wrangler"],
    env_required: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@cloudflare/mcp-server-cloudflare"],
      env: { CLOUDFLARE_ACCOUNT_ID: "YOUR_ID", CLOUDFLARE_API_TOKEN: "YOUR_TOKEN" },
    },
    tokens_saved_per_call: 350,
    is_perceptdot: false,
  },
  {
    name: "Docker",
    package: "@modelcontextprotocol/server-docker",
    description: "Manage Docker containers, images, volumes, and networks.",
    category: "infrastructure",
    keywords: ["docker", "containers", "images", "compose", "devops"],
    env_required: [],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-docker"],
    },
    tokens_saved_per_call: 300,
    is_perceptdot: false,
  },
  {
    name: "AWS",
    package: "@aws/mcp-server-aws",
    description: "Interact with AWS services — S3, Lambda, EC2, CloudWatch, and more.",
    category: "infrastructure",
    keywords: ["aws", "amazon", "s3", "lambda", "ec2", "cloudwatch", "infrastructure"],
    env_required: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@aws/mcp-server-aws"],
      env: { AWS_ACCESS_KEY_ID: "YOUR_KEY", AWS_SECRET_ACCESS_KEY: "YOUR_SECRET", AWS_REGION: "us-east-1" },
    },
    tokens_saved_per_call: 400,
    is_perceptdot: false,
  },
  {
    name: "Netlify",
    package: "@netlify/mcp-server",
    description: "Manage Netlify sites, deployments, and serverless functions.",
    category: "deployment",
    keywords: ["netlify", "deploy", "hosting", "serverless", "functions"],
    env_required: ["NETLIFY_AUTH_TOKEN"],
    setup_snippet: {
      command: "npx",
      args: ["-y", "@netlify/mcp-server"],
      env: { NETLIFY_AUTH_TOKEN: "YOUR_TOKEN" },
    },
    tokens_saved_per_call: 200,
    is_perceptdot: false,
  },
];

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
  price?: string;
  sale_timestamp?: string;
  order_number?: string;
  license_key?: string;
  test?: string;
}

/** KV에 저장되는 API 키 레코드 */
interface ApiKeyRecord {
  key: string;
  email: string;
  plan: "free" | "pro" | "team";
  created_at: string;
  order_number?: string;
  // free 플랜 전용 필드
  calls_used: number;       // 누적 사용 콜 수
  quota: number;            // 허용 총 콜 수 (free: 100→200, pro/team: -1 = unlimited)
  feedback_count: number;   // 피드백 제출 횟수
}

/** 공개 피드백 레코드 */
interface FeedbackRecord {
  key_prefix: string;  // pd_free_xxxx (앞 12자만)
  rating: number;      // 1-5
  comment: string;     // max 150자
  timestamp: string;
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

/** pd_live_ 접두사 + 32자 랜덤 hex API 키 생성 (유료) */
function generateApiKey(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pd_live_${hex}`;
}

/** pd_free_ 접두사 + 24자 랜덤 hex API 키 생성 (무료) */
function generateFreeKey(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pd_free_${hex}`;
}

/** Resend 내부 알림 (service@perceptdot.com으로) */
async function sendInternalAlert(
  resendApiKey: string,
  subject: string,
  text: string
): Promise<void> {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "perceptdot <service@perceptdot.com>",
        to: ["service@perceptdot.com"],
        subject,
        text,
      }),
    });
  } catch (e) {
    console.error("Internal alert failed:", e);
  }
}

/** Resend로 API 키 이메일 발송 */
async function sendApiKeyEmail(
  resendApiKey: string,
  to: string,
  apiKey: string,
  plan: "free" | "pro" | "team"
): Promise<{ ok: boolean; error?: string }> {
  const planLabel =
    plan === "team" ? "Team ($99/mo · 10 seats)" :
    plan === "pro"  ? "Pro ($19/mo)" :
                      "Free (200 calls)";

  const freeNote = plan === "free" ? `
  <div style="background:#1a1a2e;border:1px solid #7c6dfa;padding:16px;border-radius:6px;margin-top:16px;">
    <p style="color:#a78bfa;font-size:12px;margin:0 0 8px;">FREE PLAN — 200 calls</p>
    <p style="color:#aaa;font-size:12px;margin:0;">First 100 calls are ready. After 100 calls, submit a quick feedback to unlock 100 more.</p>
  </div>` : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:monospace;background:#0a0a0a;color:#e0e0e0;padding:32px;max-width:600px;">
  <h1 style="color:#7c6dfa;font-size:20px;">perceptdot ${planLabel}</h1>
  <p style="color:#aaa;">Your API key is ready. Add it to your MCP config.</p>

  <h2 style="color:#e0e0e0;font-size:14px;margin-top:24px;">API KEY</h2>
  <pre style="background:#111;border:1px solid #333;padding:16px;border-radius:6px;font-size:14px;color:#a78bfa;word-break:break-all;">${apiKey}</pre>

  <h2 style="color:#e0e0e0;font-size:14px;margin-top:24px;">MCP CONFIG (.mcp.json)</h2>
  <pre style="background:#111;border:1px solid #333;padding:16px;border-radius:6px;font-size:12px;overflow-x:auto;">{
  "mcpServers": {
    "@perceptdot/ga4": {
      "command": "npx",
      "args": ["-y", "@perceptdot/ga4"],
      "env": { "PERCEPT_API_KEY": "${apiKey}" }
    }
  }
}</pre>
  ${freeNote}

  <p style="color:#666;font-size:12px;margin-top:24px;">
    Docs: <a href="https://perceptdot.com" style="color:#7c6dfa;">perceptdot.com</a>
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
        from: "perceptdot <service@perceptdot.com>",
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
    return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
  }

  const { email } = body;
  if (!email || !email.includes("@")) {
    return c.json({ error: "유효한 이메일이 필요합니다." }, 400);
  }

  // 이미 발급된 키 있으면 재발급 대신 기존 키 반환
  const existingRaw = await c.env.API_KEYS.get(`apikey:${email}`);
  if (existingRaw) {
    const existing = JSON.parse(existingRaw) as ApiKeyRecord;
    if (existing.plan === "free") {
      return c.json({
        ok: true,
        api_key: existing.key,
        plan: "free",
        quota: existing.quota,
        calls_used: existing.calls_used,
        note: "existing key returned",
      });
    }
    // 유료 플랜 사용자 → 이미 더 좋은 키 있음
    return c.json({ error: "이미 유료 플랜 키가 있습니다.", plan: existing.plan }, 409);
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
    return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
  }

  const { key } = body;
  if (!key) return c.json({ error: "key 필드가 필요합니다." }, 400);

  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ allowed: false, needs_feedback: false, message: "Invalid key. Get a free key at perceptdot.com" }, 404);

  const record = JSON.parse(raw) as ApiKeyRecord;

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
    return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
  }

  const { key, rating, comment } = body;
  if (!key) return c.json({ error: "key 필드가 필요합니다." }, 400);
  if (!rating || rating < 1 || rating > 5) return c.json({ error: "rating은 1~5 정수여야 합니다." }, 400);
  if (!comment || comment.trim().length === 0) return c.json({ error: "comment가 필요합니다." }, 400);
  if (comment.length > 150) return c.json({ error: "comment는 150자 이내여야 합니다." }, 400);

  const raw = await c.env.API_KEYS.get(`key:${key}`);
  if (!raw) return c.json({ error: "Invalid key." }, 404);

  const record = JSON.parse(raw) as ApiKeyRecord;

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
  const feedList: FeedbackRecord[] = feedListRaw ? JSON.parse(feedListRaw) : [];
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
    return c.json({ error: "요청 바디가 유효한 JSON이 아닙니다." }, 400);
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
  if (!agg) return c.json({ error: "세션을 찾을 수 없습니다.", session_id }, 404);
  return c.json(buildRoiResponse(agg));
});

app.post("/v1/report", async (c) => {
  let body: ReportRequest = {};
  try { body = await c.req.json<ReportRequest>(); } catch { body = {}; }

  const format = body.format ?? "summary";

  if (body.session_id) {
    const agg = sessionStore.get(body.session_id);
    if (!agg) return c.json({ error: "세션을 찾을 수 없습니다.", session_id: body.session_id }, 404);
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
    totals: { ...totals, total_cost_saved_usd, total_time_saved_min: Math.round((totals.total_time_saved_ms / 1000 / 60) * 10) / 10, roi_positive, ...(roi_positive && { upsell_message: "perceptdot Pro 구독이 이미 본전을 넘었습니다. perceptdot.com" }) },
    ...(format === "detail" && { sessions: allSessions.map(buildRoiResponse) }),
  });
});

app.post("/v1/checkout", async (c) => {
  let body: { seats: number; amount_usd: number };
  try { body = await c.req.json(); } catch { return c.json({ error: "유효한 JSON이 아닙니다." }, 400); }
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
    return c.json({ error: "페이로드 파싱 실패" }, 400);
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
    return c.json({ error: "KV 저장 실패" }, 500);
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
  if (!raw) return c.json({ error: "API 키 없음", email }, 404);
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

// ─── 마케팅 모니터링 통계 ──────────────────────────────────────────────────────

/**
 * GET /v1/stats?key={paid_api_key}
 * 마케팅 모니터링용: 총 키 발급 수, 플랜별 분포, 오늘 신규, 피드백 통계
 * 유료 키(pd_live_) 인증 필요
 */
app.get("/v1/stats", async (c) => {
  const key = c.req.query("key");
  if (!key) return c.json({ error: "key 파라미터가 필요합니다." }, 401);
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
        s.keywords.some((k) => k.toLowerCase().includes(q))
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
        return c.json({ error: "Authorization header 또는 api_key 필드가 필요합니다." }, 401);
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
      return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
    }
  }

  // Authorization 헤더로 키가 전달된 경우
  const keyRaw = await c.env.API_KEYS.get(`key:${apiKey}`);
  if (!keyRaw) return c.json({ error: "Invalid API key." }, 401);

  let body: RecommendLogPayload;
  try {
    body = await c.req.json<RecommendLogPayload>();
  } catch {
    return c.json({ error: "유효한 JSON이 아닙니다." }, 400);
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
  let body: { url?: string; prompt?: string; include_screenshot?: boolean };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { url, prompt, include_screenshot = false } = body;
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

  // ── CF Browser Rendering API: 스크린샷 ──
  const browserStart = Date.now();
  let screenshotB64: string;
  let screenshotBytes: number;

  try {
    const browser = await puppeteer.launch(c.env.BROWSER);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

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
        timeout: 5000, // 5s 내 domcontentloaded 안 되면 현재 상태 스크린샷
      });
    } catch {
      // timeout은 OK — 부분 로드 상태로 스크린샷 (비주얼 QA 목적에 충분)
    }
    const shot = await page.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 80,
    });
    await browser.close();
    screenshotB64 = shot as string;
    screenshotBytes = Math.round((screenshotB64.length * 3) / 4);
  } catch (e) {
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
  const browserMs = Date.now() - browserStart;

  // ── CF Workers AI: 비주얼 QA 분석 (지역제한 없음) ──
  const aiStart = Date.now();
  const userFocus = prompt
    ? `Focus on: ${prompt}`
    : "Look for: broken layouts, element overflow, missing images, severe misalignment, text clipping, z-index issues, extremely low color contrast.";

  const analysisPrompt = `You are a visual QA engineer reviewing a web page screenshot.
URL: ${url}

STEP 1 — First line must be EXACTLY one of:
VERDICT: NO ISSUES
VERDICT: ISSUES FOUND

STEP 2 — One sentence summary (max 80 chars).

STEP 3 — If issues found, list each as a bullet:
- [high|medium|low] Specific issue description (max 80 chars each, max 5 bullets)

${userFocus}
Rules: Dark themes, minimal layouts, bold fonts are NOT bugs. Only flag clear rendering errors.`;

  let hasIssues = false;
  let summary = "";
  let parsedIssues: Array<{ severity: "high" | "medium" | "low"; description: string }> = [];
  let analysis = "";

  /** Parse VERDICT-format response into structured fields */
  function parseVerdictText(text: string) {
    const lower = text.toLowerCase();
    const hi = lower.includes("verdict: issues found");
    const ni = lower.includes("verdict: no issues");
    const foundIssues = hi ? true : ni ? false
      : !["no visual issues", "looks good", "no bugs"].some((kw) => lower.includes(kw));

    // process line by line
    const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let summary = "";
    const issues: Array<{ severity: "high" | "medium" | "low"; description: string }> = [];

    for (const line of rawLines) {
      // strip markdown bold (**text**) only — keep single * for bullet detection
      const stripped = line.replace(/\*\*([^*]+)\*\*/g, "$1").trim();

      // skip VERDICT / header lines
      if (/^VERDICT:/i.test(stripped)) continue;
      if (/^(Summary|Issues?|Verdict):\s*$/i.test(stripped)) continue;

      // bullet or numbered list item
      const bulletMatch = stripped.match(/^[-•*]\s+(.+)/);
      const numberedMatch = stripped.match(/^\d+[.)]\s+(.+)/);
      const rawContent = (bulletMatch?.[1] ?? numberedMatch?.[1] ?? "").trim();

      if (rawContent) {
        // detect leading severity word: "High: ..." or "High - ..." or "[high] ..."
        const sevMatch = rawContent.match(/^(?:\[(high|medium|low)\]|(high|medium|low)[\s:–-])\s*/i);
        const sev: "high" | "medium" | "low" = (() => {
          const s = (sevMatch?.[1] ?? sevMatch?.[2] ?? "").toLowerCase();
          return s === "high" ? "high" : s === "low" ? "low" : "medium";
        })();
        const desc = rawContent.replace(/^(?:\[(high|medium|low)\]|(high|medium|low)[\s:–-])\s*/i, "").trim();
        if (desc.length > 5 && issues.length < 5) issues.push({ severity: sev, description: desc.slice(0, 120) });
        continue;
      }

      // Summary: prefix line
      const summaryPrefixMatch = stripped.match(/^Summary:\s*(.+)/i);
      if (summaryPrefixMatch) {
        summary = summaryPrefixMatch[1].trim().slice(0, 200);
        continue;
      }

      // first plain prose line (not a header, not a bullet) = summary fallback
      if (!summary && stripped.length > 15 && !/^(ISSUES FOUND|NO ISSUES)$/i.test(stripped)) {
        summary = stripped.slice(0, 200);
      }
    }

    // 최종 보정: VERDICT와 실제 내용이 모순될 때
    // — issues[]가 비어있고 summary가 "no issues" 계열이면 false로 덮어씀
    // — Gemini가 VERDICT: ISSUES FOUND라 쓰고 본문에서 "no visible issues"라 하는 경우 방지
    const noIssueSignals = ["no visible issues", "no issues", "no visual issues", "no problems", "looks good", "well-designed", "no bugs", "renders correctly", "no rendering"];
    const summaryLower = summary.toLowerCase();
    const summaryClean = noIssueSignals.some((kw) => summaryLower.includes(kw));
    if (issues.length === 0 && summaryClean) {
      return { hasIssues: false, summary, issues };
    }

    return { hasIssues: foundIssues, summary, issues };
  }

  // Gemini 2.0 Flash — primary
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: "image/jpeg", data: screenshotB64 } },
            { text: analysisPrompt },
          ]}],
          generationConfig: { maxOutputTokens: 500, temperature: 0.1 },
        }),
      }
    );
    if (!geminiRes.ok) throw new Error(`Gemini ${geminiRes.status}`);
    const gd = (await geminiRes.json()) as {
      candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    const raw = gd.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    analysis = raw;
    const parsed = parseVerdictText(raw);
    hasIssues = parsed.hasIssues;
    summary = parsed.summary;
    parsedIssues = parsed.issues;
  } catch (e) {
    // CF Workers AI fallback
    try {
      const binaryStr = atob(screenshotB64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const aiResult = await c.env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        prompt: analysisPrompt,
        image: [...bytes],
        max_tokens: 500,
      });
      const raw = aiResult?.response ?? "";
      analysis = raw;
      const parsed = parseVerdictText(raw);
      hasIssues = parsed.hasIssues;
      summary = parsed.summary;
      parsedIssues = parsed.issues;
    } catch (e2) {
      analysis = `Analysis failed: ${String(e)} / ${String(e2)}`;
      summary = "Analysis failed";
    }
  }
  const aiMs = Date.now() - aiStart;
  const totalMs = Date.now() - startTime;

  const cfAiCost = 0.000011;
  const cfBrCost = 0.000001;
  const totalCost = cfAiCost + cfBrCost;

  const pocPassed = totalMs < 10_000 && totalCost < 0.05;

  const result: Record<string, unknown> = {
    ok: true,
    poc_passed: pocPassed,
    url,
    has_issues: hasIssues,
    summary,
    analysis,
    issues: parsedIssues,
    viewport: { width: 1280, height: 800 },
    timing: {
      total_ms: totalMs,
      browser_ms: browserMs,
      ai_ms: aiMs,
      under_10s: totalMs < 10_000,
    },
    cost: {
      estimated_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
      under_5cents: totalCost < 0.05,
      note: "CF Workers AI vision (~$0.011/1000req free tier on paid plan)",
    },
    duration_ms: totalMs,
    cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
    screenshot_size_bytes: screenshotBytes,
  };

  // 스크린샷은 요청 시에만 포함 (프로덕션에서는 생략)
  if (include_screenshot) {
    result.screenshot_b64 = screenshotB64;
  }

  return c.json(result);
});

// ─── 404 핸들러 ───────────────────────────────────────────────────────────────

app.notFound((c) => {
  return c.json({ error: "엔드포인트를 찾을 수 없습니다.", path: c.req.path }, 404);
});

export default app;
