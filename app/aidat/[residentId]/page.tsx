"use client";

import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Landmark,
  MessageCircle,
  Phone,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Header from "../../_components/Header";
import TimeFilterTabs from "../../_components/TimeFilterTabs";
import { useAppData } from "../../_lib/AppDataContext";
import {
  formatCurrency,
  formatDate,
  getResidentMonthlyHistory,
  getResidentPledgedTotal,
  getResidentReceivedTotal,
  getWhatsappLink,
} from "../../_lib/calculations";
import type { TimeFilter } from "../../_lib/types";

export default function ResidentDetailPage() {
  const { residentId } = useParams<{ residentId: string }>();
  const router = useRouter();
  const { residents, transactions } = useAppData();
  const [filter, setFilter] = useState<TimeFilter>("6ay");

  const resident = residents.find((r) => r.id === residentId);

  const pledged = useMemo(
    () => (resident ? getResidentPledgedTotal(resident, filter) : 0),
    [resident, filter]
  );
  const received = useMemo(
    () => (resident ? getResidentReceivedTotal(transactions, resident.id, filter) : 0),
    [resident, transactions, filter]
  );
  const history = useMemo(
    () => (resident ? getResidentMonthlyHistory(resident, transactions, filter) : []),
    [resident, transactions, filter]
  );

  if (!resident) {
    return (
      <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Kişi bulunamadı.</p>
          <Link
            href="/aidat"
            className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            <ArrowLeft size={16} /> Aidat listesine dön
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
          onClick={() => router.push("/aidat")}
          className="flex min-h-11 w-fit items-center gap-2 rounded-lg px-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <ArrowLeft size={16} /> Aidat listesine dön
        </button>

        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {resident.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Aylık taahhüt {formatCurrency(resident.monthlyDue)}
          </p>
          {resident.phone && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              <Phone size={14} />
              {resident.phone}
            </p>
          )}
        </div>

        <TimeFilterTabs value={filter} onChange={setFilter} options={["6ay", "1yil"]} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Toplam Taahhüt Edilen
            </span>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(pledged)}
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Toplam Ödenen Aidat
            </span>
            <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(received)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-4 py-4 sm:px-6 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Aidat Ödeme Geçmişi
            </h2>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {history.map((entry) => (
              <li
                key={`${entry.year}-${entry.month}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  {entry.paid ? (
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle size={20} className="shrink-0 text-rose-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {entry.label}
                    </p>
                    {entry.paid && entry.paymentDate && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                        {entry.method === "banka" ? (
                          <Landmark size={12} />
                        ) : (
                          <Banknote size={12} />
                        )}
                        {entry.paymentCount > 1
                          ? `Son işlem: ${formatDate(entry.paymentDate)}`
                          : `İşlem: ${formatDate(entry.paymentDate)}`}
                        {entry.createdAt && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            Eklenme: {formatDate(entry.createdAt)}
                          </>
                        )}
                        {entry.paymentCount > 1 && (
                          <>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            {entry.paymentCount} ödeme
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!entry.paid && resident.phone && (
                    <a
                      href={getWhatsappLink(
                        resident.phone,
                        `${entry.label} ayı aidatınız ödenmemiş bulunmaktadır.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${entry.label} ayı için ${resident.name} kişisine WhatsApp'tan hatırlatma gönder`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      entry.paid
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                    }`}
                  >
                    {entry.paid ? `${formatCurrency(entry.amount)} Ödendi` : "Ödenmedi"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
