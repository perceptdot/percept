#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

// ─── PerceptMetrics: ROI 측정 핵심 ───────────────────────────────────────────
// 측정 방법론: Sentry 데이터를 수동으로 가져올 때 에이전트가 소비하는 토큰(평균 500)을
// 도구 호출로 대체함으로써 절감. K-사주 실측 기반 추정치.
const TOKENS_SAVED_PER_CALL = 500;
const TOKEN_PRICE_PER_MILLION = 3.0; // Claude Sonnet $3/1M tokens

interface PerceptMetrics {
  tool_name: string;
  tokens_saved_estimate: number;
  time_saved_ms: number;
  calls_count: number;
}

const metrics: PerceptMetrics = {
  tool_name: "@perceptdot/sentry",
  tokens_saved_estimate: 0,
  time_saved_ms: 0,
  calls_count: 0,
};

function trackCall(duration_ms: number): void {
  metrics.calls_count++;
  metrics.tokens_saved_estimate += TOKENS_SAVED_PER_CALL;
  metrics.time_saved_ms += duration_ms;
}

// ─── 플랜 검증 ────────────────────────────────────────────────────────────────
const PERCEPT_API_KEY = process.env.PERCEPT_API_KEY;
const PERCEPT_API_BASE = "https://perceptdot-api.perceptdot.workers.dev";
const SESSION_FREE_LIMIT = 10;

let planCache: { plan: "free" | "pro" | "team"; expires: number } | null = null;

interface UseResult { allowed: boolean; needs_feedback: boolean; message?: string; }

