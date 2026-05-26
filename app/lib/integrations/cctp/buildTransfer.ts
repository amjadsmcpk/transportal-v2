import { CCTPTransferRequest } from "./types";

export async function buildCCTPTransfer(
  request: CCTPTransferRequest
) {
  try {
    return {
      success: true,

      payload: {
        protocol: "cctp",

        ...request,
      },
    };
  } catch (error) {
    console.error(
      "CCTP Build Error:",
      error
    );

    return {
      success: false,

      error:
        "Failed to build CCTP transfer",
    };
  }
}