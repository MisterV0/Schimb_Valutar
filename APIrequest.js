/**
 * Fetches latest exchange rates from Frankfurter (via corsproxy.io).
 * @param {string} baseCurrency - ISO 4217 code (e.g. "RON")
 * @param {string[]} comparators - Target currency codes (e.g. ["EUR", "USD"])
 * @returns {Promise<{ rates: Record<string, number>, date: string }>}
 */
export async function fetchRates(baseCurrency, comparators) {
  const list = Array.isArray(comparators)
    ? comparators.filter((c) => c && c !== baseCurrency)
    : [];

  if (!baseCurrency || list.length === 0) {
    throw new Error("fetchRates requires a base currency and at least one comparator.");
  }

  const toParam = encodeURIComponent(list.join(","));
  const from = encodeURIComponent(baseCurrency);
  //const url = `https://corsproxy.io/?https://api.frankfurter.app/latest?from=${from}&to=${toParam}`;
  const url = `/api/rates/latest?from=${from}&to=${toParam}`;


  let response;
  try {
    response = await fetch(url);
  } catch (e) {
    throw new Error("Network error while fetching rates.");
  }

  if (!response.ok) {
    throw new Error(`Rates request failed (${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from rates API.");
  }

  if (!data || typeof data !== "object" || !data.rates || typeof data.rates !== "object") {
    throw new Error("Unexpected API response shape.");
  }

  const date = typeof data.date === "string" ? data.date : "";
  const rates = { ...data.rates };

  return { rates, date };
}
