"use client";

import { Banknote, HeartHandshake, Landmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Header from "../_components/Header";
import TimeFilterTabs from "../_components/TimeFilterTabs";
import TransactionDetailModal from "../_components/TransactionDetailModal";
import { useAppData } from "../_lib/AppDataContext";
import {
  compareByRecentlyAdded,
  filterTransactionsByTime,
  formatCurrency,
  formatDate,
  getDonationsTotal,
  getPartyName,
} from "../_lib/calculations";
import type { Transaction, TimeFilter } from "../_lib/types";

export default function BagisPage() {
  const { transactions, residents } = useAppData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1ay");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const donations = useMemo(
    () =>
      filterTransactionsByTime(transactions, timeFilter)
        .filter((tx) => tx.type === "gelir" && tx.incomeCategory === "bagis")
        .sort(compareByRecentlyAdded),
    [transactions, timeFilter]
  );

  const totalDonations = useMemo(
    () => getDonationsTotal(transactions, timeFilter),
    [transactions, timeFilter]
  );

  const filteredDonations = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (query === "") return donations;
    return donations.filter((tx) =>
      getPartyName(tx, residents).toLocaleLowerCase("tr-TR").includes(query)
    );
  }, [donations, searchQuery, residents]);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Bağış Yönetimi
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Tüm bağış işlemlerinin listesi
            </p>
          </div>

          <TimeFilterTabs value={timeFilter} onChange={setTimeFilter} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Toplam Bağış
          </span>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalDonations)}
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bağışçı ara..."
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {filteredDonations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            {donations.length === 0
              ? "Seçili zaman aralığında kayıtlı bağış bulunmuyor."
              : "Aramanızla eşleşen bağış bulunamadı."}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredDonations.map((tx) => (
              <li key={tx.id}>
                <button
                  type="button"
                  onClick={() => setSelectedTransaction(tx)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <HeartHandshake size={20} />
                  </span>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {getPartyName(tx, residents)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                        {tx.method === "banka" ? (
                          <Landmark size={12} />
                        ) : (
                          <Banknote size={12} />
                        )}
                        İşlem: {formatDate(tx.transactionDate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
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
