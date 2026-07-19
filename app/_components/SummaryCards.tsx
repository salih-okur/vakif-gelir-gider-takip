"use client";

import { Banknote, Landmark, PiggyBank, Wallet } from "lucide-react";
import { useAppData } from "../_lib/AppDataContext";
import {
  formatCurrency,
  formatCurrencyValue,
  getCashBoxTotals,
  getDonationsTotal,
  getPledgedDuesTotal,
  getReceivedDuesTotal,
} from "../_lib/calculations";
import { useExchangeRates } from "../_lib/useExchangeRates";
import type { TimeFilter, Transaction } from "../_lib/types";

interface SummaryCardsProps {
  transactions: Transaction[];
  filter: TimeFilter;
}

export default function SummaryCards({ transactions, filter }: SummaryCardsProps) {
  const { residents } = useAppData();
  const { toTRY } = useExchangeRates();
  const pledged = getPledgedDuesTotal(residents, filter);
  const received = getReceivedDuesTotal(transactions, filter);
  const duesRatio = pledged > 0 ? Math.min(100, Math.round((received / pledged) * 100)) : 0;

  const donations = getDonationsTotal(transactions, filter);
  const cashBox = getCashBoxTotals(transactions, toTRY);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Taahhüt Edilen vs Gelen Aidat
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Wallet size={18} />
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(received)}
          </span>
          <span className="text-sm text-zinc-400">/ {formatCurrency(pledged)}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${duesRatio}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">%{duesRatio} tahsil edildi</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Toplam Bağış
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <PiggyBank size={18} />
          </span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(donations)}
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-400">Seçili zaman aralığında</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Kasa Durumu
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Landmark size={18} />
          </span>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(cashBox.toplam)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Landmark size={14} /> Banka
          </span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {formatCurrency(cashBox.banka)}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Banknote size={14} /> Nakit (TL karşılığı)
          </span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {formatCurrency(cashBox.nakit)}
          </span>
        </div>
        {(["TRY", "USD", "EUR"] as const).map((currency) =>
          cashBox.nakitByCurrency[currency] !== 0 ? (
            <div key={currency} className="mt-1 flex items-center justify-between pl-5 text-xs">
              <span className="text-zinc-400">Nakit {currency}</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {formatCurrencyValue(cashBox.nakitByCurrency[currency], currency)}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
