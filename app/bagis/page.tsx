"use client";

import { ChevronRight, HeartHandshake, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "../_components/Header";
import { useAppData } from "../_lib/AppDataContext";
import { formatCurrency, getDonorsWithTotals } from "../_lib/calculations";

export default function BagisPage() {
  const { donors, transactions } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");

  const donorsWithTotals = useMemo(
    () => getDonorsWithTotals(donors, transactions),
    [donors, transactions]
  );

  const filteredDonors = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (query === "") return donorsWithTotals;
    return donorsWithTotals.filter((d) => d.name.toLocaleLowerCase("tr-TR").includes(query));
  }, [donorsWithTotals, searchQuery]);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Bağış Yönetimi
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kayıtlı bağışçılar ve toplam bağış tutarları
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

        {filteredDonors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            {donors.length === 0
              ? "Henüz kayıtlı bağışçı bulunmuyor."
              : "Aramanızla eşleşen bağışçı bulunamadı."}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredDonors.map((donor) => (
              <li
                key={donor.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link
                  href={`/bagis/${donor.id}`}
                  className="flex items-center gap-3 rounded-lg transition-colors active:bg-zinc-50 dark:active:bg-zinc-800"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <HeartHandshake size={20} />
                  </span>

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-1">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {donor.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {donor.donationCount} bağış
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-right">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(donor.total)}
                        </p>
                        <p className="text-xs text-zinc-400">toplam</p>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
