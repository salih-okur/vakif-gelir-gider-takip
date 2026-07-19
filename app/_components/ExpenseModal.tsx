"use client";

import { Banknote, Landmark, Save } from "lucide-react";
import { useState } from "react";
import { getTodayString, parseAmountInput, sanitizeIntegerInput } from "../_lib/calculations";
import type { ExpenseCategory, PaymentMethod, Transaction } from "../_lib/types";
import Modal from "./Modal";
import Select from "./Select";

interface ExpenseModalProps {
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">) => void | Promise<void>;
}

const FORM_ID = "expense-form";

const FIXED_LABELS = ["Elektrik", "Su", "Doğalgaz", "Sorumlu Maaşı", "Maaş Avansı"];

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  sabit: "Sabit Gider",
  ozel: "Özel",
};

export default function ExpenseModal({ onClose, onSave }: ExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>("sabit");
  const [fixedLabel, setFixedLabel] = useState(FIXED_LABELS[0]);
  const [customLabel, setCustomLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("banka");
  const [date, setDate] = useState(getTodayString());
  const [description, setDescription] = useState("");
  const [isSaving, setSaving] = useState(false);

  const currentLabel = category === "sabit" ? fixedLabel : customLabel;

  const isValid =
    amount.trim() !== "" &&
    parseAmountInput(amount) > 0 &&
    date !== "" &&
    currentLabel.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSaving) return;

    setSaving(true);
    try {
      const newTx: Omit<Transaction, "id"> = {
        type: "gider",
        transactionDate: date,
        createdAt: getTodayString(),
        amount: parseAmountInput(amount),
        currency: "TRY",
        method,
        description: description.trim() !== "" ? description : currentLabel,
        expenseCategory: category,
        expenseLabel: currentLabel,
      };

      await onSave(newTx);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Gider Gir"
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
            className="flex min-h-11 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Gider Türü
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-11 rounded-lg border px-2 text-sm font-medium transition-colors ${
                  category === cat
                    ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {category === "sabit" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gider Kalemi
            </label>
            <Select
              value={fixedLabel}
              onChange={setFixedLabel}
              options={FIXED_LABELS.map((label) => ({ value: label, label }))}
              accentColor="rose"
            />
          </div>
        )}

        {category === "ozel" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Gider Açıklaması
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Örn: Asansör bakım ücreti"
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tutar (₺)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(sanitizeIntegerInput(e.target.value))}
              placeholder="0"
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              İşlem Tarihi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ödeme Yöntemi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod("banka")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                method === "banka"
                  ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <Landmark size={16} /> Banka
            </button>
            <button
              type="button"
              onClick={() => setMethod("nakit")}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                method === "nakit"
                  ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <Banknote size={16} /> Nakit
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Açıklama <span className="text-zinc-400">(opsiyonel)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ek not..."
            className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </form>
    </Modal>
  );
}
