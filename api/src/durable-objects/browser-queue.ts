// ─── BrowserQueue Durable Object ─────────────────────────────────────────────
// CF Browser Rendering 동시 세션을 MAX_CONCURRENT(2)로 제한.
// 초과 요청은 최대 MAX_WAIT_MS(30s) 큐 대기, 초과 시 503 반환.

const MAX_CONCURRENT = 2;
const MAX_WAIT_MS = 30_000;

export class BrowserQueue {
  private active = 0;
  private readonly queue: Array<{
    resolve: () => void;
    reject: (r: string) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_state: any) {}

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/acquire") {
      try {
        await this._acquire();
        return new Response("ok");
      } catch (reason) {
        return new Response(JSON.stringify({ error: reason, retry_after_ms: MAX_WAIT_MS }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    if (pathname === "/release") {
      this._release();
      return new Response("ok");
    }
    return new Response("not found", { status: 404 });
  }

  private _acquire(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.active < MAX_CONCURRENT) {
        this.active++;
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        const idx = this.queue.findIndex((e) => e.timer === timer);
        if (idx !== -1) this.queue.splice(idx, 1);
        reject("Browser queue timeout (30s)");
      }, MAX_WAIT_MS);
      this.queue.push({ resolve, reject, timer });
    });
  }

  private _release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      clearTimeout(next.timer);
      next.resolve();
    } else {
      this.active = Math.max(0, this.active - 1);
    }
  }
}
