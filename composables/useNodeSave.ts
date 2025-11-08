import type { Node } from '~/types/node'

interface SaveNodeInput {
  problem: string
  assumptions: string[]
}

interface SaveNodeResult {
  node: Node
  suggestedTags: string[]
}

export const useNodeSave = () => {
  const saveNode = async (input: SaveNodeInput): Promise<SaveNodeResult> => {
    const branchId = crypto.randomUUID()
    
    const ideaNode: Partial<Node> = {
      type: 'Idea',
      text: input.problem,
      branchId,
      childIds: []
    }

    const assumptionNodes: Partial<Node>[] = input.assumptions.map(assumption => ({
      type: 'Assumption',
      text: assumption,
      branchId,
      childIds: []
    }))

    const response = await $fetch<SaveNodeResult>('/api/nodes', {
      method: 'POST',
      body: {
        idea: ideaNode,
        assumptions: assumptionNodes
      }
    })

    return response
  }

  const generateNodeName = (problemText: string): string => {
    const words = problemText.trim().split(/\s+/)
    if (words.length <= 3) return problemText
    return words.slice(0, 3).join(' ') + '...'
  }

  const suggestTags = (problemText: string): string[] => {
    const tags: string[] = []
    const lowerText = problemText.toLowerCase()

    if (lowerText.includes('build') || lowerText.includes('create')) {
      tags.push('creation')
    }
    if (lowerText.includes('improve') || lowerText.includes('better')) {
      tags.push('improvement')
    }
    if (lowerText.includes('learn') || lowerText.includes('understand')) {
      tags.push('learning')
    }
    if (lowerText.includes('fix') || lowerText.includes('solve')) {
      tags.push('problem-solving')
    }

    return tags.slice(0, 3)
  }

  return {
    saveNode,
    generateNodeName,
    suggestTags
  }
}
