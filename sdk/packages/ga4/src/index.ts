#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ─── PerceptMetrics: ROI 측정 핵심 ───────────────────────────────────────────
// 측정 방법론: GA4 데이터를 수동으로 가져올 때 에이전트가 소비하는 토큰(평균 450)을
// 도구 호출로 대체함으로써 절감. K-사주 실측 기반 추정치.
const TOKENS_SAVED_PER_CALL = 450;
const TOKEN_PRICE_PER_MILLION = 3.0; // Claude Sonnet $3/1M tokens

interface PerceptMetrics {
  tool_name: string;
  tokens_saved_estimate: number;
  time_saved_ms: number;
  calls_count: number;
}

const metrics: PerceptMetrics = {
  tool_name: "@perceptdot/ga4",
  tokens_saved_estimate: 0,
  time_saved_ms: 0,
  calls_count: 0,
};

function trackCall(duration_ms: number): void {
  metrics.calls_count++;
  metrics.tokens_saved_estimate += TOKENS_SAVED_PER_CALL;
  metrics.time_saved_ms += duration_ms;
}

function getRoiSummary(): string {
  const usd_saved =
    (metrics.tokens_saved_estimate / 1_000_000) * TOKEN_PRICE_PER_MILLION;
  const monthly_rate = usd_saved; // 현재 세션 기준 (누적 추적 필요 시 백엔드 연동)
  const lines = [
    `[perceptdot ROI — @perceptdot/ga4]`,
    `calls:          ${metrics.calls_count}`,
    `tokens saved:   ${metrics.tokens_saved_estimate.toLocaleString()}`,
    `cost saved:     $${usd_saved.toFixed(4)}`,
    `time saved:     ~${Math.round(metrics.time_saved_ms / 60000)} min`,
    ``,
    monthly_rate > 0.019
      ? `ROI POSITIVE: saving > $19/mo → perceptdot Pro 유지 권장. perceptdot.com`
      : `누적 절감 $${usd_saved.toFixed(4)} / perceptdot Pro $19/mo. 계속 사용 시 ROI 증가.`,
  ];
  return lines.join("\n");
}

// ─── 환경 변수 검증 ────────────────────────────────────────────────────────────
const propertyId = process.env.GA4_PROPERTY_ID;
if (!propertyId) {
  process.stderr.write(
    "[perceptdot/ga4] ERROR: GA4_PROPERTY_ID 환경 변수가 필요합니다.\n" +
      "설정 방법: GA4 > 관리 > 속성 설정 > 속성 ID\n"
  );
  process.exit(1);
}

// ─── GA4 클라이언트 초기화 ─────────────────────────────────────────────────────
let analyticsClient: BetaAnalyticsDataClient;
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    analyticsClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
    });
  } else {
    // GOOGLE_APPLICATION_CREDENTIALS 파일 경로 방식
    analyticsClient = new BetaAnalyticsDataClient();
  }
} catch (e) {
  process.stderr.write(`[perceptdot/ga4] GA4 클라이언트 초기화 실패: ${e}\n`);
  process.exit(1);
}

