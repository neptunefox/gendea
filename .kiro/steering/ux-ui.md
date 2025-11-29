## UX & UI

### Core Principle

The app helps users generate ideas. Every screen should make the next action obvious and the current state clear. Reduce friction, increase momentum.

### Visual Weight

- Minimize layers, containers, and nesting - flat structures feel lighter
- Question every wrapper element - if it only exists for styling, apply styles directly
- Remove metadata that explains the system rather than helping the user act
- If data is visible elsewhere on the page, don't repeat it

### Layout & Spacing

- Use generous whitespace - cramped layouts feel anxious
- Group related elements tightly, separate unrelated elements clearly
- One primary action per screen - secondary actions should be visually quieter
- Inputs and their submit buttons belong together, not in separate rows

### Typography

- Headings should be scannable - users skim before reading
- Body text should be readable at a glance - short lines, adequate line-height
- Labels only when the element isn't self-explanatory
- Error messages should be specific and actionable

### Color & Contrast

- Warm palette: coral/terracotta (#d4756f) primary, cream backgrounds (#FAFAF9)
- Dark mode for Oracle only - inverted theme signals different thinking mode
- Cauldron uses purple accent (#9575cd) for mystical identity
- Success: forest green (#4A7C59), Error: muted red (#C26660)
- Sufficient contrast for accessibility - don't sacrifice readability for aesthetics

### Visual Identity per Feature

- **Spark**: Warm, bright, creative energy - the generative heart of the app
- **Oracle**: Dark, contemplative, inverted - a different mode of thinking
- **Cauldron**: Mystical, bubbling, playful - mixing and synthesis
- **History**: Quiet, archival, simple - just retrieval

### Animations & Transitions

- Transitions should be fast (150-200ms) and purposeful
- Use animations to show state change, not for decoration
- Loading states should feel alive - subtle motion, not static spinners
- Stagger animations when multiple items appear (50-100ms delay between)
- Respect prefers-reduced-motion

### Hover & Interactive States

- Max 2px lift on hover - more feels jumpy and hard to click
- Hover should preview the action, not just highlight
- Clickable elements need visible affordance even before hover
- Touch targets minimum 44px

### Empty & Loading States

- Empty states should guide: "Here's how to get started"
- Loading should indicate progress when possible
- Never show blank screens - skeleton or message always

### Toasts & Feedback

- Position: top-right, near where attention naturally goes
- Auto-dismiss after 2-3 seconds
- Light background with warm border
- Success feedback should be brief; errors need more detail

### Navigation

- Minimal, icon-only sidebar on desktop
- Bottom nav on mobile
- Never duplicate navigation in content area
- Current page should be visually indicated

### Forms & Inputs

- Inline validation where possible
- Submit on Enter when there's a single input
- Clear button inside inputs when content exists
- Placeholder text should be example content, not instructions

### Cards & Lists

- Cards should be scannable - key info visible without expanding
- Actions on cards appear on hover or are always visible if primary
- Avoid accordions unless content is genuinely optional
- Lists should feel like collections, not admin tables

### Modals & Overlays

- Use sparingly - prefer inline expansion
- Always have a clear close action
- Click outside to dismiss for non-critical modals
- Don't stack modals

### Responsive Behavior

- Mobile-first: design for smallest screen, enhance for larger
- Touch targets must work with thumbs
- Horizontal scrolling is never acceptable for primary content
- Sidebar collapses to bottom nav on mobile

### Quality Checklist

Before shipping any UI:
- Does a first-time user understand this without explanation?
- Is the primary action obvious?
- Does this screen have only one job?
- Would this look intentional in a screenshot?
- Are interactive elements clearly clickable?
- Does the animation serve a purpose?
