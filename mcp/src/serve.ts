import { serve } from '@hono/node-server'
import app from './index.js'

const port = parseInt(process.env.PORT || '3000')
console.log(`perceptdot MCP server listening on port ${port}`)
serve({ fetch: app.fetch, port })
