import { z } from 'zod'

export const SparkIdeaSchema = z.object({
  text: z
    .string()
    .min(10)
    .describe('A specific, actionable idea (1-2 sentences, minimum 10 characters)')
})

export const SparkCoreIdeasSchema = z
  .array(SparkIdeaSchema)
  .min(5)
  .max(6)
  .describe('Array of 5-6 diverse, specific, actionable ideas')

export const SparkLensSchema = z.object({
  ideas: z
    .array(z.string().min(10))
    .length(2)
    .describe('Exactly two specific ideas following the lens constraints (each min 10 chars)'),
  anchor: z
    .string()
    .min(10)
    .describe('One sentence explaining the reframing or insight (min 10 chars)')
})

export const CauldronOutputSchema = z.object({
  synthesis: z
    .string()
    .min(50)
    .describe(
      'A compelling, actionable synthesized idea capturing the deeper pattern (2-3 sentences, min 50 chars)'
    )
})

export const CanvasNodeSchema = z.object({
  type: z
    .enum(['sticky', 'shape', 'text', 'input', 'tool', 'task', 'idea', 'goal'])
    .describe(
      'Node type: sticky (note), shape (visual), text (block), input (question), tool (resource), task (action), idea (concept), goal (target)'
    ),
  content: z.string().min(1).describe('The main content or text of the node'),
  metadata: z
    .object({
      color: z.string().optional().describe('Node color (hex or named)'),
      icon: z.string().optional().describe('Icon identifier'),
      link: z.string().optional().describe('URL for tool nodes'),
      completed: z.boolean().optional().describe('Completion status for task nodes')
    })
    .optional()
    .describe('Optional styling and state metadata')
})

export const CanvasConnectionSchema = z.object({
  sourceIndex: z
    .number()
    .int()
    .min(0)
    .describe('Index of source node (0 = original node being expanded)'),
  targetIndex: z
    .number()
    .int()
    .min(1)
    .describe('Index of target node in the generated nodes array (1-based)'),
  relationship: z
    .enum(['leads_to', 'requires', 'blocks', 'relates_to'])
    .describe(
      'Relationship type: leads_to (sequential), requires (prerequisite), blocks (dependency), relates_to (conceptual)'
    )
})

export const CanvasExpandSchema = z.object({
  nodes: z
    .array(CanvasNodeSchema)
    .min(3)
    .max(5)
    .describe('3-5 related nodes that expand on the original idea'),
  connections: z
    .array(CanvasConnectionSchema)
    .min(1)
    .describe('Connections linking the original node (index 0) to generated nodes')
})

export const CanvasClusterSchema = z.object({
  name: z.string().min(1).describe('Descriptive name for the cluster or flow'),
  nodeIds: z.array(z.string()).min(1).describe('IDs of nodes belonging to this cluster'),
  layout: z
    .enum(['grid', 'linear', 'radial'])
    .describe(
      'Layout pattern: grid (related but independent), linear (sequential), radial (central with satellites)'
    )
})

export const CanvasTidyUpSchema = z.object({
  clusters: z
    .array(CanvasClusterSchema)
    .min(1)
    .describe('Organized clusters grouping related nodes by theme, sequence, or dependency')
})

export const CanvasConnectionLabelSchema = z.object({
  label: z.string().min(3).max(50).describe('Concise label describing the connection (3-50 chars)'),
  relationship: z
    .enum(['leads_to', 'requires', 'blocks', 'relates_to'])
    .describe(
      'Relationship type: leads_to (progression), requires (prerequisite), blocks (blocker), relates_to (association)'
    )
})

export const ProactiveQuestionSchema = z.object({
  shouldAsk: z
    .boolean()
    .describe('True if the idea is too vague and needs clarification, false otherwise'),
  question: z
    .string()
    .optional()
    .describe('The clarifying question to ask (required if shouldAsk is true)'),
  reason: z
    .string()
    .optional()
    .describe('Brief explanation of why this question helps (required if shouldAsk is true)')
})

export const ProactiveToolSchema = z.object({
  shouldSuggest: z
    .boolean()
    .describe('True if a specific tool would significantly help, false otherwise'),
  toolName: z
    .string()
    .optional()
    .describe('Name of the suggested tool (required if shouldSuggest is true)'),
  toolLink: z
    .string()
    .url()
    .optional()
    .describe('URL to the tool (required if shouldSuggest is true)'),
  reason: z
    .string()
    .optional()
    .describe('Brief explanation of why this tool helps (required if shouldSuggest is true)')
})

export type SparkCoreIdeas = z.infer<typeof SparkCoreIdeasSchema>
export type SparkLensOutput = z.infer<typeof SparkLensSchema>
export type CauldronOutput = z.infer<typeof CauldronOutputSchema>
export type CanvasNode = z.infer<typeof CanvasNodeSchema>
export type CanvasConnection = z.infer<typeof CanvasConnectionSchema>
export type CanvasExpand = z.infer<typeof CanvasExpandSchema>
export type CanvasCluster = z.infer<typeof CanvasClusterSchema>
export type CanvasTidyUp = z.infer<typeof CanvasTidyUpSchema>
export type CanvasConnectionLabel = z.infer<typeof CanvasConnectionLabelSchema>
export type ProactiveQuestion = z.infer<typeof ProactiveQuestionSchema>
export type ProactiveTool = z.infer<typeof ProactiveToolSchema>

export const UnrelatedConnectionSchema = z.object({
  areUnrelated: z.boolean().describe('True if the two nodes have no clear logical connection'),
  suggestedIntermediateSteps: z
    .array(z.string())
    .max(3)
    .optional()
    .describe('1-3 intermediate steps that could bridge the gap between the nodes'),
  reasoning: z.string().optional().describe('Brief explanation of why these nodes seem unrelated')
})

export const DisconnectedClustersSchema = z.object({
  hasDisconnectedClusters: z
    .boolean()
    .describe('True if there are multiple disconnected groups of nodes'),
  clusters: z
    .array(
      z.object({
        nodeIds: z.array(z.string()).describe('IDs of nodes in this cluster'),
        theme: z.string().describe('Common theme or purpose of this cluster')
      })
    )
    .optional()
    .describe('Identified clusters of related nodes'),
  suggestedAction: z
    .enum(['group', 'connect', 'organize'])
    .optional()
    .describe('Recommended action: group into sections, connect with edges, or reorganize layout')
})

export type UnrelatedConnection = z.infer<typeof UnrelatedConnectionSchema>
export type DisconnectedClusters = z.infer<typeof DisconnectedClustersSchema>
