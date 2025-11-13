import { createActor } from 'xstate'

import type { WorkflowContext, WorkflowEvent } from '../types/workflow'

import { workflowMachine } from './workflow-machine'

export class WorkflowService {
  private actors: Map<string, ReturnType<typeof createActor<typeof workflowMachine>>> = new Map()

  getOrCreateActor(branchId: string, initialContext?: Partial<WorkflowContext>) {
    if (!this.actors.has(branchId)) {
      const actor = createActor(workflowMachine, {
        input: {
          branchId,
          missedPlans: initialContext?.missedPlans ?? 0,
          expectancyRating: initialContext?.expectancyRating
        }
      })
      actor.start()
      this.actors.set(branchId, actor)
    }
    return this.actors.get(branchId)!
  }

  transition(branchId: string, event: WorkflowEvent) {
    const actor = this.getOrCreateActor(branchId)
    actor.send(event)
    return actor.getSnapshot()
  }

  getCurrentState(branchId: string) {
    const actor = this.actors.get(branchId)
    return actor?.getSnapshot().value ?? 'Seeded'
  }

  getContext(branchId: string) {
    const actor = this.actors.get(branchId)
    return actor?.getSnapshot().context
  }

  stopActor(branchId: string) {
    const actor = this.actors.get(branchId)
    if (actor) {
      actor.stop()
      this.actors.delete(branchId)
    }
  }
}

export const workflowService = new WorkflowService()
