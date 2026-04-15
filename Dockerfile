FROM node:20-slim
WORKDIR /app

COPY mcp/package.json mcp/package-lock.json* ./
RUN npm install

COPY mcp/tsconfig.json ./
COPY mcp/src ./src

RUN npx tsc

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/serve.js"]
