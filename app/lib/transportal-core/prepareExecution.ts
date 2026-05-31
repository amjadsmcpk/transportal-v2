import { fetchQuote } from "@mayanfinance/swap-sdk";

type MayanToken = {
  symbol?: string;
  name?: string;
  contract?: string;
  mint?: string;
  address?: string;
  tokenAddress?: string;
  chain?: string;
  decimals?: number;
  verified?: boolean;
  disabledInSrc?: boolean;
  disabledInDest?: boolean;
};

export type PrepareExecutionInput = {
  amount: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken?: string;
  receiver: string;
};

export type PreparedExecution = {
  success: boolean;
  provider: "mayan";
  amount: string;
  amountIn64?: string;
  fromChain: string;
  toChain: string;
  fromToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  toToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  receiver: string;
  quote?: unknown;
  executable: boolean;
  error?: string;
  debug?: Record<string, unknown>;
};

const CHAIN_ALIASES: Record<string, string> = {
  eth: "ethereum",
  ethereum: "ethereum",
  mainnet: "ethereum",

  sol: "solana",
  solana: "solana",

  base: "base",

  arbitrum: "arbitrum",
  arb: "arbitrum",

  optimism: "optimism",
  op: "optimism",

  polygon: "polygon",
  matic: "polygon",

  avalanche: "avalanche",
  avax: "avalanche",

  bnb: "bsc",
  bsc: "bsc",

  sui: "sui",
};

function normalizeChain(value: unknown) {
  return CHAIN_ALIASES[String(value || "").toLowerCase().trim()] || "";
}

