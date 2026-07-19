"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useMemo, useState } from "react";
import ExpenseModal from "./_components/ExpenseModal";
import Header from "./_components/Header";
import IncomeModal from "./_components/IncomeModal";
import RecentTransactionsTable from "./_components/RecentTransactionsTable";
import SummaryCards from "./_components/SummaryCards";
import TimeFilterTabs from "./_components/TimeFilterTabs";
import TransactionDetailModal from "./_components/TransactionDetailModal";
import { useAppData } from "./_lib/AppDataContext";
import type { Transaction, TimeFilter } from "./_lib/types";

export default function Home() {
  const { transactions, addTransaction } = useAppData();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1ay");
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      ),
    [transactions]
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Anasayfa
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Vakıf gelir ve gider takip paneli
            </p>
          </div>

          <TimeFilterTabs value={timeFilter} onChange={setTimeFilter} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          <button
            type="button"
            onClick={() => setIncomeModalOpen(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 sm:px-5"
          >
            <ArrowUpCircle size={18} />
            Gelir Gir
          </button>
          <button
            type="button"
            onClick={() => setExpenseModalOpen(true)}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 sm:px-5"
          >
            <ArrowDownCircle size={18} />
            Gider Gir
          </button>
        </div>

        <SummaryCards transactions={transactions} filter={timeFilter} />

        <RecentTransactionsTable
          transactions={sortedTransactions}
          onSelectTransaction={setSelectedTransaction}
        />
      </div>

      {isIncomeModalOpen && (
        <IncomeModal
          onClose={() => setIncomeModalOpen(false)}
          onSave={addTransaction}
        />
      )}
      {isExpenseModalOpen && (
        <ExpenseModal
          onClose={() => setExpenseModalOpen(false)}
          onSave={addTransaction}
        />
      )}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
