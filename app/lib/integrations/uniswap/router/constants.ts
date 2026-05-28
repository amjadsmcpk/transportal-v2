export const UNISWAP_V3_ROUTER =
  "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const DEFAULT_DEADLINE_SECONDS =
  60 * 20;

export const DEFAULT_FEE_TIER =
  3000;

export const ERC20_ABI = [
  "function approve(address spender,uint256 amount) external returns (bool)",
];

export const SWAP_ROUTER_ABI = [
  "function exactInputSingle(tuple(address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
];