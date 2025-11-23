import { z } from 'zod'

export const SparkIdeaSchema = z.object({
  text: z.string().min(10).describe('A specific, actionable idea (1-2 sentences)')
})

export const SparkCoreIdeasSchema = z.array(SparkIdeaSchema).min(5).max(6)

export const SparkLensSchema = z.object({
  ideas: z
    .array(z.string().min(10))
    .length(2)
    .describe('Two specific ideas following the lens constraints'),
  anchor: z.string().min(10).describe('One sentence explaining the reframing or insight')
})

export const CauldronOutputSchema = z.object({
  synthesis: z
    .string()
    .min(50)
    .describe('A compelling, actionable synthesized idea (2-3 sentences)')
})

export const CanvasNodeSchema = z.object({
  type: z
    .enum(['sticky', 'shape', 'text', 'input', 'tool', 'task', 'idea', 'goal'])
    .describe('The type of canvas node'),
  content: z.string().describe('The main content or text of the node'),
  metadata: z
    .object({
      color: z.string().optional(),
      icon: z.string().optional(),
      link: z.string().optional(),
      completed: z.boolean().optional()
    })
    .optional()
})

export const CanvasExpandSchema = z.object({
  nodes: z
    .array(CanvasNodeSchema)
    .min(3)
    .max(5)
    .describe('3-5 related nodes connected to the original'),
  connections: z
    .array(
      z.object({
        sourceIndex: z.number().describe('Index of source node (0 = original node)'),
        targetIndex: z.number().describe('Index of target node in the nodes array'),
        relationship: z
          .enum(['leads_to', 'requires', 'blocks', 'relates_to'])
          .describe('Type of relationship')
      })
    )
    .describe('Connections between nodes')
})

export const CanvasTidyUpSchema = z.object({
  clusters: z
    .array(
      z.object({
        name: z.string().describe('Name of the cluster or flow'),
        nodeIds: z.array(z.string()).describe('IDs of nodes in this cluster'),
        layout: z.enum(['grid', 'linear', 'radial']).describe('Suggested layout pattern')
      })
    )
    .describe('Organized clusters of nodes')
})

export const CanvasConnectionLabelSchema = z.object({
  label: z.string().min(3).max(50).describe('Suggested label for the connection'),
  relationship: z
    .enum(['leads_to', 'requires', 'blocks', 'relates_to'])
    .describe('Suggested relationship type')
})

export const ProactiveQuestionSchema = z.object({
  shouldAsk: z.boolean().describe('Whether a clarifying question should be asked'),
  question: z.string().optional().describe('The clarifying question to ask'),
  reason: z.string().optional().describe('Why this question would be helpful')
})

export const ProactiveToolSchema = z.object({
  shouldSuggest: z.boolean().describe('Whether a tool should be suggested'),
  toolName: z.string().optional().describe('Name of the suggested tool'),
  toolLink: z.string().optional().describe('Link to the tool'),
  reason: z.string().optional().describe('Why this tool would be helpful')
})

export type SparkIdea = z.infer<typeof SparkIdeaSchema>
export type SparkCoreIdeas = z.infer<typeof SparkCoreIdeasSchema>
export type SparkLens = z.infer<typeof SparkLensSchema>
export type CauldronOutput = z.infer<typeof CauldronOutputSchema>
export type CanvasNode = z.infer<typeof CanvasNodeSchema>
export type CanvasExpand = z.infer<typeof CanvasExpandSchema>
export type CanvasTidyUp = z.infer<typeof CanvasTidyUpSchema>
export type CanvasConnectionLabel = z.infer<typeof CanvasConnectionLabelSchema>
export type ProactiveQuestion = z.infer<typeof ProactiveQuestionSchema>
export type ProactiveTool = z.infer<typeof ProactiveToolSchema>
