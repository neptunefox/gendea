import type { BrewingCardPosition } from '~/types/cauldron'

export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

export function calculateCardPositions(count: number): BrewingCardPosition[] {
  const positions: BrewingCardPosition[] = []
  const clampedCount = Math.min(Math.max(count, 0), 6)

  if (clampedCount === 0) {
    return positions
  }

  const angleStep = (2 * Math.PI) / Math.max(clampedCount, 1)
  const radiusX = 35
  const radiusY = 20

  for (let i = 0; i < clampedCount; i++) {
    const angle = angleStep * i - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
      rotation: (seededRandom(i) - 0.5) * 10,
      scale: 0.9 + seededRandom(i + 100) * 0.2
    })
  }

  return positions
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}
