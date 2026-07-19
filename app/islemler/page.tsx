"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Header from "../_components/Header";
import TransactionDetailModal from "../_components/TransactionDetailModal";
import { useAppData } from "../_lib/AppDataContext";
import {
  compareByRecentlyAdded,
  formatCurrencyValue,
  formatDate,
  getPartyName,
} from "../_lib/calculations";
import type { IncomeCategory, Transaction, TransactionType } from "../_lib/types";

type TypeFilter = "hepsi" | TransactionType;
type IncomeCategoryFilter = "hepsi" | IncomeCategory;

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "hepsi", label: "Tümü" },
  { value: "gelir", label: "Gelir" },
  { value: "gider", label: "Gider" },
];

const INCOME_CATEGORY_OPTIONS: { value: IncomeCategoryFilter; label: string }[] = [
  { value: "hepsi", label: "Tümü" },
  { value: "aidat", label: "Aidat" },
  { value: "bagis", label: "Bağış" },
];

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

export default function IslemlerPage() {
  const { transactions, residents } = useAppData();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("hepsi");
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState<IncomeCategoryFilter>("hepsi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  function handleTypeFilterChange(next: TypeFilter) {
    setTypeFilter(next);
    if (next !== "gelir") setIncomeCategoryFilter("hepsi");
  }

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");

    return [...transactions]
      .filter((tx) => typeFilter === "hepsi" || tx.type === typeFilter)
      .filter(
        (tx) =>
          typeFilter !== "gelir" ||
          incomeCategoryFilter === "hepsi" ||
          tx.incomeCategory === incomeCategoryFilter
      )
      .filter((tx) => {
        if (query === "") return true;
        const party = getPartyName(tx, residents).toLocaleLowerCase("tr-TR");
        return (
          tx.description.toLocaleLowerCase("tr-TR").includes(query) ||
          party.includes(query)
        );
      })
      .sort(compareByRecentlyAdded);
  }, [transactions, typeFilter, incomeCategoryFilter, searchQuery, residents]);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">İşlemler</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tüm gelir ve gider işlemlerinin geçmişi
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="grid w-full gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm sm:inline-grid sm:w-auto"
            style={{ gridTemplateColumns: `repeat(${TYPE_OPTIONS.length}, minmax(0, 1fr))` }}
          >
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTypeFilterChange(opt.value)}
                className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors sm:py-1.5 ${
                  typeFilter === opt.value
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Açıklama veya kişi ara..."
              className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>
        </div>

        {typeFilter === "gelir" && (
          <div
            className="grid w-full gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm sm:inline-grid sm:w-auto"
            style={{ gridTemplateColumns: `repeat(${INCOME_CATEGORY_OPTIONS.length}, minmax(0, 1fr))` }}
          >
            {INCOME_CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIncomeCategoryFilter(opt.value)}
                className={`min-h-10 rounded-lg px-4 text-sm font-medium transition-colors sm:py-1 ${
                  incomeCategoryFilter === opt.value
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {filteredTransactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-zinc-400">
              {transactions.length === 0
                ? "Henüz işlem bulunmuyor."
                : "Aramanızla eşleşen işlem bulunamadı."}
            </p>
          ) : (
            <>
              {/* Mobile: card list */}
              <ul className="divide-y divide-zinc-100 md:hidden dark:divide-zinc-800/60">
                {filteredTransactions.map((tx) => (
                  <li key={tx.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(tx)}
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
                        <span>İşlem: {formatDate(tx.transactionDate)}</span>
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
                      <th className="px-6 py-3 font-medium">Açıklama</th>
                      <th className="px-6 py-3 font-medium">İlgili Kişi</th>
                      <th className="px-6 py-3 font-medium">Yöntem</th>
                      <th className="px-6 py-3 text-right font-medium">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="cursor-pointer border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                          {formatDate(tx.transactionDate)}
                        </td>
                        <td className="max-w-xs truncate px-6 py-3.5 font-medium text-zinc-800 dark:text-zinc-200">
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
      </div>

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
