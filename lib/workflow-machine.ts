import { setup, assign } from 'xstate'
import type { WorkflowContext, WorkflowEvent } from '../types/workflow'

export const workflowMachine = setup({
  types: {
    context: {} as WorkflowContext,
    events: {} as WorkflowEvent
  },
  actions: {
    incrementMissedPlans: assign({
      missedPlans: ({ context }) => context.missedPlans + 1
    }),
    resetMissedPlans: assign({
      missedPlans: 0
    })
  },
  guards: {
    hasTwoMissedPlans: ({ context }) => context.missedPlans >= 2,
    hasLowExpectancy: ({ context }) =>
      context.expectancyRating !== undefined && context.expectancyRating < 3
  }
}).createMachine({
  id: 'workflow',
  initial: 'Seeded',
  context: {
    branchId: '',
    missedPlans: 0
  },
  states: {
    Seeded: {
      on: {
        SAVE: { target: 'Diverging' }
      }
    },
    Diverging: {
      on: {
        SLOTS_FILLED: { target: 'Clarifying' },
        TIMER_ENDED: { target: 'Clarifying' }
      }
    },
    Clarifying: {
      on: {
        NORTH_STAR_PINNED: { target: 'Planning' }
      }
    },
    Planning: {
      on: {
        THRESHOLDS_SET: { target: 'Testing' }
      }
    },
    Testing: {
      on: {
        LOG_ENTRY: {
          target: 'Reviewing',
          actions: 'resetMissedPlans'
        },
        PLAN_MISSED: [
          {
            guard: 'hasTwoMissedPlans',
            target: 'Stalled',
            actions: 'incrementMissedPlans'
          },
          {
            actions: 'incrementMissedPlans'
          }
        ]
      }
    },
    Reviewing: {
      on: {
        PLAN_MISSED: [
          {
            guard: 'hasTwoMissedPlans',
            target: 'Stalled',
            actions: 'incrementMissedPlans'
          },
          {
            actions: 'incrementMissedPlans'
          }
        ]
      }
    },
    Stalled: {
      on: {
        LOW_EXPECTANCY: { target: 'Action crisis' }
      }
    },
    'Action crisis': {
      on: {
        EXIT: { target: 'Archived' },
        COMPLETE: { target: 'Archived' }
      }
    },
    Archived: {
      type: 'final'
    }
  },
  on: {
    EXIT: { target: '.Archived' },
    COMPLETE: { target: '.Archived' }
  }
})
