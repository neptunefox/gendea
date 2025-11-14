---
inclusion: fileMatch
fileMatchPattern: ['db/schema.ts', 'scripts/migrate.ts']
---

## Database Migrations

### When Schema Changes

After modifying `db/schema.ts`, always run the migration script:

```bash
bun run db:migrate
```

### Migration Rules

- Run migrations immediately after schema changes - don't wait for user to ask
- Migrations use Drizzle ORM with PostgreSQL
- Schema file is at `db/schema.ts`, migration script at `scripts/migrate.ts`
- Never modify the database directly - always update schema and run migrations
- Check for migration errors and report them clearly

### Schema Conventions

- Use `uuid` for primary keys with `.defaultRandom()`
- Use `timestamp` fields with `.defaultNow()` for `createdAt` and `updatedAt`
- Use `jsonb` for complex data structures with proper TypeScript types via `.$type<>()`
- Use `text` with enum constraints for state/status fields
- Use `integer` for boolean flags (0/1) instead of boolean type
- Always include `.notNull()` unless field is explicitly optional

### After Migration

- Verify migration completed successfully
- Report any schema changes that might affect existing API endpoints or components