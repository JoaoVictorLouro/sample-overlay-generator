type CurrencyPayload = {
  date?: string;
  [code: string]: string | Record<string, number> | undefined;
};

function rateUrls(code: string): string[] {
  return [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${code}.json`,
  ];
}

function readUsdRate(payload: CurrencyPayload, code: string): number | null {
  const table = payload[code];
  if (table === undefined || typeof table === "string") {
    return null;
  }
  const usd = table.usd;
  if (typeof usd !== "number" || !Number.isFinite(usd)) {
    return null;
  }
  return usd;
}

export function parseCurrency(raw: string): string {
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3,10}$/.test(code)) {
    throw new Error(`currency must be an ISO-style code, got "${raw}"`);
  }
  return code;
}

export function parsePriceValue(raw: string | number): number {
  const parsed = typeof raw === "number" ? raw : Number(raw.trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`value must be a non-negative number, got "${raw}"`);
  }
  return parsed;
}

export async function fetchUsdRate(currency: string): Promise<number> {
  if (currency === "USD") {
    return 1;
  }
  const code = currency.toLowerCase();
  const errors: string[] = [];
  for (const url of rateUrls(code)) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${url} → HTTP ${response.status}`);
        continue;
      }
      const payload = (await response.json()) as CurrencyPayload;
      const usd = readUsdRate(payload, code);
      if (usd === null) {
        errors.push(`${url} → missing usd rate for ${currency}`);
        continue;
      }
      return usd;
    } catch (error) {
      errors.push(
        `${url} → ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  throw new Error(
    `Could not fetch USD rate for ${currency}. Tried:\n${errors.join("\n")}`,
  );
}

export async function resolveUsdAmount(
  value: number,
  currency: string,
): Promise<number | null> {
  if (currency === "USD") {
    return null;
  }
  const rate = await fetchUsdRate(currency);
  return value * rate;
}
