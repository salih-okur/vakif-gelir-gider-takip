"use client";

import { Banknote, Landmark, Save } from "lucide-react";
import { useState } from "react";
import { useAppData } from "../_lib/AppDataContext";
import {
  formatDate,
  getTodayString,
  parseAmountInput,
  sanitizeIntegerInput,
} from "../_lib/calculations";
import type { Currency, IncomeCategory, PaymentMethod, Transaction } from "../_lib/types";
import Modal from "./Modal";
import Select from "./Select";

interface IncomeModalProps {
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void | Promise<void>;
}

const FORM_ID = "income-form";

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "TRY", label: "TL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

export default function IncomeModal({ onClose, onSave }: IncomeModalProps) {
  const { residents } = useAppData();
  const [category, setCategory] = useState<IncomeCategory>("aidat");
  const [residentId, setResidentId] = useState(residents[0]?.id ?? "");
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("banka");
  const [currency, setCurrency] = useState<Currency>("TRY");
  const [date, setDate] = useState(getTodayString());
  const [description, setDescription] = useState("");
  const [isSaving, setSaving] = useState(false);

  const showCurrencyPicker = category === "bagis" && method === "nakit";

  const selectedResident = residents.find((r) => r.id === residentId);
  const minDate = category === "aidat" ? selectedResident?.createdAt : undefined;
  const isDateTooEarly = Boolean(minDate && date !== "" && date < minDate);

  const isValid =
    amount.trim() !== "" && parseAmountInput(amount) > 0 && date !== "" && !isDateTooEarly;

  function handleMethodChange(next: PaymentMethod) {
    setMethod(next);
    if (next === "banka") setCurrency("TRY");
  }

  function handleCategoryChange(next: IncomeCategory) {
    setCategory(next);
    if (next === "aidat") setCurrency("TRY");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSaving) return;

    setSaving(true);
    try {
      const resident = residents.find((r) => r.id === residentId);

      const autoDescription =
        description.trim() !== ""
          ? description
          : category === "aidat"
            ? `Aidat ödemesi - ${resident?.name ?? ""}`
            : `Bağış - ${donorName || "İsimsiz"}`;

      const newTx: Omit<Transaction, "id"> = {
        type: "gelir",
        transactionDate: date,
        createdAt: getTodayString(),
        createdAtMs: Date.now(),
        amount: parseAmountInput(amount),
        currency: showCurrencyPicker ? currency : "TRY",
        method,
        description: autoDescription,
        incomeCategory: category,
        residentId: category === "aidat" ? residentId : undefined,
        donorName: category === "bagis" ? donorName : undefined,
      };

      await onSave(newTx);
      onClose();
    } catch {
      // error toast is shown by the caller; keep the modal open so the user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Gelir Gir"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 items-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            İptal
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={!isValid || isSaving}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Gelir Türü
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange("aidat")}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                category === "aidat"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Aidat
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange("bagis")}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                category === "bagis"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Bağış
            </button>
          </div>
        </div>

        {category === "aidat" ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Üye
            </label>
            <Select
              value={residentId}
              onChange={setResidentId}
              options={residents.map((r) => ({ value: r.id, label: r.name }))}
            />
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bağışçı
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Bağışçı adı..."
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tutar {showCurrencyPicker ? `(${currency})` : "(₺)"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(sanitizeIntegerInput(e.target.value))}
              placeholder="0"
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              İşlem Tarihi
            </label>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            {isDateTooEarly && selectedResident && (
              <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                {selectedResident.name}, {formatDate(selectedResident.createdAt)} tarihinde
                eklendi. Bu tarihten önce aidat girilemez.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ödeme Yöntemi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleMethodChange("banka")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                method === "banka"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <Landmark size={16} /> Banka
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange("nakit")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                method === "nakit"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <Banknote size={16} /> Nakit
            </button>
          </div>
        </div>

        {showCurrencyPicker && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Para Birimi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCurrency(opt.value)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                    currency === opt.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Açıklama <span className="text-zinc-400">(opsiyonel)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ek not..."
            className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </form>
    </Modal>
  );
}