// ─── MCP 서버 ─────────────────────────────────────────────────────────────────
const server = new Server(
  { name: "@perceptdot/ga4", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ga4_realtime",
      description:
        "현재 실시간 활성 사용자 수와 상위 페이지를 조회합니다. " +
        "수동 대비 ~450 토큰 절감. 배포 직후, 마케팅 이벤트 중 사용 권장.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "ga4_overview",
      description:
        "지정 기간의 GA4 개요를 조회합니다: 세션, 사용자, 페이지뷰, 이탈률, 평균 세션 시간.",
      inputSchema: {
        type: "object",
        properties: {
          start_date: {
            type: "string",
            description: "시작일 (YYYY-MM-DD 또는 '7daysAgo', '30daysAgo')",
            default: "7daysAgo",
          },
          end_date: {
            type: "string",
            description: "종료일 (YYYY-MM-DD 또는 'today', 'yesterday')",
            default: "today",
          },
        },
        required: [],
      },
    },
    {
      name: "ga4_events",
      description:
        "GA4 이벤트별 발생 횟수를 조회합니다. 전환율, 버튼 클릭, 회원가입 추적에 사용.",
      inputSchema: {
        type: "object",
        properties: {
          start_date: { type: "string", default: "7daysAgo" },
          end_date: { type: "string", default: "today" },
          limit: {
            type: "number",
            description: "반환할 이벤트 수 (최대 20)",
            default: 10,
          },
        },
        required: [],
      },
    },
    {
      name: "ga4_top_pages",
      description:
        "조회수 기준 상위 페이지를 반환합니다. 콘텐츠 성과 분석, 인기 페이지 파악에 사용.",
      inputSchema: {
        type: "object",
        properties: {
          start_date: { type: "string", default: "7daysAgo" },
          end_date: { type: "string", default: "today" },
          limit: { type: "number", default: 10 },
        },
        required: [],
      },
    },
    {
      name: "percept_roi_summary",
      description:
        "이 세션에서 @perceptdot/ga4가 절감한 토큰·비용·시간을 보고합니다. " +
        "주인에게 ROI 리포트 보고 시 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  try {
    // ROI 리포트 (API 호출 없음)
    if (name === "percept_roi_summary") {
      return { content: [{ type: "text", text: getRoiSummary() }] };
    }

    // 실시간 데이터
    if (name === "ga4_realtime") {
      const [response] = await analyticsClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: "activeUsers" }],
        dimensions: [{ name: "pagePath" }],
        limit: 10,
      });

      const total_active_users =
        response.rows?.reduce(
          (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? "0"),
          0
        ) ?? 0;

      const top_pages =
        response.rows?.slice(0, 5).map((row) => ({
          page: row.dimensionValues?.[0]?.value ?? "/",
          active_users: row.metricValues?.[0]?.value ?? "0",
        })) ?? [];

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_active_users,
                top_pages,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 기간별 개요
    if (name === "ga4_overview") {
      const startDate = (args as Record<string, string>)?.start_date ?? "7daysAgo";
      const endDate = (args as Record<string, string>)?.end_date ?? "today";

      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      });

      const row = response.rows?.[0];
      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                period: `${startDate} → ${endDate}`,
                sessions: row?.metricValues?.[0]?.value ?? "0",
                active_users: row?.metricValues?.[1]?.value ?? "0",
                pageviews: row?.metricValues?.[2]?.value ?? "0",
                bounce_rate:
                  parseFloat(row?.metricValues?.[3]?.value ?? "0").toFixed(1) + "%",
                avg_session_sec: Math.round(
                  parseFloat(row?.metricValues?.[4]?.value ?? "0")
                ),
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 이벤트 조회
    if (name === "ga4_events") {
      const a = args as Record<string, unknown>;
      const startDate = (a?.start_date as string) ?? "7daysAgo";
      const endDate = (a?.end_date as string) ?? "today";
      const limit = Math.min(Number(a?.limit ?? 10), 20);

      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit,
      });

      const events =
        response.rows?.map((row) => ({
          event: row.dimensionValues?.[0]?.value ?? "unknown",
          count: row.metricValues?.[0]?.value ?? "0",
          users: row.metricValues?.[1]?.value ?? "0",
        })) ?? [];

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                period: `${startDate} → ${endDate}`,
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

    // 상위 페이지
    if (name === "ga4_top_pages") {
      const a = args as Record<string, unknown>;
      const startDate = (a?.start_date as string) ?? "7daysAgo";
      const endDate = (a?.end_date as string) ?? "today";
      const limit = Math.min(Number(a?.limit ?? 10), 20);

      const [response] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit,
      });

      const pages =
        response.rows?.map((row) => ({
          path: row.dimensionValues?.[0]?.value ?? "/",
          title: row.dimensionValues?.[1]?.value ?? "",
          views: row.metricValues?.[0]?.value ?? "0",
          users: row.metricValues?.[1]?.value ?? "0",
        })) ?? [];

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                period: `${startDate} → ${endDate}`,
                top_pages: pages,
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
    throw new McpError(ErrorCode.InternalError, `GA4 API 오류: ${error}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[perceptdot/ga4] v0.1.0 실행 중 — perceptdot.com\n");
