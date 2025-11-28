export interface Position {
  x: number
  y: number
  side: 'left' | 'right'
}

export interface CardBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface CircleSafeZone {
  type: 'circle'
  centerX: number
  centerY: number
  radius: number
}

export interface RectangleSafeZone {
  type: 'rectangle'
  left: number
  top: number
  width: number
  height: number
}

export type SafeZone = CircleSafeZone | RectangleSafeZone

export interface ViewportDimensions {
  width: number
  height: number
}

export interface PositionConfig {
  cardWidth: number
  cardHeight: number
  cardIndex: number
  sideMargin: number
  navHeight: number
  bottomInputHeight: number
  cauldronRadius: number
  minDistanceFromCauldron: number
  cardPadding: number
}

export const DEFAULT_CONFIG: PositionConfig = {
  cardWidth: 220,
  cardHeight: 100,
  cardIndex: 0,
  sideMargin: 20,
  navHeight: 60,
  bottomInputHeight: 120,
  cauldronRadius: 300,
  minDistanceFromCauldron: 320,
  cardPadding: 50
}

export function createSafeZones(viewport: ViewportDimensions, config: PositionConfig): SafeZone[] {
  const centerX = viewport.width / 2
  const cauldronY = 280

  return [
    {
      type: 'circle',
      centerX,
      centerY: cauldronY,
      radius: config.cauldronRadius
    },
    {
      type: 'rectangle',
      left: 0,
      top: 0,
      width: viewport.width,
      height: config.navHeight
    },
    {
      type: 'rectangle',
      left: centerX - 350,
      top: 480,
      width: 700,
      height: 200
    }
  ]
}

export function isInsideCircleSafeZone(
  cardBounds: CardBounds,
  zone: CircleSafeZone
): boolean {
  const cardCenterX = cardBounds.x + cardBounds.width / 2
  const cardCenterY = cardBounds.y + cardBounds.height / 2
  
  const distance = Math.sqrt(
    Math.pow(cardCenterX - zone.centerX, 2) + Math.pow(cardCenterY - zone.centerY, 2)
  )
  
  return distance < zone.radius
}

export function isInsideRectangleSafeZone(
  cardBounds: CardBounds,
  zone: RectangleSafeZone
): boolean {
  return (
    cardBounds.x < zone.left + zone.width &&
    cardBounds.x + cardBounds.width > zone.left &&
    cardBounds.y < zone.top + zone.height &&
    cardBounds.y + cardBounds.height > zone.top
  )
}

export function isInsideSafeZone(cardBounds: CardBounds, zone: SafeZone): boolean {
  if (zone.type === 'circle') {
    return isInsideCircleSafeZone(cardBounds, zone)
  }
  return isInsideRectangleSafeZone(cardBounds, zone)
}

export function isPositionValid(
  cardBounds: CardBounds,
  safeZones: SafeZone[]
): boolean {
  for (const zone of safeZones) {
    if (isInsideSafeZone(cardBounds, zone)) {
      return false
    }
  }
  return true
}

export function checkCardOverlap(
  cardBounds: CardBounds,
  existingPositions: CardBounds[],
  padding: number = DEFAULT_CONFIG.cardPadding
): boolean {
  for (const pos of existingPositions) {
    if (
      cardBounds.x < pos.x + pos.width + padding &&
      cardBounds.x + cardBounds.width + padding > pos.x &&
      cardBounds.y < pos.y + pos.height + padding &&
      cardBounds.y + cardBounds.height + padding > pos.y
    ) {
      return true
    }
  }
  return false
}


export function generateSafePosition(
  viewport: ViewportDimensions,
  existingPositions: CardBounds[],
  config: Partial<PositionConfig> = {}
): Position {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  const { cardWidth, cardHeight, cardIndex, sideMargin, navHeight, cardPadding } = fullConfig

  const centerX = viewport.width / 2
  const cauldronY = 280
  const safeZones = createSafeZones(viewport, fullConfig)

  const edgeOffset = sideMargin + 40

  const slots = [
    { x: edgeOffset, y: navHeight + 20, side: 'left' as const },
    { x: edgeOffset, y: navHeight + 20, side: 'right' as const },
    { x: edgeOffset, y: navHeight + 140, side: 'left' as const },
    { x: edgeOffset, y: navHeight + 140, side: 'right' as const },
    { x: edgeOffset, y: navHeight + 260, side: 'left' as const },
    { x: edgeOffset, y: navHeight + 260, side: 'right' as const },
    { x: edgeOffset, y: navHeight + 380, side: 'left' as const },
    { x: edgeOffset, y: navHeight + 380, side: 'right' as const },
  ]

  const slotIndex = cardIndex % slots.length
  const baseSlot = slots[slotIndex]
  
  let x = baseSlot.x + (Math.random() - 0.5) * 40
  let y = baseSlot.y + (Math.random() - 0.5) * 40

  y = Math.max(navHeight, Math.min(y, viewport.height - cardHeight - 50))

  return { x, y, side: baseSlot.side }
}
