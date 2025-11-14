## Commit Messages

When user asks to commit, suggest a commit message following conventional commit format instead of running git commands.

Format: `type(scope): description`

Types:
- feat: new feature
- fix: bug fix
- refactor: code change that neither fixes a bug nor adds a feature
- style: changes that don't affect code meaning (formatting, whitespace)
- ui: visual/UX changes
- perf: performance improvement
- docs: documentation only
- chore: maintenance tasks

Optional body and footers:
- Body: Provide additional context after a blank line
- Footers: Add metadata like issue references (e.g., `Refs #123`, `Reviewed-by: Name`)

Breaking changes:
- Add `!` after type/scope: `feat!: description` or `feat(api)!: description`
- Or use footer: `BREAKING CHANGE: description`

Keep descriptions concise, clear, and in present tense.

When completing spec tasks, include the task/subtask reference.
