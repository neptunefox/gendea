## Automatic Dead Code Cleanup

### Core Principle: Keep Codebase Clean

When files are deleted or code is removed, automatically scan the codebase and remove all dead code and unused files to prevent bloat.

### When User Deletes a File

Automatically perform comprehensive cascade cleanup:

1. **Search for all references** - Scan entire codebase for imports and references to the deleted file
2. **Remove broken imports** - Delete all import statements pointing to the deleted file
3. **Cascade delete dead files** - Identify and DELETE other files that are now unused (only imported by deleted file)
4. **Remove dead functions** - Delete functions that only existed to support the deleted file
5. **Remove dead types** - Delete type definitions that only the deleted file used
6. **Remove dead components** - Delete components that only the deleted file rendered
7. **Remove dead API calls** - Remove frontend code calling deleted API endpoints
8. **Remove dead routes** - Delete route definitions pointing to deleted components
9. **Delete orphaned folders** - DELETE entire folders if all files inside are now unused
10. **Identify dead dependencies** - Note npm packages only used by deleted code

### Execution Guidelines

- **Be aggressive** - If something only existed to support deleted code, DELETE it immediately
- **Scan entire codebase** - Not just modified files, check for ripple effects everywhere
- **Go beyond linters** - Remove code and files that linters can't detect as dead
- **Act automatically** - Don't ask permission, just clean up and report what was removed
- **Check thoroughly** - Look for dynamic imports, route references, component usage, API calls

### What to Report

After cleanup, briefly list:

- Files deleted
- Functions/components removed
- Import statements cleaned up
- Any dependencies that might be removable

Keep it concise - just the facts of what was cleaned up.
