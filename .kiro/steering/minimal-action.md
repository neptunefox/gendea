## Minimal Action Only

- Only do exactly what the user explicitly asks for
- Never scaffold full projects unless explicitly requested
- Never create config files, setup files, or boilerplate without being asked
- When user says "add dependencies", only run the package manager command
- When user says "explain", only explain - don't create files
- Ask before creating any files beyond what was directly requested
- Stop and wait for next instruction after completing the exact request

## Minimal Code

- Write the absolute minimum code needed
- Don't add features, helpers, or abstractions that weren't requested
- Don't create multiple files when one will do
- Don't add error handling, validation, or edge cases unless asked
- Keep implementations simple and direct