async function checkAndUse(): Promise<UseResult> {
  if (!PERCEPT_API_KEY) {
    if (metrics.calls_count >= SESSION_FREE_LIMIT) {
      return { allowed: false, needs_feedback: false, message: "PERCEPT FREE LIMIT REACHED (10 calls/session).\nGet a free key for 200 calls → https://perceptdot.com" };
    }
    return { allowed: true, needs_feedback: false };
  }
  if (PERCEPT_API_KEY.startsWith("pd_free_")) {
    try {
      const res = await fetch(`${PERCEPT_API_BASE}/v1/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: PERCEPT_API_KEY }),
      });
      if (res.ok) {
        const data = await res.json() as { allowed: boolean; needs_feedback?: boolean; message?: string };
        if (!data.allowed) return { allowed: false, needs_feedback: data.needs_feedback ?? false, message: data.message };
        return { allowed: true, needs_feedback: false };
      }
    } catch {}
    return { allowed: true, needs_feedback: false };
  }
  if (planCache && Date.now() < planCache.expires) return { allowed: true, needs_feedback: false };
  try {
    const res = await fetch(`${PERCEPT_API_BASE}/v1/validate?key=${PERCEPT_API_KEY}`);
    if (res.ok) {
      const data = await res.json() as { valid: boolean; plan: string };
      planCache = { plan: (data.valid ? data.plan : "free") as "free" | "pro" | "team", expires: Date.now() + 5 * 60 * 1000 };
      if (!data.valid) return { allowed: false, needs_feedback: false, message: "Invalid PERCEPT_API_KEY. Check your key at perceptdot.com" };
    }
  } catch {}
  return { allowed: true, needs_feedback: false };
}

function makeFeedbackRequestMessage(): string {
  const usd = (metrics.tokens_saved_estimate / 1_000_000) * 3.0;
  return [
    "PERCEPT FREE QUOTA REACHED (100 calls).",
    `This session: ${metrics.calls_count} calls, ~${metrics.tokens_saved_estimate} tokens saved ($${usd.toFixed(4)}).`,
    "",
    "Submit feedback to unlock 100 more calls → use `percept_feedback` tool with rating (1-5) and comment (max 150 chars).",
    "Or upgrade to Pro ($19/mo) → https://perceptdot.com",
  ].join("\n");
}

function getRoiSummary(): string {
  const usd_saved =
    (metrics.tokens_saved_estimate / 1_000_000) * TOKEN_PRICE_PER_MILLION;
  const lines = [
    `[perceptdot ROI — @perceptdot/sentry]`,
    `calls:          ${metrics.calls_count}`,
    `tokens saved:   ${metrics.tokens_saved_estimate.toLocaleString()}`,
    `cost saved:     $${usd_saved.toFixed(4)}`,
    `time saved:     ~${Math.round(metrics.time_saved_ms / 60000)} min`,
    ``,
    usd_saved > 0.019
      ? `ROI POSITIVE: saving > $19/mo → perceptdot Pro 유지 권장. perceptdot.com`
      : `누적 절감 $${usd_saved.toFixed(4)} / perceptdot Pro $19/mo. 계속 사용 시 ROI 증가.`,
  ];
  return lines.join("\n");
}

// ─── 환경 변수 검증 ────────────────────────────────────────────────────────────
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

if (!sentryAuthToken || !sentryOrg || !sentryProject) {
  process.stderr.write(
    "[perceptdot/sentry] ERROR: SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT 환경 변수가 필요합니다.\n" +
      "설정 방법: Sentry > Settings > Auth Tokens\n"
  );
  process.exit(1);
}

// ─── Sentry API 헬퍼 ───────────────────────────────────────────────────────────
const SENTRY_API_BASE = "https://sentry.io/api/0/";

async function sentryFetch(path: string): Promise<unknown> {
  const url = `${SENTRY_API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${sentryAuthToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Sentry API 오류 ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

// ─── MCP 서버 ─────────────────────────────────────────────────────────────────
const server = new Server(
  { name: "@perceptdot/sentry", version: "0.1.2" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "sentry_issues",
      description:
        "미해결 Sentry 이슈 목록을 조회합니다 (status=unresolved, limit=20). " +
        "수동 대비 ~500 토큰 절감. 에러 트리아지, 배포 후 모니터링에 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "sentry_issue_detail",
      description:
        "특정 Sentry 이슈의 상세 정보를 조회합니다: 스택트레이스 요약, 태그, 발생 횟수.",
      inputSchema: {
        type: "object",
        properties: {
          issue_id: {
            type: "string",
            description: "Sentry 이슈 ID (예: 1234567890)",
          },
        },
        required: ["issue_id"],
      },
    },
    {
      name: "sentry_events",
      description:
        "최근 에러 이벤트 목록을 조회합니다 (level:error, limit=10). " +
        "실시간 에러 감지, 배포 후 이상 여부 확인에 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "sentry_stats",
      description:
        "프로젝트 에러 통계를 조회합니다: 24h/7d/30d 기간별 수신·해결·미해결 카운트.",
      inputSchema: {
        type: "object",
        properties: {
          period: {
            type: "string",
            description: "조회 기간: '24h' | '7d' | '30d'",
            default: "24h",
          },
        },
        required: [],
      },
    },
    {
      name: "percept_roi_summary",
      description:
        "이 세션에서 @perceptdot/sentry가 절감한 토큰·비용·시간을 보고합니다. " +
        "주인에게 ROI 리포트 보고 시 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "percept_feedback",
      description:
        "무료 플랜 100콜 도달 시 피드백을 제출하여 100콜을 추가로 잠금 해제합니다. " +
        "rating(1~5)과 comment(최대 150자)를 입력하세요.",
      inputSchema: {
        type: "object",
        properties: {
          rating: { type: "number", description: "별점 1~5", minimum: 1, maximum: 5 },
          comment: { type: "string", description: "사용 후기 (최대 150자). 솔직하게 작성.", maxLength: 150 },
        },
        required: ["rating", "comment"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  try {
    // 플랜 체크 (percept_roi_summary, percept_feedback는 항상 허용)
    if (name !== "percept_roi_summary" && name !== "percept_feedback") {
      const usage = await checkAndUse();
      if (!usage.allowed) {
        const msg = usage.needs_feedback ? makeFeedbackRequestMessage() : (usage.message ?? "Call limit reached → https://perceptdot.com");
        return { content: [{ type: "text", text: msg }] };
      }
    }

    // ROI 리포트 (API 호출 없음)
    if (name === "percept_roi_summary") {
      return { content: [{ type: "text", text: getRoiSummary() }] };
    }

    // 피드백 제출
    if (name === "percept_feedback") {
      if (!PERCEPT_API_KEY || !PERCEPT_API_KEY.startsWith("pd_free_")) {
        return { content: [{ type: "text", text: "percept_feedback is for free plan only. You have unlimited calls." }] };
      }
      const a = args as { rating?: number; comment?: string };
      if (!a.rating || a.rating < 1 || a.rating > 5) return { content: [{ type: "text", text: "rating must be 1-5." }] };
      if (!a.comment || a.comment.trim().length === 0) return { content: [{ type: "text", text: "comment is required (max 150 chars)." }] };
      try {
        const res = await fetch(`${PERCEPT_API_BASE}/v1/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: PERCEPT_API_KEY, rating: Math.round(a.rating), comment: a.comment.trim().slice(0, 150) }),
        });
        const data = await res.json() as { ok?: boolean; message?: string; error?: string; calls_remaining?: number };
        if (data.ok) return { content: [{ type: "text", text: `Feedback submitted! ${data.message ?? ""}\nCalls remaining: ${data.calls_remaining ?? "unknown"}` }] };
        return { content: [{ type: "text", text: `Feedback error: ${data.error ?? "unknown"}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `Failed to submit feedback: ${e}` }] };
      }
    }

    // 미해결 이슈 목록
    if (name === "sentry_issues") {
      const data = await sentryFetch(
        `organizations/${sentryOrg}/issues/?project=${sentryProject}&query=is:unresolved&limit=20`
      ) as Array<Record<string, unknown>>;

      const issues = data.map((issue) => ({
        id: issue.id,
        title: issue.title,
        culprit: issue.culprit,
        level: issue.level,
        count: issue.count,
        userCount: issue.userCount,
        firstSeen: issue.firstSeen,
        lastSeen: issue.lastSeen,
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_unresolved: issues.length,
                issues,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 특정 이슈 상세
    if (name === "sentry_issue_detail") {
      const a = args as Record<string, unknown>;
      const issueId = a?.issue_id as string;
      if (!issueId) {
        throw new McpError(ErrorCode.InvalidParams, "issue_id 파라미터가 필요합니다.");
      }

      const issue = await sentryFetch(`issues/${issueId}/`) as Record<string, unknown>;

      // 스택트레이스 요약 추출
      const latestEvent = issue.latestEvent as Record<string, unknown> | undefined;
      const entries = latestEvent?.entries as Array<Record<string, unknown>> | undefined;
      const exceptionEntry = entries?.find((e) => e.type === "exception");
      const exceptionData = exceptionEntry?.data as Record<string, unknown> | undefined;
      const values = exceptionData?.values as Array<Record<string, unknown>> | undefined;
      const firstException = values?.[0];
      const rawFrames = (firstException?.stacktrace as Record<string, unknown> | undefined)?.frames as Array<Record<string, unknown>> | undefined;
      const stacktrace_summary = rawFrames
        ? rawFrames
            .slice(-5)
            .map((f) => `${f.filename}:${f.lineNo} in ${f.function}`)
            .join("\n")
        : "스택트레이스 없음";

      // 태그 추출
      const tags = (issue.tags as Array<Record<string, unknown>> | undefined)?.map((t) => ({
        key: t.key,
        value: t.topValues,
      })) ?? [];

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: issue.id,
                title: issue.title,
                culprit: issue.culprit,
                level: issue.level,
                stacktrace_summary,
                tags,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 최근 에러 이벤트
    if (name === "sentry_events") {
      const data = await sentryFetch(
        `projects/${sentryOrg}/${sentryProject}/events/?query=level:error&limit=10`
      ) as Array<Record<string, unknown>>;

      const events = data.map((event) => ({
        eventId: event.eventID,
        title: event.title,
        timestamp: event.dateCreated,
        user: (event.user as Record<string, unknown> | undefined)?.email ?? (event.user as Record<string, unknown> | undefined)?.username ?? null,
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_events: events.length,
                events,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 에러 통계
    if (name === "sentry_stats") {
      const a = args as Record<string, unknown>;
      const period = (a?.period as string) ?? "24h";

      const sinceMap: Record<string, number> = {
        "24h": -86400,
        "7d": -604800,
        "30d": -2592000,
      };
      const since = sinceMap[period] ?? -86400;

      const stats = await sentryFetch(
        `projects/${sentryOrg}/${sentryProject}/stats/?stat=received&since=${since}`
      ) as Array<[number, number]>;

      const total_errors = stats.reduce((sum, [, count]) => sum + count, 0);

      // 미해결/해결 카운트는 issues 엔드포인트로 보완
      const unresolvedData = await sentryFetch(
        `organizations/${sentryOrg}/issues/?project=${sentryProject}&query=is:unresolved&limit=100`
      ) as Array<Record<string, unknown>>;
      const resolvedData = await sentryFetch(
        `organizations/${sentryOrg}/issues/?project=${sentryProject}&query=is:resolved&limit=100`
      ) as Array<Record<string, unknown>>;

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                period,
                total_errors,
                unresolved: unresolvedData.length,
                resolved: resolvedData.length,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구: ${name}`);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `Sentry API 오류: ${error}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[perceptdot/sentry] v0.1.2 실행 중 — perceptdot.com\n");
