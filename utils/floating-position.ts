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
  sideMargin: number
  topMargin: number
  cardsPerSide: number
}

export const DEFAULT_SIDE_CONFIG: SideLayoutConfig = {
  cardWidth: 200,
  cardHeight: 90,
  verticalGap: 16,
  sideMargin: 230,
  topMargin: 180,
  cardsPerSide: 3
}

export function generateShelfPosition(
  viewport: ViewportDimensions,
  cardIndex: number,
  config: Partial<SideLayoutConfig> = {}
): Position {
  const { cardWidth, cardHeight, verticalGap, sideMargin, topMargin, cardsPerSide } = {
    ...DEFAULT_SIDE_CONFIG,
    ...config
  }

  const isLeftSide = cardIndex < cardsPerSide
  const positionOnSide = isLeftSide ? cardIndex : cardIndex - cardsPerSide

  const y = topMargin + positionOnSide * (cardHeight + verticalGap)

  let x: number
  if (isLeftSide) {
    x = sideMargin
  } else {
    x = viewport.width - cardWidth - sideMargin
  }

  return { x, y }
}
