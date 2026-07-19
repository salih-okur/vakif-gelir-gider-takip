"use client";

import { ArrowLeft, Banknote, HeartHandshake, Landmark } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Header from "../../_components/Header";
import { useAppData } from "../../_lib/AppDataContext";
import { formatCurrency, formatDate, getDonorTransactions } from "../../_lib/calculations";

export default function DonorDetailPage() {
  const { donorId } = useParams<{ donorId: string }>();
  const router = useRouter();
  const { donors, transactions } = useAppData();

  const donor = donors.find((d) => d.id === donorId);

  const donorTransactions = useMemo(
    () => (donor ? getDonorTransactions(transactions, donor.id) : []),
    [donor, transactions]
  );

  if (!donor) {
    return (
      <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Bağışçı bulunamadı.</p>
          <Link
            href="/bagis"
            className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            <ArrowLeft size={16} /> Bağış listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/bagis")}
          className="flex min-h-11 w-fit items-center gap-2 rounded-lg px-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft size={16} /> Bağış listesine dön
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {donor.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Toplam {donorTransactions.length} bağış
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {donorTransactions.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-zinc-400">
              Bu bağışçıya ait bağış bulunamadı.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {donorTransactions.map((tx) => (
                <li key={tx.id} className="flex flex-col gap-2 px-4 py-3.5 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                        <HeartHandshake size={18} />
                      </span>
                      <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                        {tx.method === "banka" ? (
                          <Landmark size={12} />
                        ) : (
                          <Banknote size={12} />
                        )}
                        İşlem: {formatDate(tx.transactionDate)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <p className="pl-12 text-sm text-zinc-600 dark:text-zinc-300">
                    {tx.description}
                  </p>
                  <p className="pl-12 text-xs text-zinc-400">
                    Eklenme: {formatDate(tx.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
