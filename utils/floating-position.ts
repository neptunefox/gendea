export interface Position {
  x: number
  y: number
}

export interface CardBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface ViewportDimensions {
  width: number
  height: number
}

export interface SideLayoutConfig {
  cardWidth: number
  cardHeight: number
  verticalGap: number
  horizontalOffset: number
  cardsPerSide: number
}

export const DEFAULT_SIDE_CONFIG: SideLayoutConfig = {
  cardWidth: 220,
  cardHeight: 90,
  verticalGap: 16,
  horizontalOffset: 300,
  cardsPerSide: 3
}

export interface ArcLayoutConfig {
  arcRadius: number
  arcStartAngle: number
  arcEndAngle: number
  maxCards: number
  cardWidth: number
  cardHeight: number
}

export interface ArcPosition {
  x: number
  y: number
  rotation: number
  scale: number
}

export const DEFAULT_ARC_CONFIG: ArcLayoutConfig = {
  arcRadius: 340,
  arcStartAngle: -70,
  arcEndAngle: 70,
  maxCards: 5,
  cardWidth: 200,
  cardHeight: 100
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function calculateArcTangentRotation(angle: number): number {
  return angle * 0.1
}

export function generateArcPosition(
  viewport: ViewportDimensions,
  cardIndex: number,
  totalCards: number,
  config: Partial<ArcLayoutConfig> = {}
): ArcPosition {
  const { arcRadius, arcStartAngle, arcEndAngle, maxCards, cardWidth, cardHeight } = {
    ...DEFAULT_ARC_CONFIG,
    ...config
  }

  const displayedCards = Math.min(totalCards, maxCards)
  const centerX = viewport.width / 2 - 30
  const cauldronTopY = viewport.height * 0.22

  let angle: number
  if (displayedCards === 1) {
    angle = 0
  } else {
    const usedSpan = ((displayedCards - 1) / (maxCards - 1)) * (arcEndAngle - arcStartAngle)
    const startAngle = -usedSpan / 2
    const step = usedSpan / (displayedCards - 1)
    angle = startAngle + cardIndex * step
  }

  const angleRad = (angle * Math.PI) / 180
  const x = centerX + arcRadius * Math.sin(angleRad) - cardWidth / 2
  const baseY = cauldronTopY - 200
  const arcOffset = Math.abs(angle) * 1.5
  const y = baseY + arcOffset - cardHeight / 2

  const tangentRotation = calculateArcTangentRotation(angle)
  const randomOffset = (seededRandom(cardIndex + 1) - 0.5) * 10
  const rotation = tangentRotation + randomOffset

  const scale = 1 - Math.abs(angle) * 0.001

  return { x, y, rotation, scale }
}

export function generateShelfPosition(
  viewport: ViewportDimensions,
  cardIndex: number,
  config: Partial<SideLayoutConfig> = {}
): Position {
  const { cardWidth, cardHeight, verticalGap, horizontalOffset, cardsPerSide } = {
    ...DEFAULT_SIDE_CONFIG,
    ...config
  }

  const sidebarOffset = 30
  const centerX = viewport.width / 2 - sidebarOffset
  const centerY = viewport.height / 2

  const isLeftSide = cardIndex < cardsPerSide
  const positionOnSide = isLeftSide ? cardIndex : cardIndex - cardsPerSide

  const totalHeight = cardsPerSide * cardHeight + (cardsPerSide - 1) * verticalGap
  const inputFieldOffset = 100
  const bottomY = centerY + inputFieldOffset
  const startY = bottomY - totalHeight
  const y = startY + positionOnSide * (cardHeight + verticalGap)

  let x: number
  if (isLeftSide) {
    x = centerX - horizontalOffset - cardWidth
  } else {
    x = centerX + horizontalOffset
  }

  return { x, y }
}
