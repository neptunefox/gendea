## UX & UI

### Core Principle: Memorable & Purposeful

The app should feel like a place users are **building something**, not just using a tool. Every visit should show visible progress and momentum.

### Visual Weight & Hierarchy

- Reduce visual weight by minimizing layers, containers, and nesting. Flat structures feel lighter than deeply nested ones.
- Question every wrapper element - if it only exists for styling, consider applying styles directly to the content.
- Avoid redundant information displays. If data is visible elsewhere on the page, don't repeat it.
- Remove metadata that explains the system rather than helping the user act.

### Component Patterns

- Follow familiar UI patterns: buttons inside inputs (like search bars), not separated below them.
- Position action buttons where users expect them - inside or overlapping the input area, not as a separate row.
- Use icons that clearly communicate intent. When in doubt, add a tooltip that appears on hover.
- Avoid creating drawers/panels for content that's already accessible via navigation.

### Information Architecture

- **Show progress first**: Momentum stats and saved collection should be the first thing users see
- Don't duplicate navigation. If there's a nav link to a page, don't also add a button in the content area.
- Show progress and context through the content itself, not through separate status displays.
- Keep everything in one place when possible - avoid forcing navigation between related features.

### Interaction Design

- **Make actions clear**: Button labels should describe exactly what will happen (e.g., "Generate more" not "Explore")
- Group related controls tightly and pair each action with context so intent reads instantly.
- Keep momentum visible by showing where someone is in the flow and what the next step is.
- Proximity between output and action beats distant controls.
- Limit simultaneous decisions on any view - gate options behind filters or tiers so the default state feels calm.
- **Hover states should be functional**: Reduce lift/rotation on hover if it makes buttons hard to click (2px max lift).

### Visual Personality

- **Warm color palette**: Use coral/terracotta (#d4756f) as primary, with peachy gradients and cream backgrounds
- **Pin aesthetic**: Saved items should feel like physical pins with tacks, slight rotations, and shadows
- **Unique hover behaviors**: Use nth-child to give each item a unique tilt direction based on position
- **Subtle animations**: Cards should feel organic but not interfere with usability

### Navigation

- **Minimal floating nav**: Top-right corner, transparent with blur, fades in on hover
- **Icon-only links**: Keep it unobtrusive, let content be the focus
- No heavy nav bars that take attention away from the main content

### Notifications

- **Top-right toasts**: Near the nav where eyes naturally go
- **Light theme**: White background with warm border to match app aesthetic
- **Auto-dismiss**: 2-3 seconds, don't require interaction

### Error Handling

- **Never show static fallback content**: Let errors surface with clear messages
- **Actionable error messages**: Tell users what went wrong and what to try
- **No generic placeholders**: If generation fails, show the actual error, not dummy content

### Content Restoration

- When resurfacing saved work, restore identifiers, timestamps, and contents automatically so users can continue without rebuilding context.
- **Real-time updates**: When users save/delete items, update the UI immediately without page reload

### Context Preservation

- **Branching preserves context**: When branching from an idea, pass full conversation history to AI
- **Fresh starts are clean**: Regular generation from input should start with empty context
- **Visual indicators**: Show when something is branched with icons and parent references

### When Reviewing UI

- Ask: "Does this make users feel like they're building a collection?"
- Ask: "Is this information already visible elsewhere?"
- Ask: "Does this container add value or just visual weight?"
- Ask: "Would a first-time user understand this without the label?"
- Ask: "Is this following a familiar pattern users know from other apps?"
- Ask: "Does this create momentum or just look pretty?"
