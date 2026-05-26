export type ExecutionStatus =
  | "pending"
  | "executing"
  | "completed"
  | "failed"
  | "fallback";

export type ExecutionState = {
  step: number;

  status: ExecutionStatus;

  message: string;

  timestamp: number;
};

export function createExecutionState(
  step: number,
  status: ExecutionStatus,
  message: string
): ExecutionState {
  return {
    step,

    status,

    message,

    timestamp: Date.now(),
  };
}