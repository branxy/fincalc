import { supabase } from "@/db/supabaseClient";
import { User } from "@supabase/supabase-js";

import { v4 as uuidv4 } from "uuid";
import {
  getCurrentWeek,
  getDBStartDate,
  getMonths,
  getPreviousPeriodAndCurrentWeek,
  getPreviousPeriodByDate,
  getTodayDate,
  getWeekNumber,
  getYearAndMonthNumber,
} from "@/lib/date-utils";
import { twMerge } from "tailwind-merge";
import { includesString } from "@/components/transactionsTable/actions/filters/filterFns";

import type {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { type MonthNames } from "@/features/periods/periodsCalculator";
import { type ClassValue, clsx } from "clsx";
import { type TransactionsSearchParams } from "@/routes/transactions";
import { type Auth } from "@/features/auth/authSlice";
import { type RootState } from "@/features/store";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export interface MarkedCashflow {
  [key: FinancePeriod["id"]]: {
    firstTransactionIndex: number;
    lastTransactionIndex: number;
    monthName: MonthNames;
    weekNumber: number;
    periodEndBalance: {
      balance_end: FinancePeriod["balance_end"];
      stock_end?: FinancePeriod["stock_end"];
      forward_payments_end?: FinancePeriod["forward_payments_end"];
    };
  };
}

export const sortAndFilterTransactions = (
  transactions: Transactions,
  searchParams: TransactionsSearchParams,
): Transactions => {
  const { sortBy, asc, filter } = searchParams;
  const sortedTransactions = sortTransactions(transactions, sortBy, asc);

  if (filter) {
    return filterTransactions(sortedTransactions, filter);
  } else {
    return sortedTransactions;
  }
};

export const sortTransactions = (
  transactions: Transactions,
  sortBy: TransactionsSearchParams["sortBy"],
  asc: TransactionsSearchParams["asc"],
) => {
  switch (sortBy) {
    case "amount":
      return transactions.sort((a, b) =>
        asc ? a.amount - b.amount : b.amount - a.amount,
      );
    case "type":
      return transactions.sort((a, b) =>
        asc ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type),
      );

    case "date":
      return transactions.sort((a, b) =>
        asc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
      );

    default:
      throw new Error("Failed to sort transactions: unexpected column");
  }
};

export const filterTransactions = (
  transactions: Transactions,
  filter: TransactionsSearchParams["filter"],
) => {
  const [key, value] = filter!.split(".");
  switch (key) {
    case "title":
      return transactions.filter((row) => includesString(row.title, value));
    case "amount":
      return transactions.filter((row) => row.amount === parseInt(value));
    case "type":
      return transactions.filter((row) => row.type === value);
    case "date":
      return transactions.filter((row) => row.date === value);
    default:
      throw new Error("Failed to filter transactions: unexpected column type");
  }
};

export const getMarkedCashflow = (
  periods: Periods,
  transactions: Transactions,
): MarkedCashflow => {
  const returnObject: MarkedCashflow = {};
  for (const p of periods) {
    let firstTransaction = 0;
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t.period_id !== p.id) continue;
      if (!firstTransaction) {
        firstTransaction = 1;
        const months = getMonths(),
          monthNumber = new Date(t.date).getMonth(),
          monthName = months[monthNumber];
        Object.defineProperty(returnObject, p.id, {
          value: {
            firstTransactionIndex: i,
          },
        });
        Object.defineProperties(returnObject[p.id], {
          monthName: {
            value: monthName,
          },
          weekNumber: {
            value: getWeekNumber(t.date),
          },
        });
      }
      const stats = returnObject[p.id];
      Object.defineProperties(stats, {
        lastTransactionIndex: { value: i, writable: true },
      });
      if (!stats.periodEndBalance) {
        stats.periodEndBalance = {
          balance_end: p.balance_end,
        };
      }
      const transactionIsStock =
        t.type === "income/stock" || t.type === "compensation/stock";
      const transactionIsFP =
        t.type === "income/forward-payment" ||
        t.type === "compensation/forward-payment";
      if (transactionIsStock && !stats.periodEndBalance.stock_end)
        stats.periodEndBalance.stock_end = p.stock_end;
      if (transactionIsFP && !stats.periodEndBalance.forward_payments_end)
        stats.periodEndBalance.forward_payments_end = p.forward_payments_end;
    }
  }
  return returnObject;
};

