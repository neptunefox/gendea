export interface OracleSession {
  id: string
  visitorId: string
  ideaId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OracleMessage {
  id: string
  sessionId: string
  role: 'user' | 'oracle'
  content: string
  createdAt: Date
  sparkedAt?: Date | null
}
