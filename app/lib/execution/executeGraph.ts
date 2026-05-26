import { executeSwap } from "./executeSwap";
import { executeBridge } from "./executeBridge";

import {
  createExecutionState,
} from "./executionState";

import { fallbackExecutor } from "./fallbackExecutor";

type ExecutionStep =
  | {
      type: "swap";

      chain: string;

      fromToken: string;

      toToken: string;
    }
  | {
      type: "bridge";

      bridge: string;

      fromChain: string;

      toChain: string;

      token: string;
    };

export async function executeGraph(
  executionGraph: ExecutionStep[]
) {
  const states = [];

  for (
    let i = 0;
    i < executionGraph.length;
    i++
  ) {
    const step = executionGraph[i];

    states.push(
      createExecutionState(
        i,
        "executing",
        `Executing ${step.type}`
      )
    );

    try {
      if (step.type === "swap") {
        await executeSwap(
          step.chain,
          step.fromToken,
          step.toToken
        );
      }

      if (step.type === "bridge") {
        const result =
          await executeBridge(
            step.bridge,
            step.fromChain,
            step.toChain,
            step.token
          );

        if (!result.success) {
          const fallback =
            await fallbackExecutor(
              step.bridge
            );

          states.push(
            createExecutionState(
              i,
              "fallback",
              `Fallback to ${fallback}`
            )
          );
        }
      }

      states.push(
        createExecutionState(
          i,
          "completed",
          `${step.type} completed`
        )
      );
    } catch {
      states.push(
        createExecutionState(
          i,
          "failed",
          `${step.type} failed`
        )
      );

      break;
    }
  }

  return {
    success: true,

    states,
  };
}