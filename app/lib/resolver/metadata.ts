import { resolveChain } from "./resolveChain";
import { resolveToken } from "./resolveToken";

export async function getAssetMetadata(
  chain: string,
  token: string
) {
  const resolvedChain = resolveChain(chain);
  const resolvedToken = resolveToken(chain, token);

  if (!resolvedChain) {
    return {
      success: false,
      error: "Unsupported chain.",
    };
  }

  if (!resolvedToken) {
    return {
      success: false,
      error: "Unsupported token.",
    };
  }

  return {
    success: true,

    chain: {
      id: resolvedChain.id,
      name: resolvedChain.name,
      symbol: resolvedChain.symbol,
      rpc: resolvedChain.rpc,
      explorer: resolvedChain.explorer,
      nativeToken: resolvedChain.nativeToken,
    },

    token: {
      symbol: resolvedToken.symbol,
      name: resolvedToken.name,
      decimals: resolvedToken.decimals,
      native: resolvedToken.native,
      standard: resolvedToken.standard,
      address: resolvedToken.address || null,
    },
  };
}