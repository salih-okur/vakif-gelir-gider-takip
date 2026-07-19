"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getTodayString } from "./calculations";
import { db } from "./firebase";
import type { Donor, Resident, Transaction } from "./types";

interface AppDataContextValue {
  residents: Resident[];
  donors: Donor[];
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
  findOrCreateDonorByName: (name: string) => Promise<string>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedFlags, setLoadedFlags] = useState({
    residents: false,
    donors: false,
    transactions: false,
  });

  useEffect(() => {
    const unsubResidents = onSnapshot(collection(db, "residents"), (snapshot) => {
      setResidents(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Resident)
      );
      setLoadedFlags((prev) => ({ ...prev, residents: true }));
    });

    const unsubDonors = onSnapshot(collection(db, "donors"), (snapshot) => {
      setDonors(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Donor));
      setLoadedFlags((prev) => ({ ...prev, donors: true }));
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
      unsubDonors();
      unsubTransactions();
    };
  }, []);

  const isLoading = !loadedFlags.residents || !loadedFlags.donors || !loadedFlags.transactions;

  async function addTransaction(tx: Omit<Transaction, "id">) {
    await addDoc(collection(db, "transactions"), stripUndefined(tx));
  }

  async function removeTransaction(id: string) {
    await deleteDoc(doc(db, "transactions", id));
  }

  async function addResident(resident: Omit<Resident, "id" | "createdAt" | "dueHistory">) {
    const createdAt = getTodayString();
    await addDoc(
      collection(db, "residents"),
      stripUndefined({
        ...resident,
        createdAt,
        dueHistory: [{ from: createdAt, amount: resident.monthlyDue }],
      })
    );
  }

  async function updateResident(
    id: string,
    updates: Omit<Resident, "id" | "createdAt" | "dueHistory">
  ) {
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
  }

  async function removeResident(id: string) {
    await deleteDoc(doc(db, "residents", id));
  }

  async function findOrCreateDonorByName(name: string): Promise<string> {
    const trimmed = name.trim();
    const existing = donors.find(
      (d) => d.name.toLocaleLowerCase("tr-TR") === trimmed.toLocaleLowerCase("tr-TR")
    );
    if (existing) return existing.id;

    const newDonorRef = doc(collection(db, "donors"));
    await setDoc(newDonorRef, { name: trimmed });
    return newDonorRef.id;
  }

  return (
    <AppDataContext.Provider
      value={{
        residents,
        donors,
        transactions,
        isLoading,
        addTransaction,
        removeTransaction,
        addResident,
        updateResident,
        removeResident,
        findOrCreateDonorByName,
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
