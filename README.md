# Gendea

Idea generation and exploration tool with structured workflow from capture to execution.

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Set up database:
   ```bash
   bun run db:migrate
   ```

4. Start development:
   ```bash
   bun run dev
   ```

## LLM Configuration

**Local (Ollama)**:
```env
LLM_PROVIDER=ollama
LLM_MODEL=gemma3:4b
LLM_BASE_URL=http://localhost:11434
```

**Cloud (OpenRouter)**:
```env
LLM_PROVIDER=openrouter
LLM_MODEL=anthropic/claude-3-haiku
LLM_API_KEY=your_key
```

## Database

PostgreSQL required:
```env
DATABASE_URL=postgresql://localhost:5432/gendea
```
