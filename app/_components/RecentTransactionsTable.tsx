"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark } from "lucide-react";
import { useAppData } from "../_lib/AppDataContext";
import {
  compareByRecentlyAdded,
  formatCurrencyValue,
  formatDate,
  getPartyName,
} from "../_lib/calculations";
import type { Transaction } from "../_lib/types";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

function AmountBadge({ tx }: { tx: Transaction }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tx.type === "gelir"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
      }`}
    >
      {tx.type === "gelir" ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
      {tx.type === "gelir" ? "+" : "-"}
      {formatCurrencyValue(tx.amount, tx.currency)}
    </span>
  );
}

export default function RecentTransactionsTable({
  transactions,
  onSelectTransaction,
}: RecentTransactionsTableProps) {
  const { residents } = useAppData();
  const recent = [...transactions].sort(compareByRecentlyAdded).slice(0, 10);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-4 sm:px-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Son 10 İşlem
        </h2>
      </div>

      {recent.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-zinc-400">
          Henüz işlem bulunmuyor.
        </p>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800/60">
            {recent.map((tx) => (
              <li key={tx.id}>
                <button
                  type="button"
                  onClick={() => onSelectTransaction(tx)}
                  className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {tx.description}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {getPartyName(tx, residents)}
                      </p>
                    </div>
                    <AmountBadge tx={tx} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      İşlem: {formatDate(tx.transactionDate)}
                      <span className="mx-1 text-zinc-300 dark:text-zinc-600">·</span>
                      Eklenme: {formatDate(tx.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {tx.method === "banka" ? (
                        <Landmark size={13} />
                      ) : (
                        <Banknote size={13} />
                      )}
                      {tx.method === "banka" ? "Banka" : "Nakit"}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-800">
                  <th className="px-6 py-3 font-medium">İşlem Tarihi</th>
                  <th className="px-6 py-3 font-medium">Eklenme Tarihi</th>
                  <th className="px-6 py-3 font-medium">Açıklama</th>
                  <th className="px-6 py-3 font-medium">İlgili Kişi</th>
                  <th className="px-6 py-3 font-medium">Yöntem</th>
                  <th className="px-6 py-3 text-right font-medium">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="cursor-pointer border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-zinc-800 dark:text-zinc-200">
                      {tx.description}
                    </td>
                    <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {getPartyName(tx, residents)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        {tx.method === "banka" ? (
                          <Landmark size={14} />
                        ) : (
                          <Banknote size={14} />
                        )}
                        {tx.method === "banka" ? "Banka" : "Nakit"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <AmountBadge tx={tx} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
