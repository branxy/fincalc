import { getMonths, getPeriodWeekByDate } from "@/lib/date-utils";

import type {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { transactionIsWithinPeriodByDate } from "@/lib/utils";

export const getPeriodsFromTransactions = (
  transactions: Transactions,
): Periods => {
  const periods: Periods = [];

  for (const t of transactions) {
    // 1. Get the week that corresponds with transaction's date
    const { periodStartDate } = getPeriodWeekByDate(t.date);

    // 2. See if the corresponding period was already created
    let existingPeriod = periods.find((p) => p.start_date === periodStartDate);

    if (existingPeriod) {
      existingPeriod = updatePeriodBalanceByTransaction(existingPeriod, t);
    } else {
      const prevPeriod = periods[periods.length - 1];
      const newPeriod = createPeriod(t, prevPeriod);

      periods.push(newPeriod);
    }
  }

  return periods;
};

const updatePeriodBalanceByTransaction = (p: FinancePeriod, t: Transaction) => {
  switch (t.type) {
    case "payment/fixed":
    case "payment/variable":
      p.balance_end -= t.amount;
      break;
    case "income/profit":
      p.balance_end += t.amount;
      break;
    case "income/stock":
      p.stock_end += t.amount;
      break;
    case "income/forward-payment":
      p.forward_payments_end += t.amount;
      break;
    case "compensation/stock":
      p.stock_end -= t.amount;
      break;
    case "compensation/forward-payment":
      p.forward_payments_end -= t.amount;
      break;
    default:
      throw new Error("Unknown transaction type:", t.type);
  }

  return p;
};

const createPeriod = (
  t: Transaction,
  prevPeriod?: FinancePeriod,
): FinancePeriod => {
  let newPeriod: FinancePeriod;
  const { periodStartDate } = getPeriodWeekByDate(t.date);

  if (prevPeriod) {
    newPeriod = {
      start_date: periodStartDate,
      balance_start: prevPeriod.balance_end,
      balance_end: prevPeriod.balance_end,
      stock_start: prevPeriod.stock_end,
      stock_end: prevPeriod.stock_end,
      forward_payments_start: prevPeriod.forward_payments_end,
      forward_payments_end: prevPeriod.forward_payments_end,
    };

    const updatedPeriod = updatePeriodBalanceByTransaction(newPeriod, t);

    return updatedPeriod;
  } else {
    newPeriod = {
      start_date: periodStartDate,
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

export function getTransactionsSumByPeriod(transactions: Transactions) {
  return transactions.reduce(
    (sum, t) => {
      switch (t.type) {
        case "payment/fixed":
        case "payment/variable":
          sum.endBalance -= t.amount;
          break;
        case "income/profit":
          sum.endBalance += t.amount;
          break;
        case "compensation/stock":
          sum.endStock -= t.amount;
          sum.endBalance += t.amount;
          break;
        case "income/stock":
          sum.endStock += t.amount;
          break;
        case "compensation/forward-payment":
          sum.endForwardPayments -= t.amount;
          sum.endBalance += t.amount;
          break;
        case "income/forward-payment":
          sum.endForwardPayments += t.amount;
          break;
        default:
          throw new Error(`Unknown transation type: ${t.type}`);
      }

      return sum;
    },
    {
      endBalance: 0,
      endStock: 0,
      endForwardPayments: 0,
    },
  );
}

export function sumTransactionsByCategory(transactions: Transactions) {
  return transactions.reduce(
    (sum, t) => {
      switch (t.type) {
        case "payment/fixed":
        case "payment/variable":
          sum.spent += t.amount;
          break;
        case "income/profit":
          sum.earned += t.amount;
          break;
        case "compensation/stock":
          sum.spent += t.amount;
          break;
        case "income/stock":
          sum.saved += t.amount;
          break;
        case "compensation/forward-payment":
          sum.spent += t.amount;
          break;
        case "income/forward-payment":
          sum.saved += t.amount;
          break;
        default:
          throw new Error(`Unknown transation type: ${t.type}`);
      }

      return sum;
    },
    {
      earned: 0,
      spent: 0,
      saved: 0,
    },
  );
}

export type MonthNames =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "December";

export type Months = {
  [M in MonthNames]?: {
    balance: number;
    earned: number;
    spent: number;
    saved: number;
  };
};

export function getPeriodsByMonth(
  periods: Periods,
  transactions: Transactions,
) {
  const sortedPeriods = periods.toSorted((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  const monthNames = getMonths();
  const months: Months = {};

  for (const p of sortedPeriods) {
    const periodMonthNumber = new Date(p.start_date).getMonth(),
      periodMonthName = monthNames[periodMonthNumber],
      existingMonth = months[periodMonthName],
      periodTransactions = transactions.filter((t) =>
        transactionIsWithinPeriodByDate(t.date, p.start_date),
      ),
      transactionsSum = sumTransactionsByCategory(periodTransactions);

    if (existingMonth) {
      existingMonth.balance = p.balance_end;
      existingMonth.earned += transactionsSum.earned;
      existingMonth.spent += transactionsSum.spent;
      existingMonth.saved += transactionsSum.saved;
    } else {
      months[periodMonthName] = {
        balance: p.balance_end,
        earned: transactionsSum.earned,
        spent: transactionsSum.spent,
        saved: transactionsSum.saved,
      };
    }
  }

  return months;
}
