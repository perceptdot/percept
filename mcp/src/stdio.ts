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
    const { jsonrpc, id, method } = req
    if (id === undefined) return
    switch (method) {
      case 'initialize':
        respond({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo } })
        break
      case 'tools/list':
        respond({ jsonrpc: '2.0', id, result: { tools } })
        break
      case 'ping':
        respond({ jsonrpc: '2.0', id, result: {} })
        break
      default:
        respond({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } })
    }
  } catch {}
})
