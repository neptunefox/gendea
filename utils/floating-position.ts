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
