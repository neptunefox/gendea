# Grove - Idea Canvas

Research-backed brainstorming and idea development tool with AI assistance.

## Quick Start

### Local Development (Recommended)
```bash
bun install
bun run dev
```

Visit http://localhost:3000

### Docker Development
```bash
# Start with live file updates
bun run docker:dev

# Or manually
docker compose up
```

Files in `public/` and `server.ts` are mounted as volumes - changes reflect immediately without rebuild.

### Docker Production
```bash
docker compose build
docker compose up -d
```

## Requirements

- Ollama running locally on port 11434
- At least one model installed (e.g., `ollama pull llama2`)

## Features

- **Tree-based idea canvas** with automatic layout (ELK.js)
- **Auto mode detection** - AI determines diverge vs converge thinking
- **Research-backed prompts** - Applies cognitive science principles
- **Smooth interactions** - Gesture-based dragging, pan & zoom
- **Immediate feedback** - Seeds appear instantly, branches grow in background

## Architecture

- **Frontend**: Vue 3 with VueFlow for node-based canvas
- **Backend**: Bun server proxying to Ollama
- **AI**: Local Ollama models
- **Build**: Vite for Vue compilation and bundling

### Project Structure

```
src/
├── main.js                 # Vue app entry point
├── App.vue                 # Root component
├── components/
│   ├── GroveCanvas.vue     # Main canvas with VueFlow
│   ├── BranchNode.vue      # Individual branch node
│   ├── InputBar.vue        # Input and model selection
│   ├── BranchMenu.vue      # Context menu for branches
│   └── Toast.vue           # Toast notifications
└── composables/
    ├── useOllamaAPI.js     # Ollama API integration
    └── useBranchManager.js # Branch state management
```
