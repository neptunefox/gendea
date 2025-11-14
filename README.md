# Gendea

Creative workbench that keeps ideation, saved sparks, experiments, and build lessons in one loop.

## What it does

- **Spark tab** — parallel AI “lanes” suggest constrained experiments, anti-pattern riffs, and smallest honest tests with pinboard saves.
- **Pinboard & History** — every saved idea keeps its status, UUID, and full contents so you can resume or branch from past runs instantly.
- **Build view** — tracks North Star, constraints, plans, and test evidence with XState-powered workflow transitions.
- **Research nudges** — incubation timers, novelty shuffles, and plan cues based on cognitive psychology.

## Tech

- Nuxt 4 + Vue 3, Vite, and Lucide
- PostgreSQL with Drizzle ORM
- XState for workflow state and Nitro server routes
- Bun for tooling

## Quick start

```bash
bun install
cp .env.example .env   # add DATABASE_URL + LLM key
bun run db:migrate
bun run dev
```

## Scripts

```bash
bun run format && bun run lint:fix   # formatting + linting
```

## License

AGPL-3.0 - see [LICENSE](LICENSE) file for details
