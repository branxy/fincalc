import { supabase } from "@/db/supabaseClient";

import {
  getCurrentWeek,
  getPreviousPeriodByDate,
  getTodayDate,
} from "@/lib/date-utils";
import { twMerge } from "tailwind-merge";
import { includesString } from "@/components/transactionsTable/actions/filters/filterFns";
import { findPeriodByTransactionDate } from "@/lib/redux-utils";

import type {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { type ClassValue, clsx } from "clsx";
import {
  type TSortBy,
  type TransactionsSearchParams,
} from "@/routes/transactions";
import { type RootState } from "@/features/store";
import { getTransactionsSumByPeriod } from "@/features/periods/periodsCalculator";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const sortAndFilterTransactions = (
  transactions: Transactions,
  searchParams: TransactionsSearchParams,
): Transactions => {
  if (transactions.length < 2) return transactions;

  const { sortBy, asc, filter } = searchParams;

  const { pivot, pivotIndex } = assignPivot([...transactions], filter);
  if (!pivot || !pivotIndex) return [];

  const pivotSortingProperty = pivot[sortBy];
  const lesserThanPivot = [],
    greaterThanPivot = [];

  for (let i = 0; i < transactions.length; i++) {
    if (i === pivotIndex) continue;

    const transaction = transactions[i];

    const comparedSortingProperty = transaction[sortBy];
    const passesFilter = filterSingleTransaction(transaction, filter);

    if (!passesFilter) continue;

    const elementIsLesserThanPivot = comparedFieldIsLesserThanPivot(
      pivotSortingProperty,
      comparedSortingProperty,
      sortBy,
    );

    if (elementIsLesserThanPivot) {
      lesserThanPivot.push(transaction);
    } else {
      greaterThanPivot.push(transaction);
    }
  }

  const lesserPart = sortAndFilterTransactions(lesserThanPivot, searchParams);
  const greaterPart = sortAndFilterTransactions(greaterThanPivot, searchParams);

  if (asc) {
    return [...lesserPart, pivot, ...greaterPart];
  } else {
    return [...greaterPart, pivot, ...lesserPart];
  }
};

type AssignPivotReturnType =
  | {
      pivot: Transaction;
      pivotIndex: number;
    }
  | {
      pivot: null;
      pivotIndex: null;
    };

const assignPivot = (
  transactions: Transactions,
  filter: TransactionsSearchParams["filter"],
): AssignPivotReturnType => {
  if (!transactions.length) {
    return {
      pivot: null,
      pivotIndex: null,
    };
  }

  const middleIndex = Math.floor(transactions.length / 2);
  const pivotCandidate = transactions[middleIndex];

  const passesFilter = filterSingleTransaction(pivotCandidate, filter);

  if (passesFilter) {
    return {
      pivot: pivotCandidate,
      pivotIndex: middleIndex,
    };
  } else {
    transactions.splice(middleIndex, 1);
    return assignPivot(transactions, filter);
  }
};

const comparedFieldIsLesserThanPivot = (
  pivot: Transaction[TSortBy],
  comparedField: Transaction[TSortBy],
  sortBy: TSortBy,
): boolean => {
  switch (sortBy) {
    case "amount":
      return comparedField < pivot;
    case "date":
      if (typeof pivot === "string" && typeof comparedField === "string") {
        return comparedField < pivot;
      } else {
        throw new Error(
          `Unexpected type of sorting fields: ${typeof pivot} and ${typeof comparedField}`,
        );
      }
    case "type":
      if (typeof pivot === "string" && typeof comparedField === "string") {
        return comparedField.localeCompare(pivot) < 0;
      } else {
        throw new Error(
          `Unexpected type of sorting fields: ${typeof pivot} and ${typeof comparedField}`,
        );
      }
    default:
      throw new Error("Unknown type of sortBy");
  }
};

export const filterSingleTransaction = (
  transaction: Transaction,
  filter: TransactionsSearchParams["filter"],
): boolean => {
  if (!filter) return true;

  const [key, value] = filter.split(".");
  switch (key) {
    case "title":
      return includesString(transaction.title, value);
    case "amount":
      return transaction.amount === parseInt(value);
    case "type":
      return transaction.type === value;
    case "date":
      return transaction.date === value;
    default:
      throw new Error("Failed to filter transactions: unexpected column type");
  }
};

interface TransactionsByPeriod {
  [key: FinancePeriod["start_date"]]: Transactions;
}
type PeriodStats = ReturnType<typeof getTransactionsSumByPeriod>;
export interface MarkedTransactions {
  [key: Transaction["id"]]: PeriodStats;
}

export const addPeriodStatistics = (
  periods: Periods,
  transactions: Transactions,
): MarkedTransactions => {
  // This function loops through transactions
  // and creates an object with period statistics related to each transaction,
  // according to each transaction's date.
  const returnObject: MarkedTransactions = {};
  const byPeriod: TransactionsByPeriod = {};

  const splitTransactionsByPeriods = () => {
    for (const t of transactions) {
      const period = findPeriodByTransactionDate(t.date, periods);

      if (!period) {
        throw new Error(
          "Failed to find related period in getMarkedTransactions",
        );
      }

      let transactionsByPeriod = byPeriod[period.start_date];

      if (Array.isArray(transactionsByPeriod)) {
        transactionsByPeriod.push(t);
      } else {
        transactionsByPeriod = [t];
      }
    }
  };

  const markLastTransactions = () => {
    for (const periodKey in byPeriod) {
      const periodTransactions = byPeriod[periodKey];
      const periodBalance = getTransactionsSumByPeriod(periodTransactions);

      const lastTransaction = periodTransactions[periodTransactions.length - 1];

      returnObject[lastTransaction.id] = periodBalance;
    }
  };

  splitTransactionsByPeriods();
  markLastTransactions();

  return returnObject;
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
  title?: Transaction["title"];
  amount?: Transaction["amount"];
  date?: Transaction["date"];
  type?: Transaction["type"];
};

export const createTransaction = ({
  title,
  amount,
  date,
  type,
}: CreateTransactionProps): Pick<
  Transaction,
  "title" | "amount" | "type" | "date"
> => {
  const newTransaction = {
    type: type ?? "payment/fixed",
    title: title ?? "New transaction",
    amount: amount ?? 0,
    date: date ?? getTodayDate(),
  };

  return newTransaction;
};

export const createPeriodWithDate = (
  newPeriodStartDate: FinancePeriod["start_date"],
  getState: () => unknown,
): FinancePeriod => {
  const {
    periods: { entities },
  } = getState() as RootState;

  const periods = Object.values(entities);
  const prevPeriod = getPreviousPeriodByDate(periods, newPeriodStartDate);

  let newPeriod: FinancePeriod;

  if (prevPeriod) {
    const { balance_end, stock_end, forward_payments_end } = prevPeriod;

    newPeriod = {
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

export const transactionIsWithinPeriodByDate = (
  transactionDate: Transaction["date"],
  periodStartDate: FinancePeriod["start_date"],
) => {
  return (
    transactionDate >= periodStartDate && transactionDate <= periodStartDate + 6
  );
};
