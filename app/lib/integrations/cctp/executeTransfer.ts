import { buildCCTPTransfer } from "./buildTransfer";

import { CCTPTransferRequest } from "./types";

export async function executeCCTPTransfer(
  request: CCTPTransferRequest
) {
  try {
    const transfer =
      await buildCCTPTransfer(
        request
      );

    if (!transfer.success) {
      return {
        success: false,

        error:
          "Transfer build failed",
      };
    }

    return {
      success: true,

      protocol: "cctp",

      txHash:
        "cctp_" + Date.now(),

      transfer,
    };
  } catch (error) {
    console.error(
      "CCTP Execution Error:",
      error
    );

    return {
      success: false,

      error:
        "CCTP execution failed",
    };
  }
}