import { canvasNodes, canvasEdges } from '../../../../db/schema'
import { db } from '../../../db'
import { detectVagueIdea, suggestTool } from '../../../utils/canvas-ai-service'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { projectId, nodeId, nodeContent, nodeType } = body

  if (!projectId || !nodeId || !nodeContent) {
    throw createError({
      statusCode: 400,
      message: 'Project ID, node ID, and node content are required'
    })
  }

  const [vagueResult, toolResult] = await Promise.all([
    detectVagueIdea(nodeContent, nodeType || 'idea'),
    suggestTool(nodeContent)
  ])

  const createdNodes = []
  const createdEdges = []

  if (vagueResult.shouldAsk && vagueResult.question) {
    const [inputNode] = await db
      .insert(canvasNodes)
      .values({
        projectId,
        type: 'input',
        position: { x: 0, y: 0 },
        data: {
          question: vagueResult.question,
          reason: vagueResult.reason
        }
      })
      .returning()

    createdNodes.push(inputNode)

    const [edge] = await db
      .insert(canvasEdges)
      .values({
        projectId,
        sourceId: nodeId,
        targetId: inputNode.id,
        type: 'requires',
        label: 'needs clarification'
      })
      .returning()

    createdEdges.push(edge)
  }

  if (toolResult.shouldSuggest && toolResult.toolName) {
    const [toolNode] = await db
      .insert(canvasNodes)
      .values({
        projectId,
        type: 'tool',
        position: { x: 0, y: 0 },
        data: {
          name: toolResult.toolName,
          url: toolResult.toolLink,
          description: toolResult.reason
        }
      })
      .returning()

    createdNodes.push(toolNode)

    const [edge] = await db
      .insert(canvasEdges)
      .values({
        projectId,
        sourceId: nodeId,
        targetId: toolNode.id,
        type: 'relates-to',
        label: 'suggested tool'
      })
      .returning()

    createdEdges.push(edge)
  }

  return {
    vagueDetected: vagueResult.shouldAsk,
    toolSuggested: toolResult.shouldSuggest,
    nodes: createdNodes,
    edges: createdEdges
  }
})
