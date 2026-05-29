import type {
  ExecutionResult,
  ProviderName,
} from "./types";

type ExecuteProviderParams = {
  provider: ProviderName;
  amount: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken?: string;
  receiver: string;
  userPublicKey?: string;
};

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function postJson(
  url: string,
  payload: Record<string, unknown>
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  try {
    const data = JSON.parse(text);

    if (!response.ok || !data.success) {
      throw new Error(
        `[${url}] ${data.error || "Provider request failed"}`
      );
    }

    return data;
  } catch {
    throw new Error(
      `[${url}] Returned non-JSON response:\n${text.slice(0, 500)}`
    );
  }
}

export async function executeProvider(
  params: ExecuteProviderParams
): Promise<ExecutionResult> {
  const baseUrl = getBaseUrl();

  try {
    if (params.provider === "jupiter") {
      const data = await postJson(
        `${baseUrl}/api/execute-jupiter`,
        {
          inputMint:
            "So11111111111111111111111111111111111111112",
          outputMint:
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount: "1000000",
          slippageBps: 50,
          userPublicKey:
            params.userPublicKey ||
            params.receiver,
        }
      );

      return {
        success: true,
        provider: "jupiter",
        txHash:
          data.txHash ||
          data.signature ||
          "JUPITER_SWAP_TRANSACTION_READY",
        status:
          data.status ||
          "Jupiter swap transaction prepared",
      };
    }

    if (params.provider === "uniswap") {
      const data = await postJson(
        `${baseUrl}/api/execute-uniswap`,
        {
          tokenIn: params.fromToken,
          tokenOut:
            params.toToken ||
            params.fromToken,
          amount: params.amount,
          chainId: getChainId(
            params.fromChain
          ),
        }
      );

      return {
        success: true,
        provider: "uniswap",
        txHash:
          data.txHash ||
          "UNISWAP_TRANSACTION_READY",
        status:
          data.status ||
          "Uniswap transaction prepared",
      };
    }

    if (params.provider === "wormhole") {
      const data = await postJson(
        `${baseUrl}/api/execute-wormhole`,
        {
          amount: params.amount,
          fromChain:
            params.fromChain,
          toChain:
            params.toChain,
          token:
            params.fromToken,
          receiver:
            params.receiver,
        }
      );

      return {
        success: true,
        provider: "wormhole",
        txHash:
          data.txHash ||
          "WORMHOLE_TRANSFER_READY",
        status:
          data.status ||
          "Wormhole transfer initialized",
      };
    }

    if (params.provider === "cctp") {
      const data = await postJson(
        `${baseUrl}/api/execute-cctp`,
        {
          amount: params.amount,
          fromChain:
            params.fromChain,
          toChain:
            params.toChain,
          token:
            params.fromToken,
          receiver:
            params.receiver,
        }
      );

      return {
        success: true,
        provider: "cctp",
        txHash:
          data.txHash ||
          "CCTP_TRANSFER_READY",
        status:
          data.status ||
          "CCTP transfer initialized",
      };
    }

    if (params.provider === "mayan") {
      const data = await postJson(
        `${baseUrl}/api/mayan-quote`,
        {
          amount: params.amount,
          fromToken:
            params.fromToken,
          fromChain:
            params.fromChain,
          toToken:
            params.toToken ||
            params.fromToken,
          toChain:
            params.toChain,
          receiver:
            params.receiver,
        }
      );

      return {
        success: true,
        provider: "mayan",
        txHash:
          data.txHash ||
          "MAYAN_QUOTE_READY",
        status:
          "Mayan quote prepared for execution",
      };
    }

    return {
      success: false,
      provider: params.provider,
      status: "Unsupported provider",
      error: "Provider unsupported.",
    };
  } catch (error) {
    return {
      success: false,
      provider: params.provider,
      status: "Execution failed",
      error:
        error instanceof Error
          ? error.message
          : "Provider execution failed.",
    };
  }
}

function getChainId(chain: string) {
  const normalized =
    chain.toLowerCase();

  if (normalized === "ethereum")
    return 1;

  if (normalized === "base")
    return 8453;

  if (normalized === "arbitrum")
    return 42161;

  if (normalized === "polygon")
    return 137;

  return 1;
}