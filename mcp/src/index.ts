import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = { PERCEPT_API_KEY: string }
const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

// Health check
app.get('/', (c) => c.json({ service: 'perceptdot MCP', version: '1.0.0', status: 'ok' }))

// MCP Streamable HTTP endpoint
app.post('/mcp', async (c) => {
  const apiKey = c.env.PERCEPT_API_KEY ?? c.req.query('api_key') ?? c.req.header('x-percept-key') ?? null
  const body = await c.req.json()
  const requests = Array.isArray(body) ? body : [body]
  const responses: any[] = []

  for (const req of requests) {
    const res = await handleRpc(req, apiKey)
    if (res !== null) responses.push(res)
  }

  if (responses.length === 0) return c.body(null, 204)
  return c.json(Array.isArray(body) ? responses : responses[0])
})

// SSE upgrade (for clients that request streaming)
app.get('/mcp', (c) => {
  return c.json({ error: 'Use POST for MCP requests' }, 405)
})

async function handleRpc(req: any, apiKey: string | null = null): Promise<any | null> {
  const { jsonrpc, id, method, params } = req

  // Notifications — no response needed
  if (id === undefined && method?.startsWith('notifications/')) return null

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'perceptdot', version: '1.0.0' }
        }
      }

    case 'tools/list':
      return {
        jsonrpc: '2.0', id,
        result: {
          tools: [
            {
              name: 'visual_check',
              description:
                'Screenshot a URL and analyze it for visual bugs using AI. ' +
                'Returns whether issues exist, a summary, and a detailed issues list. ' +
                'Use this after deployments, PRs, or any UI change to catch layout problems.',
              inputSchema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL to visually check (must be publicly accessible)'
                  },
                  prompt: {
                    type: 'string',
                    description: 'Optional: specific aspect to focus on (e.g. "check the header layout")'
                  },
                  no_cache: {
                    type: 'boolean',
                    description: 'Optional: set true to bypass cache and always run a fresh analysis'
                  },
                  viewport: {
                    type: 'string',
                    enum: ['desktop', 'tablet', 'mobile'],
                    description: 'Optional: viewport size — desktop (1280px, default), tablet (768px), mobile (375px)'
                  }
                },
                required: ['url']
              }
            }
          ]
        }
      }

    case 'tools/call': {
      const { name, arguments: args } = params ?? {}
      if (name !== 'visual_check') {
        return {
          jsonrpc: '2.0', id,
          error: { code: -32601, message: `Unknown tool: ${name}` }
        }
      }

      try {
        // 실패 시 최대 4회 재시도 (지수 백오프: 5s·10s·20s)
        // CF Browser Rendering 레이트 리밋(429) 대응
        let resp: Response | null = null
        const delays = [5000, 10000, 20000]
        for (let attempt = 1; attempt <= 4; attempt++) {
          resp = await fetch('https://api.perceptdot.com/v1/eye/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { 'X-Percept-Key': apiKey } : {})
            },
            body: JSON.stringify({ url: args?.url, prompt: args?.prompt, no_cache: args?.no_cache, viewport: args?.viewport, api_key: apiKey }),
          })
          if (resp.ok) break
          // 인증/결제 오류는 재시도 무의미
          if (resp.status === 401 || resp.status === 402) break
          if (attempt < 4) await new Promise(r => setTimeout(r, delays[attempt - 1]))
        }

        if (!resp || !resp.ok) {
          // 인증/결제 에러는 백엔드 메시지를 그대로 전달
          if (resp && (resp.status === 401 || resp.status === 402)) {
            const errBody: any = await resp.json().catch(() => ({}))
            throw new Error(errBody.error || `API key error (${resp.status})`)
          }
          throw new Error(`API error ${resp?.status ?? 'unknown'} (after 4 attempts)`)
        }

        const result: any = await resp.json()

        const issueLines = (result.issues ?? [])
          .map((i: any) => `  [${(i.severity ?? 'info').toUpperCase()}] ${i.description}`)
          .join('\n')

        const tiles = result.tiles_analyzed ?? 1
        const vp = args?.viewport ?? 'desktop'
        const scanLine = `Full-page scan complete — ${tiles} tile${tiles !== 1 ? 's' : ''} analyzed (${vp}) in ${((result.duration_ms ?? 0) / 1000).toFixed(1)}s`
        const text = result.has_issues
          ? `⚠️ Visual issues detected on ${args?.url}\n\nSummary: ${result.summary}\n\nIssues:\n${issueLines}\n\n${scanLine}\nCost: $${result.cost_usd?.toFixed(6)} | Credits used: ${result.credits_used ?? tiles}`
          : `✅ No visual issues detected on ${args?.url}\n\n${result.summary}\n\n${scanLine}\nCost: $${result.cost_usd?.toFixed(6)} | Credits used: ${result.credits_used ?? tiles}`

        return {
          jsonrpc: '2.0', id,
          result: {
            content: [{ type: 'text', text }],
            isError: false
          }
        }
      } catch (e: any) {
        return {
          jsonrpc: '2.0', id,
          result: {
            content: [{ type: 'text', text: `Error running visual_check: ${e.message}` }],
            isError: true
          }
        }
      }
    }

    default:
      return {
        jsonrpc: '2.0', id,
        error: { code: -32601, message: `Method not found: ${method}` }
      }
  }
}

export default app
