"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "../_components/Header";
import ResidentFormModal from "../_components/ResidentFormModal";
import Select from "../_components/Select";
import { useAppData } from "../_lib/AppDataContext";
import {
  formatCurrency,
  getPledgedDuesTotalForMonth,
  getRecentMonthOptions,
  getReceivedDuesTotalForMonth,
  getResidentPaymentStatusInMonth,
  isResidentActiveInMonth,
} from "../_lib/calculations";
import type { Resident } from "../_lib/types";

type PaymentStatusFilter = "hepsi" | "odeyen" | "kismi" | "odemeyen";

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusFilter; label: string }[] = [
  { value: "hepsi", label: "Tümü" },
  { value: "odeyen", label: "Ödeyen" },
  { value: "kismi", label: "Kısmi Ödeyen" },
  { value: "odemeyen", label: "Ödemeyen" },
];

const MONTH_OPTIONS = getRecentMonthOptions(12);

export default function AidatPage() {
  const { residents, transactions, addResident, updateResident, removeResident } = useAppData();
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [isAddingResident, setAddingResident] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("hepsi");

  const isModalOpen = isAddingResident || editingResident !== null;
  const selectedMonth = MONTH_OPTIONS[selectedMonthIndex];

  const searchedResidents = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    return residents.filter(
      (r) => query === "" || r.name.toLocaleLowerCase("tr-TR").includes(query)
    );
  }, [residents, searchQuery]);

  const activeResidents = useMemo(
    () =>
      searchedResidents.filter((r) =>
        isResidentActiveInMonth(r, selectedMonth.year, selectedMonth.month)
      ),
    [searchedResidents, selectedMonth]
  );

  const statusCounts = useMemo(() => {
    let paid = 0;
    let partial = 0;
    let unpaid = 0;
    for (const r of activeResidents) {
      const status = getResidentPaymentStatusInMonth(
        r,
        transactions,
        selectedMonth.year,
        selectedMonth.month
      );
      if (status === "odedi") paid++;
      else if (status === "kismi") partial++;
      else unpaid++;
    }
    return { paid, partial, unpaid };
  }, [activeResidents, transactions, selectedMonth]);
  const paidRatio =
    activeResidents.length > 0
      ? Math.round((statusCounts.paid / activeResidents.length) * 100)
      : 0;

  const pledgedTotal = useMemo(
    () => getPledgedDuesTotalForMonth(activeResidents, selectedMonth.year, selectedMonth.month),
    [activeResidents, selectedMonth]
  );
  const receivedTotal = useMemo(() => {
    const activeIds = new Set(activeResidents.map((r) => r.id));
    return getReceivedDuesTotalForMonth(
      transactions.filter((tx) => tx.residentId && activeIds.has(tx.residentId)),
      selectedMonth.year,
      selectedMonth.month
    );
  }, [activeResidents, transactions, selectedMonth]);

  const filteredResidents = useMemo(() => {
    return searchedResidents.filter((r) => {
      if (paymentStatus === "hepsi") return true;
      if (!isResidentActiveInMonth(r, selectedMonth.year, selectedMonth.month)) return false;
      const status = getResidentPaymentStatusInMonth(
        r,
        transactions,
        selectedMonth.year,
        selectedMonth.month
      );
      if (paymentStatus === "odeyen") return status === "odedi";
      if (paymentStatus === "kismi") return status === "kismi";
      return status === "odemedi";
    });
  }, [searchedResidents, transactions, paymentStatus, selectedMonth]);

  function closeModal() {
    setAddingResident(false);
    setEditingResident(null);
  }

  async function handleSave(data: Omit<Resident, "id" | "createdAt" | "dueHistory">) {
    if (editingResident) {
      await updateResident(editingResident.id, data);
    } else {
      await addResident(data);
    }
  }

  async function handleDelete() {
    if (editingResident) {
      await removeResident(editingResident.id);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Aidat Yönetimi
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Kayıtlı üyeler ve aylık taahhüt edilen aidat tutarları
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddingResident(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:px-5"
          >
            <Plus size={18} />
            Yeni Kişi Ekle
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={String(selectedMonthIndex)}
            onChange={(v) => setSelectedMonthIndex(Number(v))}
            options={MONTH_OPTIONS.map((opt, index) => ({
              value: String(index),
              label: opt.label,
            }))}
            className="sm:w-48"
          />

          <Select
            value={paymentStatus}
            onChange={(v) => setPaymentStatus(v as PaymentStatusFilter)}
            options={PAYMENT_STATUS_OPTIONS}
            className="sm:w-40"
          />
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
            placeholder="Kişi ara..."
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {paymentStatus === "hepsi" && activeResidents.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {MONTH_OPTIONS[selectedMonthIndex].label} tahsilat oranı
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                %{paidRatio}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {formatCurrency(receivedTotal)}
              </span>
              <span className="text-sm text-zinc-400">/ {formatCurrency(pledgedTotal)}</span>
            </div>
            <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(statusCounts.paid / activeResidents.length) * 100}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${(statusCounts.partial / activeResidents.length) * 100}%` }}
              />
              <div
                className="h-full bg-rose-400 transition-all"
                style={{ width: `${(statusCounts.unpaid / activeResidents.length) * 100}%` }}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ödeyen: {statusCounts.paid}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Kısmi Ödeyen: {statusCounts.partial}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Ödemeyen: {statusCounts.unpaid}
              </span>
            </div>
          </div>
        )}

        {filteredResidents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
            {residents.length === 0
              ? "Henüz kayıtlı kişi bulunmuyor."
              : "Aramanızla eşleşen kişi bulunamadı."}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredResidents.map((resident) => {
              const isActiveThisMonth = isResidentActiveInMonth(
                resident,
                selectedMonth.year,
                selectedMonth.month
              );
              const paymentStatusThisMonth = getResidentPaymentStatusInMonth(
                resident,
                transactions,
                selectedMonth.year,
                selectedMonth.month
              );

              return (
              <li
                key={resident.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <UserRound size={20} />
                    {isActiveThisMonth && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                        {paymentStatusThisMonth === "odedi" && (
                          <CheckCircle2
                            size={16}
                            className="fill-emerald-500 text-white dark:fill-emerald-400"
                          />
                        )}
                        {paymentStatusThisMonth === "kismi" && (
                          <AlertCircle
                            size={16}
                            className="fill-amber-500 text-white dark:fill-amber-400"
                          />
                        )}
                        {paymentStatusThisMonth === "odemedi" && (
                          <XCircle
                            size={16}
                            className="fill-rose-500 text-white dark:fill-rose-400"
                          />
                        )}
                      </span>
                    )}
                  </span>

                  <Link
                    href={`/aidat/${resident.id}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg py-1 transition-colors active:bg-zinc-50 dark:active:bg-zinc-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {resident.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-right">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(resident.monthlyDue)}
                        </p>
                        <p className="text-xs text-zinc-400">/ ay</p>
                      </div>
                      <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600" />
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setEditingResident(resident)}
                    aria-label={`${resident.name} kişisini düzenle`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <ResidentFormModal
          resident={editingResident ?? undefined}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={editingResident ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
