type ModelTag = {
  model: string;
  modified_at: string;
  digest: string;
  size: number;
};

type ChatMessage = {
  role: "system" | "assistant" | "user";
  content: string;
};

type ChatRequest = {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  mode?: "brainstorm" | "build" | "canvas";
};

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";

const SYSTEM_PROMPTS: Record<string, string> = {
  brainstorm: [
    "You are a quiet search companion in Brainstorm Mode helping the human widen the idea space.",
    "Base every suggestion on the internal research notes (divergent vs. convergent cycles, cognitive offloading, incubation walks, dissent, constraints, AI fluency, etc.). Do not mention research, studies, or evidence explicitly—treat it as behind-the-scenes reasoning.",
    "Reply in compact Markdown with three sections, keeping each bullet short:",
    "## Fresh Directions",
    "- two varied avenues or remixes that build on the latest capture without judging it.",
    "## Moves Now",
    "- two actionable nudges (capture loops, incubation, brainwriting, safe dissent, constraint tweaks).",
    "## Step Away",
    "- one suggestion for a reset (walk, light task, rest) plus a reminder to log any returning sparks.",
    "Tone: encouraging, curious, and task-focused. Keep outputs brief so they fit one screen.",
  ].join(" "),
  build: [
    "You are a quiet search companion in Build & Ship Mode helping the human turn ideas into tests.",
    "Use the internal research (goal clarity, WOOP/MCII, implementation intentions, smallest honest experiment, wise feedback, action crisis work, evaluator bias) without naming it outright.",
    "Reply in compact Markdown with three sections:",
    "## Reality Check",
    "- two bullets clarifying assumptions, success metrics, or likely blockers.",
    "## Test Plan",
    "- two bullets describing the smallest honest experiment or WOOP/if-then plan, including metric and timing.",
    "## Follow-through",
    "- one bullet for a progress check ritual or recommit/exit window, plus one reminder to protect energy (sleep, walk, trusted circle).",
    "Tone: steady, direct, supportive. Keep it lean and actionable.",
  ].join(" "),
  canvas: [
    "You are an adaptive guide living inside a node-based canvas where the human links ideas and execution plans together.",
    "Blend divergent brainstorming and convergent build instincts in every reply—offer both creative sparks and concrete experiments without mentioning any background research explicitly.",
    "Reply in tight Markdown with three sections:",
    "## Fresh Sparks",
    "- two bullets remixing or stretching the latest capture in surprising yet relevant ways.",
    "## Build Moves",
    "- two bullets translating the canvas into immediate tests, metrics, or resource checks.",
    "## Wiring Tips",
    "- one bullet suggesting how to connect new and existing nodes, plus one energy-protection reminder.",
    "Tone: curious, steady, and concise so the response fits comfortably inside one node card.",
  ].join(" "),
};

function getContentType(pathname: string) {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

async function fetchModels() {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  if (!res.ok) {
    throw new Response("Unable to load models from Ollama", { status: 502 });
  }
  const data = (await res.json()) as { models: ModelTag[] };
  return data.models;
}

async function forwardChat(body: ChatRequest) {
  const mode = body.mode ?? "brainstorm";
  const systemPrompt =
    SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.brainstorm;
  const { mode: _mode, ...rest } = body;
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...rest,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        ...body.messages.filter((msg) => msg.role !== "system"),
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Response(text || "Ollama chat failed", { status: res.status });
  }
  return res.json();
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch: async (req) => {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/api/models") {
      try {
        const models = await fetchModels();
        return Response.json(models);
      } catch (err) {
        if (err instanceof Response) return err;
        console.error("Model fetch error:", err);
        return new Response("Failed to fetch models", { status: 500 });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      try {
        const body = (await req.json()) as ChatRequest;
        const result = await forwardChat(body);
        return Response.json(result);
      } catch (err) {
        if (err instanceof Response) return err;
        console.error("Chat error:", err);
        return new Response("Chat request failed", { status: 500 });
      }
    }

    if (req.method === "GET") {
      const filePath =
        url.pathname === "/" ? "/index.html" : url.pathname;
      
      // Serve from node_modules if path starts with /node_modules
      if (filePath.startsWith("/node_modules/")) {
        try {
          const file = await Bun.file(`.${filePath}`);
          if (!(await file.exists())) {
            return new Response("Not found", { status: 404 });
          }
          return new Response(file, {
            headers: { "content-type": getContentType(filePath) },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      }
      
      // Serve from public directory
      try {
        const file = await Bun.file(`public${filePath}`);
        if (!(await file.exists())) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(file, {
          headers: { "content-type": getContentType(filePath) },
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`🌿 Ollama UI server ready on http://localhost:${server.port}`);
