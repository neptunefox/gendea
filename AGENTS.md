## Tooling Guidance

- Use `bun` for installing dependencies and running the local development server.
- The app is built with Vue 3 and VueFlow for the node-based canvas.
- Preferred commands:
  - `bun install` (if dependencies are added)
  - `bun run build` (builds the Vue app using Vite)
  - `bun run dev` (builds and starts the Bun server)
  - `bun run docker:rebuild` (manual rebuild of the Docker image without running it)

For interacting with local LLMs, Ollama already exposes an HTTP API that the Bun server proxies to, so Python is not required here. If you need advanced orchestration or scientific tooling later, introduce Python alongside Bun-backed UI components.

### Vue Architecture

- `src/main.js` - Entry point that mounts the Vue app
- `src/App.vue` - Root component managing state and orchestrating child components
- `src/components/` - Vue components (GroveCanvas, BranchNode, InputBar, etc.)
- `src/composables/` - Reusable composition functions (useOllamaAPI, useBranchManager)
- VueFlow handles the canvas, pan/zoom, and node positioning with automatic layout

### Docker workflow

- Build the container with `docker build -t ollama-grove .`.
- Run it with `docker run --rm -p 3000:3000 -e OLLAMA_BASE_URL=http://host.docker.internal:11434 ollama-grove`.
- On Linux, add `--add-host host.docker.internal:host-gateway` so the container reaches the host Ollama daemon.

### Collaboration modes

- Brainstorm mode keeps the guide in divergent thinking: the search bar captures sparks, the hint nudges incubation, and the response card surfaces “Fresh Directions / Moves Now / Step Away.”
- Build & Ship mode shifts to convergent thinking: the search bar captures tests or blockers, and the response card delivers “Reality Check / Test Plan / Follow-through.”
- Each mode swaps the placeholder, hint, three nudges under the search bar, and its bespoke system prompt while keeping an independent log of captured inputs.
- The UI mirrors a stripped search screen: brand + model picker, mode toggle, single input, a guide response card, and a simple chronological log. Every capture is stored and fed back to the guide on subsequent queries to drive ideation.