function normalizeSymbol(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function getTokenAddress(token: MayanToken) {
  return (
    token.contract ||
    token.mint ||
    token.address ||
    token.tokenAddress ||
    ""
  );
}

function amountToBaseUnits(amount: string, decimals: number) {
  const raw = amount.trim();

  if (!raw || Number(raw) <= 0) {
    throw new Error("Invalid amount.");
  }

  const [whole = "0", fraction = ""] = raw.split(".");
  const value =
    `${whole}${fraction.padEnd(decimals, "0").slice(0, decimals)}`.replace(
      /^0+/,
      ""
    );

  return value || "0";
}

async function getLiveMayanTokens(): Promise<MayanToken[]> {
  const res = await fetch("https://price-api.mayan.finance/v3/tokens", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Mayan token request failed: ${res.status}`);
  }

  const data = await res.json();

  if (Array.isArray(data)) {
    return data as MayanToken[];
  }

  if (data && typeof data === "object") {
    return Object.entries(data).flatMap(([chain, tokens]) => {
      if (!Array.isArray(tokens)) return [];

      return tokens.map((token) => ({
        ...(token as MayanToken),
        chain,
      }));
    });
  }

  return [];
}

function findMayanToken(
  tokens: MayanToken[],
  chain: string,
  symbol: string,
  direction: "source" | "destination"
) {
  const matches = tokens.filter((token) => {
    const tokenChain = normalizeChain(token.chain);
    const tokenSymbol = normalizeSymbol(token.symbol);
    const address = getTokenAddress(token);

    if (tokenChain !== chain) return false;
    if (tokenSymbol !== symbol) return false;
    if (!address) return false;

    if (direction === "source" && token.disabledInSrc) return false;
    if (direction === "destination" && token.disabledInDest) return false;

    return true;
  });

  const verified = matches.find((token) => token.verified);
  return verified || matches[0] || null;
}

export async function prepareExecution(
  input: PrepareExecutionInput
): Promise<PreparedExecution> {
  const amount = String(input.amount || "").trim();
  const fromChain = normalizeChain(input.fromChain);
  const toChain = normalizeChain(input.toChain);
  const fromTokenSymbol = normalizeSymbol(input.fromToken);
  const toTokenSymbol = input.toToken
    ? normalizeSymbol(input.toToken)
    : fromTokenSymbol;

  try {
    if (!amount || !fromChain || !toChain || !fromTokenSymbol || !toTokenSymbol) {
      return {
        success: false,
        provider: "mayan",
        amount,
        fromChain,
        toChain,
        fromToken: {
          symbol: fromTokenSymbol,
          address: "",
          decimals: 0,
        },
        toToken: {
          symbol: toTokenSymbol,
          address: "",
          decimals: 0,
        },
        receiver: input.receiver,
        executable: false,
        error:
          "amount, fromChain, toChain, fromToken, and toToken are required.",
        debug: {
          input,
          normalized: {
            amount,
            fromChain,
            toChain,
            fromTokenSymbol,
            toTokenSymbol,
          },
        },
      };
    }

    const tokens = await getLiveMayanTokens();

    const fromToken = findMayanToken(
      tokens,
      fromChain,
      fromTokenSymbol,
      "source"
    );

    const toToken = findMayanToken(
      tokens,
      toChain,
      toTokenSymbol,
      "destination"
    );

    if (!fromToken || !toToken) {
      return {
        success: false,
        provider: "mayan",
        amount,
        fromChain,
        toChain,
        fromToken: {
          symbol: fromTokenSymbol,
          address: fromToken ? getTokenAddress(fromToken) : "",
          decimals: Number(fromToken?.decimals || 0),
        },
        toToken: {
          symbol: toTokenSymbol,
          address: toToken ? getTokenAddress(toToken) : "",
          decimals: Number(toToken?.decimals || 0),
        },
        receiver: input.receiver,
        executable: false,
        error: "Mayan token not found or disabled for selected route.",
        debug: {
          fromChain,
          toChain,
          fromTokenSymbol,
          toTokenSymbol,
          fromTokenFound: Boolean(fromToken),
          toTokenFound: Boolean(toToken),
        },
      };
    }

    const fromTokenAddress = getTokenAddress(fromToken);
    const toTokenAddress = getTokenAddress(toToken);
    const fromDecimals = Number(fromToken.decimals || 6);
    const toDecimals = Number(toToken.decimals || 6);

    const amountIn64 = amountToBaseUnits(amount, fromDecimals);

    const quoteParams = {
      amountIn64,
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      fromChain,
      toChain,
      slippageBps: "auto",
    } as Parameters<typeof fetchQuote>[0];

    const quotes = await fetchQuote(quoteParams);
    const quote = Array.isArray(quotes) ? quotes[0] : null;

    if (!quote) {
      return {
        success: false,
        provider: "mayan",
        amount,
        amountIn64,
        fromChain,
        toChain,
        fromToken: {
          symbol: fromTokenSymbol,
          address: fromTokenAddress,
          decimals: fromDecimals,
        },
        toToken: {
          symbol: toTokenSymbol,
          address: toTokenAddress,
          decimals: toDecimals,
        },
        receiver: input.receiver,
        executable: false,
        error: "No live Mayan route available for this transaction.",
        debug: {
          quoteParams,
        },
      };
    }

    return {
      success: true,
      provider: "mayan",
      amount,
      amountIn64,
      fromChain,
      toChain,
      fromToken: {
        symbol: fromTokenSymbol,
        address: fromTokenAddress,
        decimals: fromDecimals,
      },
      toToken: {
        symbol: toTokenSymbol,
        address: toTokenAddress,
        decimals: toDecimals,
      },
      receiver: input.receiver,
      quote,
      executable: true,
      debug: {
        quoteParams,
      },
    };
  } catch (error) {
    return {
      success: false,
      provider: "mayan",
      amount,
      fromChain,
      toChain,
      fromToken: {
        symbol: fromTokenSymbol,
        address: "",
        decimals: 0,
      },
      toToken: {
        symbol: toTokenSymbol,
        address: "",
        decimals: 0,
      },
      receiver: input.receiver,
      executable: false,
      error:
        error instanceof Error
          ? error.message
          : "Transportal Core preparation failed.",
      debug: {
        input,
      },
    };
  }
}