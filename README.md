# Gendea

A creative workbench with a mystical interface. Capture ideas, combine them, refine your thinking.

## Features

**Spark** — Enter a problem, get multiple angles back. Save what resonates.

**Cauldron** — Blend three ideas together. See what emerges.

**Oracle** — A conversation to go deeper. It asks the questions.

**Tarot** — Draw a card when you're stuck.

## Setup

### 1. Install Bun

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Clone and install

```bash
git clone https://github.com/iamnbutler/gendea.git
cd gendea
bun install
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=your-key-here
```

**Get a free API key:**
- [Google AI Studio](https://aistudio.google.com/apikey) (recommended)
- [OpenRouter](https://openrouter.ai/keys)
- Or use [Ollama](https://ollama.com) locally (no key needed)

### 4. Run

```bash
bun run db:migrate
bun run dev
```

Open [localhost:3000](http://localhost:3000)

## Tech

Nuxt 4 · Vue 3 · SQLite · Drizzle · LangChain

## License

AGPL-3.0
