## UX & UI

### Visual Weight & Hierarchy

- Reduce visual weight by minimizing layers, containers, and nesting. Flat structures feel lighter than deeply nested ones.
- Question every wrapper element - if it only exists for styling, consider applying styles directly to the content.
- Avoid redundant information displays. If data is visible elsewhere on the page, don't repeat it.
- Remove metadata that explains the system rather than helping the user act (e.g., "Memory on · avoids repeats" when the behavior is already evident).

### Component Patterns

- Follow familiar UI patterns: buttons inside inputs (like search bars), not separated below them.
- Position action buttons where users expect them - inside or overlapping the input area, not as a separate row.
- Use icons that clearly communicate intent. When in doubt, add a tooltip that appears on hover.
- Avoid creating drawers/panels for content that's already accessible via navigation.

### Information Architecture

- Don't duplicate navigation. If there's a nav link to a page, don't also add a button in the content area.
- Show progress and context through the content itself, not through separate status displays.
- Thread history, entry counts, and timestamps are visible in the feed - no need for summary stats.

### Interaction Design

- Group related controls tightly and pair each action with context so intent reads instantly.
- Keep momentum visible by showing where someone is in the flow and what the next step is.
- Proximity between output and action beats distant controls.
- Limit simultaneous decisions on any view - gate options behind filters or tiers so the default state feels calm.

### Content Restoration

- When resurfacing saved work, restore identifiers, timestamps, and contents automatically so users can continue without rebuilding context.

### When Reviewing UI

- Ask: "Is this information already visible elsewhere?"
- Ask: "Does this container add value or just visual weight?"
- Ask: "Would a first-time user understand this without the label?"
- Ask: "Is this following a familiar pattern users know from other apps?"
