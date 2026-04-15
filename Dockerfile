FROM node:20-slim
WORKDIR /app
COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci --production
COPY mcp/src ./src
COPY mcp/tsconfig.json ./
RUN npx tsc
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/index.js"]
