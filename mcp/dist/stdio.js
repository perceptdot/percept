#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const rl = readline.createInterface({ input: process.stdin });
const serverInfo = { name: 'perceptdot', version: '1.0.0' };
const tools = [{
        name: 'visual_check',
        description: 'Screenshot a URL and analyze it for visual bugs using AI. Returns whether issues exist, a summary, and a detailed issues list.',
        inputSchema: {
            type: 'object',
            properties: {
                url: { type: 'string', description: 'URL to visually check (must be publicly accessible)' },
                prompt: { type: 'string', description: 'Optional: specific aspect to focus on (e.g. "check the header layout")' },
                no_cache: { type: 'boolean', description: 'Optional: set true to bypass cache and always run a fresh analysis' },
                viewport: { type: 'string', enum: ['desktop', 'tablet', 'mobile'], description: 'Optional: viewport size — desktop (1280px, default), tablet (768px), mobile (375px)' }
            },
            required: ['url']
        }
    }];
function respond(obj) {
    process.stdout.write(JSON.stringify(obj) + '\n');
}
rl.on('line', (line) => {
    try {
        const req = JSON.parse(line);
        const { jsonrpc, id, method, params } = req;
        if (id === undefined)
            return;
        switch (method) {
            case 'initialize':
                respond({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo } });
                break;
            case 'tools/list':
                respond({ jsonrpc: '2.0', id, result: { tools } });
                break;
            case 'tools/call': {
                const { name, arguments: args } = params ?? {};
                if (name !== 'visual_check') {
                    respond({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Unknown tool: ' + name } });
                    break;
                }
                const apiKey = process.env.PERCEPT_API_KEY ?? '';
                fetch('https://api.perceptdot.com/v1/eye/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'X-Percept-Key': apiKey } : {}) },
                    body: JSON.stringify({ url: args?.url, prompt: args?.prompt, no_cache: args?.no_cache, viewport: args?.viewport }),
                })
                    .then(async (r) => {
                    const body = await r.json().catch(() => ({}));
                    if (!r.ok) {
                        const msg = body?.error ?? `API error ${r.status}`;
                        respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true } });
                        return;
                    }
                    const issueLines = (body.issues ?? [])
                        .map((i) => `  [${(i.severity ?? 'info').toUpperCase()}] ${i.description}`)
                        .join('\n');
                    const text = body.has_issues
                        ? `⚠️ Visual issues detected on ${args?.url}\n\nSummary: ${body.summary}\n\nIssues:\n${issueLines}`
                        : `✅ No visual issues detected on ${args?.url}\n\n${body.summary}`;
                    respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], isError: false } });
                })
                    .catch((e) => {
                    respond({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true } });
                });
                break;
            }
            case 'ping':
                respond({ jsonrpc: '2.0', id, result: {} });
                break;
            default:
                respond({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } });
        }
    }
    catch { }
});
