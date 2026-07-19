export type TransactionType = "gelir" | "gider";

export type IncomeCategory = "aidat" | "bagis";

export type ExpenseCategory = "sabit" | "ozel";

export type PaymentMethod = "banka" | "nakit";

export type Currency = "TRY" | "USD" | "EUR";

export interface DueHistoryEntry {
  from: string; // ISO date string, this amount applies from this date onward
  amount: number;
}

export interface Resident {
  id: string;
  name: string;
  monthlyDue: number; // current monthly due amount
  createdAt: string; // ISO date string, auto-set when the resident is added
  dueHistory: DueHistoryEntry[]; // ordered by `from` ascending
}

export interface Donor {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  transactionDate: string; // ISO date string, user-selected (işlem tarihi)
  createdAt: string; // ISO date string, auto-set on save (eklenme tarihi)
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  description: string;
  incomeCategory?: IncomeCategory;
  residentId?: string;
  donorId?: string;
  donorName?: string; // free-text donor name entered on the income form
  expenseCategory?: ExpenseCategory;
  expenseLabel?: string;
}

export type TimeFilter = "1ay" | "6ay" | "1yil";
