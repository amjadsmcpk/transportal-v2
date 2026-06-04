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
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  let data: Record<string, unknown>;

  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`[${url}] Returned non-JSON response.`);
  }

  if (!response.ok || !data.success) {
    throw new Error(
      `[${url}] ${String(data.error || "Provider request failed")}`
    );
  }

  return data;
}

function disabled(provider: ProviderName, reason: string): ExecutionResult {
  return {
    success: false,
    provider,
    status: `${provider} is not live yet.`,
    error: reason,
  };
}

export async function executeProvider(
  params: ExecuteProviderParams
): Promise<ExecutionResult> {
  const baseUrl = getBaseUrl();

  try {
    if (params.provider === "mayan") {
      const data = await postJson(`${baseUrl}/api/transportal/prepare`, {
        amount: params.amount,
        fromToken: params.fromToken,
        fromChain: params.fromChain,
        toToken: params.toToken || params.fromToken,
        toChain: params.toChain,
        receiver: params.receiver,
      });

      if (!data.quote) {
        return {
          success: false,
          provider: "mayan",
          status: "Mayan quote missing.",
          error: "Mayan could not prepare this route.",
        };
      }

      return {
        success: true,
        provider: "mayan",
        txHash: "MAYAN_READY_FOR_WALLET_EXECUTION",
        status: "Mayan route ready for wallet execution.",
      };
    }

    if (params.provider === "uniswap") {
      const sameChain =
        params.fromChain.toLowerCase() === params.toChain.toLowerCase();

      if (!sameChain) {
        return disabled(
          "uniswap",
          "Uniswap only supports same-chain swaps."
        );
      }

      const data = await postJson(`${baseUrl}/api/execute-uniswap`, {
        tokenIn: params.fromToken,
        tokenOut: params.toToken || params.fromToken,
        amount: params.amount,
        chainId: getChainId(params.fromChain),
      });

      return {
        success: true,
        provider: "uniswap",
        txHash: String(data.txHash || "UNISWAP_TRANSACTION_READY"),
        status: "Uniswap transaction prepared.",
      };
    }

    if (params.provider === "cctp") {
      return disabled(
        "cctp",
        "CCTP is selected for USDC transfers, but real CCTP execution is not implemented yet."
      );
    }

    if (params.provider === "wormhole") {
      return disabled(
        "wormhole",
        "Wormhole route selected, but real Wormhole execution is not implemented yet."
      );
    }

    if (params.provider === "jupiter") {
      return disabled(
        "jupiter",
        "Jupiter route selected, but real Jupiter execution is not implemented yet."
      );
    }

    return {
      success: false,
      provider: params.provider,
      status: "Unsupported provider.",
      error: "Provider unsupported.",
    };
  } catch (error) {
    return {
      success: false,
      provider: params.provider,
      status: "Execution failed.",
      error:
        error instanceof Error
          ? error.message
          : "Provider execution failed.",
    };
  }
}

function getChainId(chain: string) {
  const normalized = chain.toLowerCase();

  if (normalized === "ethereum") return 1;
  if (normalized === "base") return 8453;
  if (normalized === "arbitrum") return 42161;
  if (normalized === "polygon") return 137;
  if (normalized === "optimism") return 10;
  if (normalized === "avalanche") return 43114;

  return 1;
}