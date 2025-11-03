const META_PROMPT = `Analyze this input and respond with ONLY one word:
- "DIVERGE" if exploring, brainstorming, generating options, asking what-if
- "CONVERGE" if testing, validating, planning concrete steps, making decisions

Input: `;

const SYSTEM_PROMPTS = {
  diverge: `You are a creative thinking partner. Generate 3-5 distinct options or directions.

Your approach:
- Explore different angles, not just variations
- Draw unexpected connections and analogies
- Add constraints that focus thinking
- Stay curious, never judge
- Keep each option brief (1-2 sentences max)

Format: Return ONLY bullet points, nothing else. No explanations, no meta-commentary.`,

  converge: `You are a strategic thinking partner. Help make ideas concrete and testable.

Your approach:
- Identify what needs testing
- Suggest small, cheap experiments
- Create specific if-then plans
- Define clear next actions
- Focus on this-week steps

Format: Return ONLY bullet points, nothing else. No explanations, no meta-commentary.`
};

const PROMPTS = {
  diverge: {
    seed: (text) => `Seed idea: "${text}"

Generate 3 different directions to explore. Make them genuinely distinct. Brief bullets only.`,
    
    grow: (text) => `Idea: "${text}"

Generate 3 ways this could develop. Think laterally - what analogies or unexpected angles apply? Brief bullets only.`,
    
    split: (text) => `Idea: "${text}"

Generate 3 alternative approaches. Challenge the core assumption - what if we did this completely differently? Brief bullets only.`
  },
  
  converge: {
    seed: (text) => `Goal: "${text}"

What are 3 core assumptions to test first? For each, state the assumption clearly. Brief bullets only.`,
    
    grow: (text) => `Idea: "${text}"

What's one concrete action for this week? Be specific: what to do, what to measure, when to check. One bullet only.`,
    
    test: (text) => `Idea: "${text}"

Create a test plan:
- Core assumption to validate
- Small cheap test to run
- What to measure
- If-then plan

Brief bullets only.`
  }
};

export function useOllamaAPI() {
  const detectMode = async (text, model) => {
    if (!model) return 'diverge';
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: META_PROMPT + text }]
        })
      });
      
      if (!res.ok) return 'diverge';
      
      const json = await res.json();
      const reply = json?.message?.content?.trim().toUpperCase() ?? '';
      
      return reply.includes('CONVERGE') ? 'converge' : 'diverge';
    } catch (error) {
      return 'diverge';
    }
  };

  const parseBullets = (text) => {
    const lines = text.split(/\n/).filter(line => line.trim());
    const bullets = lines
      .filter(line => line.trim().match(/^[-•*]\s/))
      .map(line => line.replace(/^[-•*]\s+/, '').trim())
      .filter(line => line.length > 0);
    
    if (bullets.length > 0) {
      return bullets.slice(0, 5);
    }
    
    const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 10);
    return sentences.length > 0 ? sentences.slice(0, 5) : [text.trim()];
  };

  const generateResponse = async ({ text, model, mode, action }) => {
    const prompt = PROMPTS[mode][action](text);
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[mode] },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    if (!res.ok) throw new Error(await res.text());
    
    const json = await res.json();
    const reply = json?.message?.content?.trim() ?? '';
    
    return parseBullets(reply);
  };

  const loadModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error('Failed');
      return await res.json();
    } catch (error) {
      console.error('Load models error', error);
      return [];
    }
  };

  return {
    detectMode,
    generateResponse,
    loadModels
  };
}
