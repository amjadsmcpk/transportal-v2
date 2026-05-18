declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

export async function switchEvmChain(chainId: number) {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected.");
  }

  const hexChainId = `0x${chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: hexChainId,
        },
      ],
    });

    return true;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to switch chain.");
  }
}