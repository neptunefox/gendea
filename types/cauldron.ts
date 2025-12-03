export interface BrewingCardPosition {
  x: number
  y: number
  rotation: number
  scale: number
}

export interface BrewingCardDisplay {
  id: string
  content: string
  displayText: string
  position: BrewingCardPosition
  isNew: boolean
}

export interface CauldronStreamState {
  isStreaming: boolean
  currentText: string
  words: string[]
  visibleWordCount: number
}
