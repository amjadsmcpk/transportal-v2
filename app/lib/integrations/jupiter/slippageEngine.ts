export function calculateDynamicSlippage(
  amount: number
) {
  /*
    SIMPLE BASE MODEL
  */

  if (amount < 100) {
    return 50;
  }

  if (amount < 1000) {
    return 100;
  }

  if (amount < 10000) {
    return 150;
  }

  return 300;
}

export function formatSlippage(
  slippageBps: number
) {
  return (
    slippageBps / 100
  ).toFixed(2) + "%";
}