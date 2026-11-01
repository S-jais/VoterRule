import { WorkflowDefinition, WorkflowState, WorkflowStep } from '../interfaces.js';
import { WORKFLOW_DEFINITIONS } from './definitions.js';

export class WorkflowEngine {
  public static getDefinition(workflowId: string): WorkflowDefinition | undefined {
    return WORKFLOW_DEFINITIONS[workflowId];
  }

  public static startWorkflow(workflowId: string): WorkflowState | undefined {
    const def = this.getDefinition(workflowId);
    if (!def || def.steps.length === 0) return undefined;

    const firstStep = def.steps[0]!;
    return {
      workflowId,
      currentStepId: firstStep.id,
      stepIndex: 1,
      totalSteps: def.steps.length,
      answers: {},
      completed: false,
      cancelled: false,
    };
  }

  public static transition(
    state: WorkflowState,
    selectedOptionId: string
  ): { nextState: WorkflowState; step?: WorkflowStep } {
    const def = this.getDefinition(state.workflowId);
    if (!def) {
      return { nextState: { ...state, completed: true } };
    }

    const currentStep = def.steps.find((s) => s.id === state.currentStepId);
    const chosenOption = currentStep?.options?.find((o) => o.id === selectedOptionId);

    const updatedAnswers = {
      ...state.answers,
      [state.currentStepId]: selectedOptionId,
    };

    if (!chosenOption?.nextStepId) {
      // Completed workflow
      return {
        nextState: {
          ...state,
          answers: updatedAnswers,
          completed: true,
        },
      };
    }

    const nextStep = def.steps.find((s) => s.id === chosenOption.nextStepId);
    if (!nextStep) {
      return {
        nextState: {
          ...state,
          answers: updatedAnswers,
          completed: true,
        },
      };
    }

    const nextStepIndex = def.steps.findIndex((s) => s.id === nextStep.id) + 1;

    return {
      nextState: {
        ...state,
        currentStepId: nextStep.id,
        stepIndex: nextStepIndex > 0 ? nextStepIndex : state.stepIndex + 1,
        answers: updatedAnswers,
        completed: false,
      },
      step: nextStep,
    };
  }

  public static cancel(state: WorkflowState): WorkflowState {
    return {
      ...state,
      cancelled: true,
      completed: true,
    };
  }
}

