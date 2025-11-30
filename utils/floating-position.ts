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
  cardWidth: 160,
  cardHeight: 70,
  verticalGap: 12,
  horizontalOffset: 320,
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

  const centerX = viewport.width / 2
  const centerY = viewport.height / 2

  const isLeftSide = cardIndex < cardsPerSide
  const positionOnSide = isLeftSide ? cardIndex : cardIndex - cardsPerSide

  const totalHeight = cardsPerSide * cardHeight + (cardsPerSide - 1) * verticalGap
  const startY = centerY - totalHeight / 2
  const y = startY + positionOnSide * (cardHeight + verticalGap)

  let x: number
  if (isLeftSide) {
    x = centerX - horizontalOffset - cardWidth
  } else {
    x = centerX + horizontalOffset
  }

  return { x, y }
}
