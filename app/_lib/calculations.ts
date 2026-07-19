import type { Currency, Donor, PaymentMethod, Resident, TimeFilter, Transaction } from "./types";

const EXPENSE_CATEGORY_LABELS: Record<NonNullable<Transaction["expenseCategory"]>, string> = {
  sabit: "Sabit Gider",
  ozel: "Özel Gider",
};

export function getPartyName(
  tx: Transaction,
  residents: Resident[],
  donors: Donor[] = []
): string {
  if (tx.residentId) {
    const resident = residents.find((r) => r.id === tx.residentId);
    return resident?.name ?? "-";
  }
  if (tx.donorId) {
    const donor = donors.find((d) => d.id === tx.donorId);
    return donor?.name ?? tx.donorName ?? "-";
  }
  if (tx.donorName) {
    return tx.donorName;
  }
  return tx.expenseLabel ?? "-";
}

export function getExpenseCategoryLabel(category?: Transaction["expenseCategory"]): string {
  if (!category) return "-";
  return EXPENSE_CATEGORY_LABELS[category];
}

export function getToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return toDateOnlyString(getToday());
}

function parseDateOnly(dateStr: string): { year: number; month: number } {
  const [year, month] = dateStr.split("-").map(Number);
  return { year, month: month - 1 };
}

export function getFilterStartDate(filter: TimeFilter): Date {
  const start = getToday();
  if (filter === "1ay") {
    start.setMonth(start.getMonth() - 1);
  } else if (filter === "6ay") {
    start.setMonth(start.getMonth() - 6);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }
  return start;
}

export function filterTransactionsByTime(
  txs: Transaction[],
  filter: TimeFilter
): Transaction[] {
  const start = toDateOnlyString(getFilterStartDate(filter));
  const today = toDateOnlyString(getToday());
  return txs.filter(
    (tx) => tx.transactionDate >= start && tx.transactionDate <= today
  );
}

export const MONTHS_BY_FILTER: Record<TimeFilter, number> = {
  "1ay": 1,
  "6ay": 6,
  "1yil": 12,
};

export function getPledgedDuesTotal(residents: Resident[], filter: TimeFilter): number {
  return residents.reduce((sum, r) => sum + getResidentPledgedTotal(r, filter), 0);
}

