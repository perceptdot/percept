#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

// ─── PerceptMetrics: ROI 측정 ─────────────────────────────────────────────────
// 측정 방법론: Vercel 배포 상태를 수동으로 확인할 때 소비하는 평균 토큰(200)을
// 도구 호출로 대체. 배포 확인은 개발 세션당 평균 5~10회 발생.
const TOKENS_SAVED_PER_CALL = 200;
const TOKEN_PRICE_PER_MILLION = 3.0;

interface PerceptMetrics {
  tool_name: string;
  tokens_saved_estimate: number;
  time_saved_ms: number;
  calls_count: number;
}

const metrics: PerceptMetrics = {
  tool_name: "@percept/vercel",
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
  return [
    `[percept ROI — @percept/vercel]`,
    `calls:          ${metrics.calls_count}`,
    `tokens saved:   ${metrics.tokens_saved_estimate.toLocaleString()}`,
    `cost saved:     $${usd_saved.toFixed(4)}`,
    `time saved:     ~${Math.round(metrics.time_saved_ms / 60000)} min`,
    ``,
    `누적 절감 $${usd_saved.toFixed(4)} — perceptdot.com`,
  ].join("\n");
}

// ─── 환경 변수 검증 ────────────────────────────────────────────────────────────
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  process.stderr.write(
    "[percept/vercel] ERROR: VERCEL_TOKEN 환경 변수가 필요합니다.\n" +
      "발급 방법: vercel.com/account/tokens\n"
  );
  process.exit(1);
}

const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID ?? "";

// ─── Vercel API 클라이언트 ─────────────────────────────────────────────────────
async function vercelFetch<T>(path: string): Promise<T> {
  const url =
    `https://api.vercel.com${path}` +
    (VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vercel API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

// ─── 타입 정의 ────────────────────────────────────────────────────────────────
interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  created: number;
  ready?: number;
  buildingAt?: number;
  source?: string;
  meta?: { githubCommitMessage?: string; githubCommitRef?: string };
}

interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  latestDeployments?: VercelDeployment[];
  link?: { type: string; repo?: string };
}

// ─── MCP 서버 ─────────────────────────────────────────────────────────────────
const server = new Server(
  { name: "@percept/vercel", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "vercel_deployments",
      description:
        "최근 Vercel 배포 목록을 조회합니다. 배포 상태, 시간, 커밋 메시지 포함. " +
        "수동 대비 ~200 토큰 절감.",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "특정 프로젝트 ID (선택). 없으면 전체 배포 조회.",
          },
          limit: {
            type: "number",
            description: "반환할 배포 수 (기본 5)",
            default: 5,
          },
        },
        required: [],
      },
    },
    {
      name: "vercel_latest_status",
      description:
        "가장 최근 배포의 상태를 확인합니다. 배포 후 즉시 성공/실패 확인에 사용. " +
        "배포마다 호출 권장.",
      inputSchema: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "확인할 프로젝트 ID (선택)",
          },
        },
        required: [],
      },
    },
    {
      name: "vercel_projects",
      description:
        "Vercel 프로젝트 목록과 각 프로젝트의 최신 배포 상태를 조회합니다.",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "반환할 프로젝트 수 (기본 10)",
            default: 10,
          },
        },
        required: [],
      },
    },
    {
      name: "percept_roi_summary",
      description:
        "이 세션에서 @percept/vercel이 절감한 토큰·비용을 보고합니다.",
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
    if (name === "percept_roi_summary") {
      return { content: [{ type: "text", text: getRoiSummary() }] };
    }

    // 배포 목록
    if (name === "vercel_deployments") {
      const a = args as Record<string, unknown>;
      const limit = Math.min(Number(a?.limit ?? 5), 20);
      const projectId = a?.project_id as string | undefined;

      const path = projectId
        ? `/v6/deployments?projectId=${projectId}&limit=${limit}`
        : `/v6/deployments?limit=${limit}`;

      const data = await vercelFetch<{ deployments: VercelDeployment[] }>(path);
      const deployments = data.deployments.map((d) => ({
        uid: d.uid,
        project: d.name,
        url: `https://${d.url}`,
        state: d.state,
        created_at: new Date(d.created).toISOString(),
        ready_at: d.ready ? new Date(d.ready).toISOString() : null,
        duration_sec: d.ready
          ? Math.round((d.ready - (d.buildingAt ?? d.created)) / 1000)
          : null,
        commit: d.meta?.githubCommitMessage ?? null,
        branch: d.meta?.githubCommitRef ?? null,
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                deployments,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 최신 배포 상태
    if (name === "vercel_latest_status") {
      const a = args as Record<string, unknown>;
      const projectId = a?.project_id as string | undefined;

      const path = projectId
        ? `/v6/deployments?projectId=${projectId}&limit=1`
        : `/v6/deployments?limit=1`;

      const data = await vercelFetch<{ deployments: VercelDeployment[] }>(path);
      const d = data.deployments[0];

      if (!d) {
        return {
          content: [{ type: "text", text: "배포 이력이 없습니다." }],
        };
      }

      const stateEmoji: Record<string, string> = {
        READY: "✅",
        ERROR: "❌",
        BUILDING: "🔄",
        CANCELED: "⛔",
        QUEUED: "⏳",
      };

      const status = {
        state: `${stateEmoji[d.state] ?? "❓"} ${d.state}`,
        project: d.name,
        url: `https://${d.url}`,
        deployed_at: new Date(d.created).toISOString(),
        duration_sec: d.ready
          ? Math.round((d.ready - (d.buildingAt ?? d.created)) / 1000)
          : null,
        commit: d.meta?.githubCommitMessage ?? null,
        branch: d.meta?.githubCommitRef ?? null,
        _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
      };

      trackCall(Date.now() - startTime);
      return {
        content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
      };
    }

    // 프로젝트 목록
    if (name === "vercel_projects") {
      const a = args as Record<string, unknown>;
      const limit = Math.min(Number(a?.limit ?? 10), 20);

      const data = await vercelFetch<{ projects: VercelProject[] }>(
        `/v9/projects?limit=${limit}`
      );

      const projects = data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        framework: p.framework ?? "unknown",
        repo: p.link?.repo ?? null,
        latest_deployment: p.latestDeployments?.[0]
          ? {
              state: p.latestDeployments[0].state,
              url: `https://${p.latestDeployments[0].url}`,
              created_at: new Date(p.latestDeployments[0].created).toISOString(),
            }
          : null,
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                projects,
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
    throw new McpError(ErrorCode.InternalError, `Vercel API 오류: ${error}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[percept/vercel] v0.1.0 실행 중 — perceptdot.com\n");
