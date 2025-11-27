import { useLangChainService } from './langchain-service'
import {
  CanvasExpandSchema,
  CanvasTidyUpSchema,
  CanvasConnectionLabelSchema,
  ProactiveQuestionSchema,
  ProactiveToolSchema,
  IncompleteNodeSchema,
  UnrelatedConnectionSchema,
  DisconnectedClustersSchema,
  type CanvasExpand,
  type CanvasTidyUp,
  type CanvasConnectionLabel,
  type ProactiveQuestion,
  type ProactiveTool,
  type IncompleteNode,
  type UnrelatedConnection,
  type DisconnectedClusters
} from './langchain-schemas'
import {
  CANVAS_EXPAND_SYSTEM_PROMPT,
  CANVAS_TIDY_UP_SYSTEM_PROMPT,
  CANVAS_CONNECTION_LABEL_SYSTEM_PROMPT,
  PROACTIVE_QUESTION_SYSTEM_PROMPT,
  PROACTIVE_TOOL_SYSTEM_PROMPT,
  INCOMPLETE_NODE_SYSTEM_PROMPT,
  UNRELATED_CONNECTION_SYSTEM_PROMPT,
  DISCONNECTED_CLUSTERS_SYSTEM_PROMPT,
  buildCanvasExpandPrompt,
  buildCanvasTidyUpPrompt,
  buildCanvasConnectionLabelPrompt,
  buildProactiveQuestionPrompt,
  buildProactiveToolPrompt,
  buildIncompleteNodePrompt,
  buildUnrelatedConnectionPrompt,
  buildDisconnectedClustersPrompt
} from './langchain-prompts'
import type { CanvasNodeData } from './langchain-types'

export interface ExpandResult {
  nodes: Array<{
    type: string
    content: string
    metadata?: {
      color?: string
      icon?: string
      link?: string
      completed?: boolean
    }
  }>
  connections: Array<{
    sourceIndex: number
    targetIndex: number
    relationship: 'leads_to' | 'requires' | 'blocks' | 'relates_to'
  }>
}

export interface TidyUpResult {
  clusters: Array<{
    name: string
    nodeIds: string[]
    layout: 'grid' | 'linear' | 'radial'
  }>
}


export async function expandNode(
  nodeContent: string,
  nodeType: string
): Promise<ExpandResult> {
  const langChain = useLangChainService()
  const prompt = buildCanvasExpandPrompt(nodeContent, nodeType)

  const result = await langChain.generateStructured<typeof CanvasExpandSchema>({
    prompt,
    systemPrompt: CANVAS_EXPAND_SYSTEM_PROMPT,
    schema: CanvasExpandSchema
  })

  return {
    nodes: result.nodes.map(node => ({
      type: mapNodeType(node.type),
      content: node.content,
      metadata: node.metadata
    })),
    connections: result.connections
  }
}

export async function tidyUpNodes(
  nodes: CanvasNodeData[]
): Promise<TidyUpResult> {
  const langChain = useLangChainService()
  const prompt = buildCanvasTidyUpPrompt(
    nodes.map(n => ({ id: n.id, type: n.type, content: n.content }))
  )

  const result = await langChain.generateStructured<typeof CanvasTidyUpSchema>({
    prompt,
    systemPrompt: CANVAS_TIDY_UP_SYSTEM_PROMPT,
    schema: CanvasTidyUpSchema
  })

  return { clusters: result.clusters }
}

export async function suggestConnectionLabel(
  sourceContent: string,
  targetContent: string
): Promise<CanvasConnectionLabel> {
  const langChain = useLangChainService()
  const prompt = buildCanvasConnectionLabelPrompt(sourceContent, targetContent)

  return langChain.generateStructured<typeof CanvasConnectionLabelSchema>({
    prompt,
    systemPrompt: CANVAS_CONNECTION_LABEL_SYSTEM_PROMPT,
    schema: CanvasConnectionLabelSchema
  })
}

export async function detectVagueIdea(
  nodeContent: string,
  nodeType: string
): Promise<ProactiveQuestion> {
  const langChain = useLangChainService()
  const prompt = buildProactiveQuestionPrompt(nodeContent, nodeType)

  return langChain.generateStructured<typeof ProactiveQuestionSchema>({
    prompt,
    systemPrompt: PROACTIVE_QUESTION_SYSTEM_PROMPT,
    schema: ProactiveQuestionSchema
  })
}

export async function suggestTool(
  nodeContent: string
): Promise<ProactiveTool> {
  const langChain = useLangChainService()
  const prompt = buildProactiveToolPrompt(nodeContent)

  return langChain.generateStructured<typeof ProactiveToolSchema>({
    prompt,
    systemPrompt: PROACTIVE_TOOL_SYSTEM_PROMPT,
    schema: ProactiveToolSchema
  })
}

export async function detectIncompleteNode(
  nodeContent: string,
  nodeType: string
): Promise<IncompleteNode> {
  const langChain = useLangChainService()
  const prompt = buildIncompleteNodePrompt(nodeContent, nodeType)

  return langChain.generateStructured<typeof IncompleteNodeSchema>({
    prompt,
    systemPrompt: INCOMPLETE_NODE_SYSTEM_PROMPT,
    schema: IncompleteNodeSchema
  })
}

export async function detectUnrelatedConnection(
  sourceContent: string,
  targetContent: string
): Promise<UnrelatedConnection> {
  const langChain = useLangChainService()
  const prompt = buildUnrelatedConnectionPrompt(sourceContent, targetContent)

  return langChain.generateStructured<typeof UnrelatedConnectionSchema>({
    prompt,
    systemPrompt: UNRELATED_CONNECTION_SYSTEM_PROMPT,
    schema: UnrelatedConnectionSchema
  })
}

export async function detectDisconnectedClusters(
  nodes: Array<{ id: string; type: string; content: string }>,
  edges: Array<{ sourceId: string; targetId: string }>
): Promise<DisconnectedClusters> {
  const langChain = useLangChainService()
  const prompt = buildDisconnectedClustersPrompt(nodes, edges)

  return langChain.generateStructured<typeof DisconnectedClustersSchema>({
    prompt,
    systemPrompt: DISCONNECTED_CLUSTERS_SYSTEM_PROMPT,
    schema: DisconnectedClustersSchema
  })
}

function mapNodeType(aiType: string): string {
  const typeMap: Record<string, string> = {
    sticky: 'sticky-note',
    shape: 'shape',
    text: 'text-block',
    input: 'input',
    tool: 'tool',
    task: 'task',
    idea: 'idea',
    goal: 'goal'
  }
  return typeMap[aiType] || 'sticky-note'
}

function mapRelationshipType(
  aiRelationship: 'leads_to' | 'requires' | 'blocks' | 'relates_to'
): string {
  const relationshipMap: Record<string, string> = {
    leads_to: 'leads-to',
    requires: 'requires',
    blocks: 'blocks',
    relates_to: 'relates-to'
  }
  return relationshipMap[aiRelationship] || 'relates-to'
}

export { mapRelationshipType }
