import type {
  MayanQuoteParams,
  MayanQuoteResult,
} from "./types";

export async function getMayanQuote(
  params: MayanQuoteParams
): Promise<MayanQuoteResult> {
  try {
    const res = await fetch("/api/mayan-quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    if (!data.success) {
      return {
        success: false,
        provider: "mayan",
        quote: null,
        error: data.error || "Mayan quote failed.",
      };
    }

    return {
      success: true,
      provider: "mayan",
      quote: data.quote,
    };
  } catch (error) {
    return {
      success: false,
      provider: "mayan",
      quote: null,
      error:
        error instanceof Error ? error.message : "Mayan quote failed.",
    };
  }
}