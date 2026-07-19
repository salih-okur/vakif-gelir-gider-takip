"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useToast } from "../_components/Toast";
import { getTodayString } from "./calculations";
import { db } from "./firebase";
import type { Resident, Transaction } from "./types";

interface AppDataContextValue {
  residents: Resident[];
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addResident: (resident: Omit<Resident, "id" | "createdAt" | "dueHistory">) => Promise<void>;
  updateResident: (
    id: string,
    updates: Omit<Resident, "id" | "createdAt" | "dueHistory">
  ) => Promise<void>;
  removeResident: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { showSuccess, showError } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedFlags, setLoadedFlags] = useState({
    residents: false,
    transactions: false,
  });

  useEffect(() => {
    const unsubResidents = onSnapshot(collection(db, "residents"), (snapshot) => {
      setResidents(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Resident)
      );
      setLoadedFlags((prev) => ({ ...prev, residents: true }));
    });

    const unsubTransactions = onSnapshot(
      query(collection(db, "transactions"), orderBy("transactionDate", "desc")),
      (snapshot) => {
        setTransactions(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction)
        );
        setLoadedFlags((prev) => ({ ...prev, transactions: true }));
      }
    );

    return () => {
      unsubResidents();
      unsubTransactions();
    };
  }, []);

  const isLoading = !loadedFlags.residents || !loadedFlags.transactions;

  async function addTransaction(tx: Omit<Transaction, "id">) {
    try {
      await addDoc(collection(db, "transactions"), stripUndefined(tx));
      showSuccess(tx.type === "gelir" ? "Gelir başarıyla kaydedildi." : "Gider başarıyla kaydedildi.");
    } catch {
      showError("İşlem kaydedilirken bir hata oluştu.");
      throw new Error("addTransaction failed");
    }
  }

  async function removeTransaction(id: string) {
    try {
      await deleteDoc(doc(db, "transactions", id));
      showSuccess("İşlem silindi.");
    } catch {
      showError("İşlem silinirken bir hata oluştu.");
      throw new Error("removeTransaction failed");
    }
  }

  async function addResident(resident: Omit<Resident, "id" | "createdAt" | "dueHistory">) {
    try {
      const createdAt = getTodayString();
      await addDoc(
        collection(db, "residents"),
        stripUndefined({
          ...resident,
          createdAt,
          dueHistory: [{ from: createdAt, amount: resident.monthlyDue }],
        })
      );
      showSuccess("Kişi başarıyla eklendi.");
    } catch {
      showError("Kişi eklenirken bir hata oluştu.");
      throw new Error("addResident failed");
    }
  }

  async function updateResident(
    id: string,
    updates: Omit<Resident, "id" | "createdAt" | "dueHistory">
  ) {
    try {
      const existing = residents.find((r) => r.id === id);
      const today = getTodayString();

      let dueHistory = existing?.dueHistory ?? [];
      if (existing && existing.monthlyDue !== updates.monthlyDue) {
        const withoutToday = dueHistory.filter((entry) => entry.from !== today);
        dueHistory = [...withoutToday, { from: today, amount: updates.monthlyDue }].sort((a, b) =>
          a.from.localeCompare(b.from)
        );
      }

      await updateDoc(doc(db, "residents", id), stripUndefined({ ...updates, dueHistory }));
      showSuccess("Kişi bilgileri güncellendi.");
    } catch {
      showError("Kişi güncellenirken bir hata oluştu.");
      throw new Error("updateResident failed");
    }
  }

  async function removeResident(id: string) {
    try {
      await deleteDoc(doc(db, "residents", id));
      showSuccess("Kişi silindi.");
    } catch {
      showError("Kişi silinirken bir hata oluştu.");
      throw new Error("removeResident failed");
    }
  }

  return (
    <AppDataContext.Provider
      value={{
        residents,
        transactions,
        isLoading,
        addTransaction,
        removeTransaction,
        addResident,
        updateResident,
        removeResident,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return ctx;
}
