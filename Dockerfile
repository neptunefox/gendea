FROM oven/bun:1.3

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

# Copy application files
COPY . .

ENV PORT=3000
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434

EXPOSE 3000

# Use --watch for auto-reload on file changes
CMD ["bun", "--watch", "server.ts"]