export function getReceivedDuesTotal(txs: Transaction[], filter: TimeFilter): number {
  return filterTransactionsByTime(txs, filter)
    .filter((tx) => tx.type === "gelir" && tx.incomeCategory === "aidat")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getDonationsTotal(txs: Transaction[], filter: TimeFilter): number {
  return filterTransactionsByTime(txs, filter)
    .filter((tx) => tx.type === "gelir" && tx.incomeCategory === "bagis")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export interface CashBoxTotals {
  toplam: number;
  banka: number;
  nakit: number;
  nakitByCurrency: Record<Currency, number>;
}

export function getCashBoxTotals(
  txs: Transaction[],
  toTRY: (amount: number, currency: Currency) => number = (amount) => amount
): CashBoxTotals {
  const signedTRY = (tx: Transaction) => {
    const trAmount = toTRY(tx.amount, tx.currency);
    return tx.type === "gelir" ? trAmount : -trAmount;
  };

  const banka = txs
    .filter((tx) => tx.method === "banka")
    .reduce((sum, tx) => sum + signedTRY(tx), 0);

  const nakitByCurrency: Record<Currency, number> = { TRY: 0, USD: 0, EUR: 0 };
  txs
    .filter((tx) => tx.method === "nakit")
    .forEach((tx) => {
      nakitByCurrency[tx.currency] += tx.type === "gelir" ? tx.amount : -tx.amount;
    });

  const nakit = txs
    .filter((tx) => tx.method === "nakit")
    .reduce((sum, tx) => sum + signedTRY(tx), 0);

  return { toplam: banka + nakit, banka, nakit, nakitByCurrency };
}

export function sanitizeIntegerInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseAmountInput(value: string): number {
  return Number(sanitizeIntegerInput(value));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyValue(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr));
}

const MONTH_NAMES_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export interface MonthlyDueEntry {
  year: number;
  month: number; // 0-11
  label: string; // e.g. "2026 Temmuz"
  paid: boolean;
  amount: number;
  paymentDate?: string;
  createdAt?: string;
  method?: PaymentMethod;
  paymentCount: number;
}

export function getResidentDueAmountForMonth(
  resident: Resident,
  year: number,
  month: number
): number {
  const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const applicableEntries = resident.dueHistory
    .filter((entry) => entry.from <= monthStartStr)
    .sort((a, b) => a.from.localeCompare(b.from));

  if (applicableEntries.length === 0) return resident.monthlyDue;
  return applicableEntries[applicableEntries.length - 1].amount;
}

export function getResidentPledgedTotal(resident: Resident, filter: TimeFilter): number {
  const months = MONTHS_BY_FILTER[filter];
  const today = getToday();
  const { year: createdAtYear, month: createdAtMonth } = parseDateOnly(resident.createdAt);

  let total = 0;
  for (let i = 0; i < months; i++) {
    const cursor = new Date(today.getFullYear(), today.getMonth() - i, 1);
    if (
      cursor.getFullYear() < createdAtYear ||
      (cursor.getFullYear() === createdAtYear && cursor.getMonth() < createdAtMonth)
    ) {
      continue;
    }
    total += getResidentDueAmountForMonth(resident, cursor.getFullYear(), cursor.getMonth());
  }
  return total;
}

export function getResidentReceivedTotal(
  transactions: Transaction[],
  residentId: string,
  filter: TimeFilter
): number {
  return filterTransactionsByTime(transactions, filter)
    .filter(
      (tx) => tx.type === "gelir" && tx.incomeCategory === "aidat" && tx.residentId === residentId
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getDonorTransactions(
  transactions: Transaction[],
  donorId: string
): Transaction[] {
  return transactions
    .filter((tx) => tx.type === "gelir" && tx.incomeCategory === "bagis" && tx.donorId === donorId)
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
}

export function getDonorsWithTotals(
  donors: Donor[],
  transactions: Transaction[]
): (Donor & { total: number; donationCount: number })[] {
  return donors.map((donor) => {
    const donorTxs = getDonorTransactions(transactions, donor.id);
    return {
      ...donor,
      total: donorTxs.reduce((sum, tx) => sum + tx.amount, 0),
      donationCount: donorTxs.length,
    };
  });
}

export interface MonthOption {
  year: number;
  month: number; // 0-11
  label: string; // e.g. "Temmuz 2026"
}

export function getRecentMonthOptions(count: number): MonthOption[] {
  const today = getToday();
  const options: MonthOption[] = [];
  for (let i = 0; i < count; i++) {
    const cursor = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    options.push({ year, month, label: `${MONTH_NAMES_TR[month]} ${year}` });
  }
  return options;
}

export function hasResidentPaidInMonth(
  transactions: Transaction[],
  residentId: string,
  year: number,
  month: number
): boolean {
  return transactions.some((tx) => {
    if (tx.type !== "gelir" || tx.incomeCategory !== "aidat" || tx.residentId !== residentId) {
      return false;
    }
    const txDate = parseDateOnly(tx.transactionDate);
    return txDate.year === year && txDate.month === month;
  });
}

export type ResidentPaymentStatus = "odemedi" | "kismi" | "odedi";

export function getResidentPaymentStatusInMonth(
  resident: Resident,
  transactions: Transaction[],
  year: number,
  month: number
): ResidentPaymentStatus {
  const paidAmount = transactions
    .filter((tx) => {
      if (tx.type !== "gelir" || tx.incomeCategory !== "aidat" || tx.residentId !== resident.id) {
        return false;
      }
      const txDate = parseDateOnly(tx.transactionDate);
      return txDate.year === year && txDate.month === month;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (paidAmount <= 0) return "odemedi";

  const dueAmount = getResidentDueAmountForMonth(resident, year, month);
  return paidAmount >= dueAmount ? "odedi" : "kismi";
}

export function isResidentActiveInMonth(resident: Resident, year: number, month: number): boolean {
  const createdAt = parseDateOnly(resident.createdAt);
  if (year !== createdAt.year) return year > createdAt.year;
  return month >= createdAt.month;
}

export function getResidentMonthlyHistory(
  resident: Resident,
  transactions: Transaction[],
  filter: TimeFilter
): MonthlyDueEntry[] {
  const months = MONTHS_BY_FILTER[filter];
  const residentPayments = transactions.filter(
    (tx) => tx.type === "gelir" && tx.incomeCategory === "aidat" && tx.residentId === resident.id
  );

  const today = getToday();
  const createdAt = parseDateOnly(resident.createdAt);

  const entries: MonthlyDueEntry[] = [];
  for (let i = 0; i < months; i++) {
    const cursor = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    if (year < createdAt.year || (year === createdAt.year && month < createdAt.month)) continue;

    const monthPayments = residentPayments
      .filter((tx) => {
        const txDate = parseDateOnly(tx.transactionDate);
        return txDate.year === year && txDate.month === month;
      })
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
    const latestPayment = monthPayments[0];

    entries.push({
      year,
      month,
      label: `${year} ${MONTH_NAMES_TR[month]}`,
      paid: monthPayments.length > 0,
      amount:
        monthPayments.length > 0
          ? monthPayments.reduce((sum, tx) => sum + tx.amount, 0)
          : getResidentDueAmountForMonth(resident, year, month),
      paymentDate: latestPayment?.transactionDate,
      createdAt: latestPayment?.createdAt,
      method: latestPayment?.method,
      paymentCount: monthPayments.length,
    });
  }

  return entries;
}