export const getCurrentPeriodId = (getState: () => unknown) => {
  const {
      periods: { entities: periodsEntities },
    } = getState() as RootState,
    periods = Object.values(periodsEntities);
  const currentWeek = getCurrentWeek();

  const currentPeriod = periods.find((p) => {
    const periodStartDate = new Date(p.start_date).getDate();
    return periodStartDate === currentWeek.startDate;
  });

  return currentPeriod?.id;
};

export const getCurrentPeriod = (periods: Periods) => {
  const currentWeek = getCurrentWeek();

  const currentPeriod = periods.find((p) => {
    const periodStartDate = new Date(p.start_date).getDate();
    return periodStartDate === currentWeek.startDate;
  });

  return currentPeriod;
};

export const performAuthCheck = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  return user.id;
};

type CreateTransactionProps = {
  userId: User["id"];
  periodId: FinancePeriod["id"];
  transactionTitle?: Transaction["title"];
  transactionAmount?: Transaction["amount"];
  transactionDate?: Transaction["date"];
  transactionType?: Transaction["type"];
};

export const createTransaction = ({
  userId,
  periodId,
  transactionTitle,
  transactionAmount,
  transactionDate,
  transactionType,
}: CreateTransactionProps): Omit<Transaction, "id" | "date_created"> => {
  const newTransaction = {
    period_id: periodId,
    user_id: userId,
    type: transactionType ?? "payment/fixed",
    title: transactionTitle ?? "New transaction",
    amount: transactionAmount ?? 0,
    date: transactionDate ?? getTodayDate(),
  };

  return newTransaction;
};

export const createPeriod = (
  userId: Auth["userId"],
  getState: () => unknown,
) => {
  const {
      periods: { entities },
    } = getState() as RootState,
    periods = Object.values(entities);

  const [prevPeriod, currentWeek] = getPreviousPeriodAndCurrentWeek(periods);
  const [year, month] = getYearAndMonthNumber(),
    currentWeekStartDate = getDBStartDate(year, month, currentWeek.startDate);

  let newPeriod: FinancePeriod;

  if (prevPeriod) {
    const { balance_end, stock_end, forward_payments_end } = prevPeriod;

    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: currentWeekStartDate,
      balance_start: balance_end,
      balance_end,
      stock_start: stock_end,
      stock_end,
      forward_payments_start: forward_payments_end,
      forward_payments_end,
    };
  } else {
    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: currentWeekStartDate,
      balance_start: 0,
      balance_end: 0,
      stock_start: 0,
      stock_end: 0,
      forward_payments_start: 0,
      forward_payments_end: 0,
    };
  }

  return newPeriod;
};

export const createPeriodWithDate = (
  newPeriodStartDate: FinancePeriod["start_date"],
  userId: Auth["userId"],
  getState: () => unknown,
) => {
  const {
    periods: { entities },
  } = getState() as RootState;

  const periods = Object.values(entities);
  const prevPeriod = getPreviousPeriodByDate(periods, newPeriodStartDate);

  let newPeriod: FinancePeriod;

  if (prevPeriod) {
    const { balance_end, stock_end, forward_payments_end } = prevPeriod;

    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: newPeriodStartDate,
      balance_start: balance_end,
      balance_end,
      stock_start: stock_end,
      stock_end,
      forward_payments_start: forward_payments_end,
      forward_payments_end,
    };
  } else {
    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: newPeriodStartDate,
      balance_start: 0,
      balance_end: 0,
      stock_start: 0,
      stock_end: 0,
      forward_payments_start: 0,
      forward_payments_end: 0,
    };
  }

  return newPeriod;
};
