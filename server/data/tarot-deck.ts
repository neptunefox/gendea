export interface TarotCard {
  id: string
  name: string
  numeral: string
  archetype: string
  keywords: string[]
  meaning: string
  creativePrompt: string
}

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'the-fool',
    name: 'The Fool',
    numeral: '0',
    archetype: 'The Beginner',
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'leap of faith'],
    meaning:
      'A fresh start unburdened by past failures. The courage to begin without knowing the ending.',
    creativePrompt: 'What would you try if you had no reputation to protect?'
  },
  {
    id: 'the-magician',
    name: 'The Magician',
    numeral: 'I',
    archetype: 'The Creator',
    keywords: ['willpower', 'creation', 'manifestation', 'resourcefulness'],
    meaning:
      'All the tools you need are already within reach. Channel scattered potential into focused action.',
    creativePrompt: 'What could you build today using only what you already have?'
  },
  {
    id: 'the-high-priestess',
    name: 'The High Priestess',
    numeral: 'II',
    archetype: 'The Intuitive',
    keywords: ['intuition', 'mystery', 'inner knowledge', 'patience'],
    meaning: 'Trust the knowing that lives beneath logic. Some answers arrive only in stillness.',
    creativePrompt: 'What does your gut tell you that your mind keeps dismissing?'
  },
  {
    id: 'the-empress',
    name: 'The Empress',
    numeral: 'III',
    archetype: 'The Nurturer',
    keywords: ['abundance', 'creativity', 'nurturing', 'growth'],
    meaning: 'Creation through care and patience. Ideas need tending like gardens—water them.',
    creativePrompt: 'What small idea deserves more attention and nourishment?'
  },
  {
    id: 'the-emperor',
    name: 'The Emperor',
    numeral: 'IV',
    archetype: 'The Builder',
    keywords: ['structure', 'authority', 'stability', 'discipline'],
    meaning: 'Vision requires scaffolding. Build the systems that let creativity flourish.',
    creativePrompt: 'What structure or routine would help your best idea take shape?'
  },
  {
    id: 'the-hierophant',
    name: 'The Hierophant',
    numeral: 'V',
    archetype: 'The Teacher',
    keywords: ['tradition', 'wisdom', 'mentorship', 'shared knowledge'],
    meaning: 'Learn from those who walked before you. Tradition holds encoded wisdom.',
    creativePrompt: 'Who has solved a similar problem? What can you learn from their path?'
  },
  {
    id: 'the-lovers',
    name: 'The Lovers',
    numeral: 'VI',
    archetype: 'The Choice',
    keywords: ['choice', 'alignment', 'values', 'partnership'],
    meaning:
      'A crossroads that reveals what you truly value. Choose what resonates, not what impresses.',
    creativePrompt: 'Between your competing ideas, which one feels most like you?'
  },
  {
    id: 'the-chariot',
    name: 'The Chariot',
    numeral: 'VII',
    archetype: 'The Driver',
    keywords: ['momentum', 'determination', 'willpower', 'victory'],
    meaning:
      'Harness opposing forces into forward motion. Confidence carries you through uncertainty.',
    creativePrompt: "What's the one thing you could push forward on today with full focus?"
  },
  {
    id: 'strength',
    name: 'Strength',
    numeral: 'VIII',
    archetype: 'The Tamer',
    keywords: ['courage', 'patience', 'soft power', 'inner strength'],
    meaning: 'True power is gentle persistence. Tame your doubts with patience, not force.',
    creativePrompt: 'What fear could you befriend instead of fight?'
  },
  {
    id: 'the-hermit',
    name: 'The Hermit',
    numeral: 'IX',
    archetype: 'The Seeker',
    keywords: ['solitude', 'reflection', 'inner guidance', 'wisdom'],
    meaning: 'Step back from the noise. Clarity comes from turning inward.',
    creativePrompt: 'What question needs quiet contemplation, not more input?'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    numeral: 'X',
    archetype: 'The Cycle',
    keywords: ['change', 'cycles', 'fate', 'turning points'],
    meaning:
      "Seasons change. What's stuck today may turn tomorrow—position yourself for the shift.",
    creativePrompt: 'What timing-dependent opportunity should you prepare for now?'
  },
  {
    id: 'justice',
    name: 'Justice',
    numeral: 'XI',
    archetype: 'The Balancer',
    keywords: ['fairness', 'truth', 'accountability', 'cause and effect'],
    meaning: "Honest assessment cuts through wishful thinking. What's the truth of your situation?",
    creativePrompt: 'What trade-off have you been avoiding? Name it clearly.'
  },
  {
    id: 'the-hanged-man',
    name: 'The Hanged Man',
    numeral: 'XII',
    archetype: 'The Pauser',
    keywords: ['suspension', 'new perspective', 'letting go', 'sacrifice'],
    meaning: 'Sometimes progress means stopping. A new angle emerges when you release your grip.',
    creativePrompt: 'What would look different if you flipped your assumption upside down?'
  },
  {
    id: 'death',
    name: 'Death',
    numeral: 'XIII',
    archetype: 'The Transformer',
    keywords: ['endings', 'transformation', 'release', 'transition'],
    meaning: 'Something must end for something new to begin. Let the old version go.',
    creativePrompt: 'What idea, habit, or identity are you ready to release?'
  },
  {
    id: 'temperance',
    name: 'Temperance',
    numeral: 'XIV',
    archetype: 'The Alchemist',
    keywords: ['balance', 'moderation', 'synthesis', 'patience'],
    meaning: 'Blend opposites into something new. The magic is in the mixing.',
    creativePrompt: 'What two seemingly incompatible ideas could you combine?'
  },
  {
    id: 'the-devil',
    name: 'The Devil',
    numeral: 'XV',
    archetype: 'The Shadow',
    keywords: ['attachment', 'illusion', 'shadow self', 'bondage'],
    meaning: 'Examine what holds you captive. The chains may be looser than they appear.',
    creativePrompt: 'What limiting belief is running in the background of your work?'
  },
  {
    id: 'the-tower',
    name: 'The Tower',
    numeral: 'XVI',
    archetype: 'The Disruptor',
    keywords: ['upheaval', 'revelation', 'breaking down', 'liberation'],
    meaning: 'Sudden clarity destroys false structures. What falls was never solid.',
    creativePrompt: 'What assumption would change everything if it were wrong?'
  },
  {
    id: 'the-star',
    name: 'The Star',
    numeral: 'XVII',
    archetype: 'The Guide',
    keywords: ['hope', 'inspiration', 'renewal', 'serenity'],
    meaning: 'After the storm, clarity. Follow what genuinely inspires you.',
    creativePrompt: 'What vision keeps calling to you, even when logic says otherwise?'
  },
  {
    id: 'the-moon',
    name: 'The Moon',
    numeral: 'XVIII',
    archetype: 'The Dreamer',
    keywords: ['intuition', 'illusion', 'uncertainty', 'the unconscious'],
    meaning: 'Not everything is as it seems. Navigate by feel when the path is unclear.',
    creativePrompt: "What's the strange, half-formed idea you haven't spoken aloud yet?"
  },
  {
    id: 'the-sun',
    name: 'The Sun',
    numeral: 'XIX',
    archetype: 'The Radiant',
    keywords: ['joy', 'success', 'vitality', 'clarity'],
    meaning: 'Move toward what gives you energy. Enthusiasm is information.',
    creativePrompt: 'What part of your work genuinely excites you? Do more of that.'
  },
  {
    id: 'judgement',
    name: 'Judgement',
    numeral: 'XX',
    archetype: 'The Awakener',
    keywords: ['reflection', 'reckoning', 'calling', 'rebirth'],
    meaning: 'A call to rise into your next version. Answer honestly.',
    creativePrompt: "What are you being called to do that you've been postponing?"
  },
  {
    id: 'the-world',
    name: 'The World',
    numeral: 'XXI',
    archetype: 'The Completer',
    keywords: ['completion', 'integration', 'accomplishment', 'wholeness'],
    meaning: "A cycle completes. Honor what you've built before beginning anew.",
    creativePrompt: 'What project or phase is ready to be called "done"?'
  }
]

export function getCardById(id: string): TarotCard | undefined {
  return MAJOR_ARCANA.find(card => card.id === id)
}

export function getRandomCards(count: number, seed: string): TarotCard[] {
  const seededRandom = (s: string) => {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return () => {
      hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b)
      hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35)
      hash ^= hash >>> 16
      return (hash >>> 0) / 0xffffffff
    }
  }

  const random = seededRandom(seed)
  const shuffled = [...MAJOR_ARCANA].sort(() => random() - 0.5)
  return shuffled.slice(0, count)
}
