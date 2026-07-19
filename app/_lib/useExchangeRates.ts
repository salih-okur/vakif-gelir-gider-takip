"use client";

import { useEffect, useState } from "react";
import type { Currency } from "./types";

type RatesToTry = Record<Exclude<Currency, "TRY">, number>;

const FALLBACK_RATES: RatesToTry = { USD: 33, EUR: 36 };

interface FrankfurterResponse {
  rates: Record<string, number>;
}

export function useExchangeRates() {
  const [rates, setRates] = useState<RatesToTry>(FALLBACK_RATES);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRates() {
      try {
        const res = await fetch("https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR");
        if (!res.ok) throw new Error(`Frankfurter request failed: ${res.status}`);
        const data: FrankfurterResponse = await res.json();

        // API returns TRY -> foreign currency rates; we need foreign -> TRY.
        const usdPerTry = data.rates.USD;
        const eurPerTry = data.rates.EUR;
        if (!usdPerTry || !eurPerTry) throw new Error("Missing rates in response");

        if (!cancelled) {
          setRates({ USD: 1 / usdPerTry, EUR: 1 / eurPerTry });
        }
      } catch {
        if (!cancelled) setRates(FALLBACK_RATES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRates();
    return () => {
      cancelled = true;
    };
  }, []);

  function toTRY(amount: number, currency: Currency): number {
    if (currency === "TRY") return amount;
    return amount * rates[currency];
  }

  return { rates, isLoading, toTRY };
}
