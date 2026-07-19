"use client";

import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { parseAmountInput, sanitizeIntegerInput } from "../_lib/calculations";
import type { Resident } from "../_lib/types";
import Modal from "./Modal";

interface ResidentFormModalProps {
  resident?: Resident;
  onClose: () => void;
  onSave: (data: Omit<Resident, "id" | "createdAt" | "dueHistory">) => void;
  onDelete?: () => void;
}

const FORM_ID = "resident-form";

export default function ResidentFormModal({
  resident,
  onClose,
  onSave,
  onDelete,
}: ResidentFormModalProps) {
  const [name, setName] = useState(resident?.name ?? "");
  const [monthlyDue, setMonthlyDue] = useState(
    resident ? String(resident.monthlyDue) : ""
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isValid = name.trim() !== "" && parseAmountInput(monthlyDue) > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    onSave({
      name: name.trim(),
      monthlyDue: parseAmountInput(monthlyDue),
    });
    onClose();
  }

  return (
    <Modal
      title={resident ? "Kişiyi Düzenle" : "Yeni Kişi Ekle"}
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
              onClick={onDelete}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              <Trash2 size={16} /> Evet, Sil
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {resident && onDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"
              >
                <Trash2 size={16} /> Sil
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
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
                disabled={!isValid}
                className="flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} /> Kaydet
              </button>
            </div>
          </div>
        )
      }
    >
      {confirmingDelete ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">{resident?.name}</span>{" "}
          isimli kişiyi listeden kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
      ) : (
        <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ad Soyad
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz"
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Aylık Aidat (₺)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyDue}
              onChange={(e) => setMonthlyDue(sanitizeIntegerInput(e.target.value))}
              placeholder="0"
              className="min-h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
