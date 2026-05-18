#!/usr/bin/env node
import * as readline from 'readline'

const rl = readline.createInterface({ input: process.stdin })

const serverInfo = { name: 'perceptdot', version: '1.0.0' }
const tools = [{
  name: 'visual_check',
  description: 'Screenshot a URL and analyze it for visual bugs using AI. Returns whether issues exist, a summary, and a detailed issues list.',
  inputSchema: {
    type: 'object',
    properties: { url: { type: 'string', description: 'URL to visually check' } },
    required: ['url']
  }
}]

function respond(obj: any) {
  process.stdout.write(JSON.stringify(obj) + '\n')
}

rl.on('line', (line) => {
  try {
    const req = JSON.parse(line)
    const { jsonrpc, id, method, params } = req
    if (id === undefined) return
    switch (method) {
      case 'initialize':
        respond({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo } })
        break
      case 'tools/list':
        respond({ jsonrpc: '2.0', id, result: { tools } })
        break
      case 'tools/call': {
        const { name, arguments: args } = params ?? {}
        if (name !== 'visual_check') {
          respond({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown tool: ' + name } })
          break
        }
        const apiKey = process.env.PERCEPT_API_KEY ?? ''
        fetch('https://api.perceptdot.com/v1/eye/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'X-Percept-Key': apiKey } : {}) },
          body: JSON.stringify({ url: args?.url, prompt: args?.prompt, no_cache: args?.no_cache, viewport: args?.viewport }),
        })
          .then(async r => {
            const body: any = await r.json().catch(() => ({}))
            if (!r.ok) {
              const msg = body?.error ?? `API error ${r.status}`
              respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true } })
              return
            }
            const issueLines = (body.issues ?? [])
              .map((i: any) => `  [${(i.severity ?? 'info').toUpperCase()}] ${i.description}`)
              .join('\n')
            const text = body.has_issues
              ? `⚠️ Visual issues detected on ${args?.url}\n\nSummary: ${body.summary}\n\nIssues:\n${issueLines}`
              : `✅ No visual issues detected on ${args?.url}\n\n${body.summary}`
            respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], isError: false } })
          })
          .catch((e: Error) => {
            respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true } })
          })
        break
      }
      case 'ping':
        respond({ jsonrpc: '2.0', id, result: {} })
        break
      default:
        respond({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } })
    }
  } catch {}
})
