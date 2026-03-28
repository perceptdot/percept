// ─── 환경 바인딩 타입 ──────────────────────────────────────────────────────────

export interface Env {
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
  /** Gemini API 키 (wrangler secret put GEMINI_API_KEY) */
  GEMINI_API_KEY: string;
  /** KV: 비주얼 체크 결과 캐시 (TTL 5분) */
  VISUAL_CACHE: KVNamespace;
  /** DO: BrowserQueue — 동시 브라우저 세션 2개 제한 */
  BROWSER_QUEUE: DurableObjectNamespace;
}

// ─── Registry 타입 ────────────────────────────────────────────────────────────

export interface CuratedServer {
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

export interface RecommendLogPayload {
  project_signals: string[];
  recommended_servers: string[];
  installed_servers: string[];
}

// ─── 비즈니스 로직 타입 ───────────────────────────────────────────────────────

export interface MetricsPayload {
  session_id: string;
  tool_name: string;
  tokens_saved: number;
  time_saved_ms: number;
  calls_count: number;
  timestamp: string;
}

export interface SessionAggregate {
  session_id: string;
  total_tokens_saved: number;
  total_time_saved_ms: number;
  calls_count: number;
  tools: Set<string>;
  first_seen: string;
  last_seen: string;
}

export interface RoiResponse {
  session_id: string;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  total_time_saved_min: number;
  calls_count: number;
  roi_positive: boolean;
  upsell_message?: string;
}

export interface ReportRequest {
  session_id?: string;
  format?: "summary" | "detail";
}

/** Gumroad 웹훅 페이로드 (form-encoded) */
export interface GumroadWebhookPayload {
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
export interface ApiKeyRecord {
  key: string;
  email: string;
  plan: "free" | "pro" | "team";
  created_at: string;
  order_number?: string;
  calls_used: number;
  quota: number;
  feedback_count: number;
}

/** 공개 피드백 레코드 */
export interface FeedbackRecord {
  key_prefix: string;
  rating: number;
  comment: string;
  timestamp: string;
}
