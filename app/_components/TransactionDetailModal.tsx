"use client";

import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark, Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "./Modal";
import { useAppData } from "../_lib/AppDataContext";
import {
  formatCurrencyValue,
  formatDate,
  getExpenseCategoryLabel,
  getPartyName,
} from "../_lib/calculations";
import { useExchangeRates } from "../_lib/useExchangeRates";
import type { Transaction } from "../_lib/types";

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  );
}

export default function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  const { residents, donors, removeTransaction } = useAppData();
  const { toTRY } = useExchangeRates();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const isIncome = transaction.type === "gelir";
  const isForeignCurrency = transaction.currency !== "TRY";

  async function handleDelete() {
    setDeleting(true);
    try {
      await removeTransaction(transaction.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="İşlem Detayı"
      onClose={onClose}
      footer={
        confirmingDelete ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="flex min-h-11 items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} /> {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"
            >
              <Trash2 size={16} /> Sil
            </button>
          </div>
        )
      }
    >
      {confirmingDelete ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-4 py-6 text-center dark:bg-zinc-800/50">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isIncome
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
              }`}
            >
              {isIncome ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
            </span>
            <p
              className={`text-2xl font-semibold ${
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrencyValue(transaction.amount, transaction.currency)}
            </p>
            {isForeignCurrency && (
              <p className="text-xs text-zinc-400">
                ≈ {formatCurrencyValue(toTRY(transaction.amount, transaction.currency), "TRY")}
              </p>
            )}
            <p className="text-xs text-zinc-400">{isIncome ? "Gelir" : "Gider"}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Açıklama
            </p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-zinc-800 dark:text-zinc-200">
              {transaction.description || "-"}
            </p>
          </div>

          <div className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
            <DetailRow
              label={isIncome ? "Kişi / Bağışçı" : "Gider Kalemi"}
              value={getPartyName(transaction, residents, donors)}
            />
            {!isIncome && (
              <DetailRow
                label="Gider Kategorisi"
                value={getExpenseCategoryLabel(transaction.expenseCategory)}
              />
            )}
            {isIncome && transaction.incomeCategory && (
              <DetailRow
                label="Gelir Kategorisi"
                value={transaction.incomeCategory === "aidat" ? "Aidat" : "Bağış"}
              />
            )}
            <DetailRow
              label="Ödeme Yöntemi"
              value={
                <span className="inline-flex items-center gap-1.5">
                  {transaction.method === "banka" ? (
                    <Landmark size={14} />
                  ) : (
                    <Banknote size={14} />
                  )}
                  {transaction.method === "banka" ? "Banka" : "Nakit"}
                </span>
              }
            />
            <DetailRow label="İşlem Tarihi" value={formatDate(transaction.transactionDate)} />
            <DetailRow label="Eklenme Tarihi" value={formatDate(transaction.createdAt)} />
          </div>
        </div>
      )}
    </Modal>
  );
}
