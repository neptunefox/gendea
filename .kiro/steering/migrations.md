---
inclusion: fileMatch
fileMatchPattern: ['db/schema.ts', 'drizzle/**']
---

## Database Migrations (Drizzle Kit)

### Workflow

After modifying `db/schema.ts`:

```bash
bun run db:generate    # Generate migration SQL from schema changes
bun run db:migrate     # Apply migrations to database
```

For rapid prototyping (dev only):

```bash
bun run db:push        # Push schema directly without migration files
```

### Commands Reference

- `db:generate` - Generate migration files from schema changes
- `db:migrate` - Run pending migrations
- `db:push` - Push schema directly (dev only, no migration file)
- `db:studio` - Open Drizzle Studio to browse/edit data

### Schema Conventions

- Use `uuid` for primary keys with `.defaultRandom()`
- Use `timestamp` fields with `.defaultNow()` for `createdAt`
- Use `jsonb` for complex data structures with `.$type<>()`
- Use `text` with enum constraints for state/status fields
- Use `integer` for boolean flags (0/1)
- Always include `.notNull()` unless field is explicitly optional

### Migration Files

- Generated migrations go in `drizzle/` directory
- Never edit migration files after they've been applied
- Migration journal tracks what's been run in `drizzle/meta/`
