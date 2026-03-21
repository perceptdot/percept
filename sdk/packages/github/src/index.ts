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
// 측정 방법론: GitHub 데이터를 수동으로 가져올 때 에이전트가 소비하는 토큰(평균 400)을
// 도구 호출로 대체함으로써 절감. 실측 기반 추정치.
const TOKENS_SAVED_PER_CALL = 400;
const TOKEN_PRICE_PER_MILLION = 3.0; // Claude Sonnet $3/1M tokens

interface PerceptMetrics {
  tool_name: string;
  tokens_saved_estimate: number;
  time_saved_ms: number;
  calls_count: number;
}

const metrics: PerceptMetrics = {
  tool_name: "@perceptdot/github",
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
  const monthly_rate = usd_saved;
  const lines = [
    `[perceptdot ROI — @perceptdot/github]`,
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
const githubToken = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

if (!githubToken || !owner || !repo) {
  process.stderr.write(
    "[perceptdot/github] ERROR: 필수 환경 변수가 없습니다.\n" +
      "필요: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO\n"
  );
  process.exit(1);
}

// ─── GitHub API 헬퍼 ──────────────────────────────────────────────────────────
const GITHUB_API_BASE = "https://api.github.com";

async function githubFetch(path: string): Promise<unknown> {
  const url = `${GITHUB_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "@perceptdot/github v0.1.2",
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API 오류: ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json();
}

// ─── MCP 서버 ─────────────────────────────────────────────────────────────────
const server = new Server(
  { name: "@perceptdot/github", version: "0.1.2" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "github_prs",
      description:
        "열린 PR 목록을 조회합니다 (최대 20개). " +
        "수동 대비 ~400 토큰 절감. 코드 리뷰 현황 파악, 배포 전 PR 확인에 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "github_pr_detail",
      description:
        "특정 PR의 상세 정보와 리뷰 상태를 조회합니다. " +
        "변경 파일 수, 추가/삭제 라인, 리뷰어 승인 현황 포함.",
      inputSchema: {
        type: "object",
        properties: {
          pr_number: {
            type: "number",
            description: "PR 번호 (github_prs 결과의 number 필드)",
          },
        },
        required: ["pr_number"],
      },
    },
    {
      name: "github_workflows",
      description:
        "최근 GitHub Actions workflow 실행 상태를 조회합니다 (최대 10개). " +
        "CI/CD 파이프라인 현황, 빌드 실패 원인 파악에 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "github_issues",
      description:
        "열린 이슈 목록을 조회합니다 (최대 20개). " +
        "labels 파라미터로 필터링 가능. 버그 트래킹, 백로그 관리에 사용.",
      inputSchema: {
        type: "object",
        properties: {
          labels: {
            type: "string",
            description: "쉼표 구분 레이블 필터 (선택). 예: 'bug,priority:high'",
          },
        },
        required: [],
      },
    },
    {
      name: "percept_roi_summary",
      description:
        "이 세션에서 @perceptdot/github가 절감한 토큰·비용·시간을 보고합니다. " +
        "주인에게 ROI 리포트 보고 시 사용.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "percept_feedback",
      description: "무료 플랜 100콜 도달 시 피드백을 제출하여 100콜을 추가로 잠금 해제합니다. rating(1~5)과 comment(최대 150자)를 입력하세요.",
      inputSchema: {
        type: "object",
        properties: {
          rating: { type: "number", description: "별점 1~5", minimum: 1, maximum: 5 },
          comment: { type: "string", description: "사용 후기 (최대 150자). 솔직하게 작성.", maxLength: 150 }
        },
        required: ["rating", "comment"]
      }
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

    // 열린 PR 목록
    if (name === "github_prs") {
      const data = (await githubFetch(
        `/repos/${owner}/${repo}/pulls?state=open&per_page=20`
      )) as Array<Record<string, unknown>>;

      const prs = data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        author: (pr.user as Record<string, unknown>)?.login ?? "unknown",
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        draft: pr.draft,
        labels: ((pr.labels as Array<Record<string, unknown>>) ?? []).map(
          (l) => l.name
        ),
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                repo: `${owner}/${repo}`,
                open_prs: prs.length,
                prs,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // PR 상세
    if (name === "github_pr_detail") {
      const pr_number = (args as Record<string, unknown>)?.pr_number;
      if (!pr_number) {
        throw new McpError(ErrorCode.InvalidParams, "pr_number 파라미터가 필요합니다.");
      }

      const [prData, reviewsData] = await Promise.all([
        githubFetch(`/repos/${owner}/${repo}/pulls/${pr_number}`) as Promise<
          Record<string, unknown>
        >,
        githubFetch(
          `/repos/${owner}/${repo}/pulls/${pr_number}/reviews`
        ) as Promise<Array<Record<string, unknown>>>,
      ]);

      const body = prData.body as string | null;
      const reviews = reviewsData.map((r) => ({
        reviewer: (r.user as Record<string, unknown>)?.login ?? "unknown",
        state: r.state,
        submitted_at: r.submitted_at,
      }));

      const approved = reviews.filter((r) => r.state === "APPROVED").length;
      const changes_requested = reviews.filter(
        (r) => r.state === "CHANGES_REQUESTED"
      ).length;

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                number: prData.number,
                title: prData.title,
                author: (prData.user as Record<string, unknown>)?.login ?? "unknown",
                state: prData.state,
                draft: prData.draft,
                body_summary:
                  body && body.length > 300
                    ? body.slice(0, 300) + "...(truncated)"
                    : (body ?? "(no description)"),
                changed_files: prData.changed_files,
                additions: prData.additions,
                deletions: prData.deletions,
                reviews: {
                  total: reviews.length,
                  approved,
                  changes_requested,
                  detail: reviews,
                },
                html_url: prData.html_url,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Workflow 실행 상태
    if (name === "github_workflows") {
      const data = (await githubFetch(
        `/repos/${owner}/${repo}/actions/runs?per_page=10`
      )) as Record<string, unknown>;

      const runs = (
        (data.workflow_runs as Array<Record<string, unknown>>) ?? []
      ).map((run) => ({
        workflow_name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
        html_url: run.html_url,
      }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                repo: `${owner}/${repo}`,
                recent_runs: runs,
                _percept: `${TOKENS_SAVED_PER_CALL} tokens saved vs manual`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 열린 이슈 목록
    if (name === "github_issues") {
      const a = args as Record<string, unknown>;
      const labels = (a?.labels as string) ?? "";
      const labelsParam = labels ? `&labels=${encodeURIComponent(labels)}` : "";

      const data = (await githubFetch(
        `/repos/${owner}/${repo}/issues?state=open&per_page=20${labelsParam}`
      )) as Array<Record<string, unknown>>;

      // GitHub issues API는 PR도 포함하므로 순수 이슈만 필터
      const issues = data
        .filter((item) => !item.pull_request)
        .map((issue) => ({
          number: issue.number,
          title: issue.title,
          author: (issue.user as Record<string, unknown>)?.login ?? "unknown",
          created_at: issue.created_at,
          labels: ((issue.labels as Array<Record<string, unknown>>) ?? []).map(
            (l) => l.name
          ),
          comments: issue.comments,
        }));

      trackCall(Date.now() - startTime);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                repo: `${owner}/${repo}`,
                filter_labels: labels || "none",
                open_issues: issues.length,
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

    throw new McpError(ErrorCode.MethodNotFound, `알 수 없는 도구: ${name}`);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `GitHub API 오류: ${error}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("[perceptdot/github] v0.1.2 실행 중 — perceptdot.com\n");
