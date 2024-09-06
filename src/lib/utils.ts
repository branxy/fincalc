import { toast } from "sonner";

import { supabase } from "@/db/supabaseClient";
import { User } from "@supabase/supabase-js";

import type {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { type MonthNames } from "@/features/periods/periodsCalculator";

import { v4 as uuidv4 } from "uuid";
import { addDays, format } from "date-fns";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { includesString } from "@/components/transactionsTable/actions/filters/filterFns";

import { TransactionsSearchParams } from "@/routes/transactions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimestamp() {
  return new Date().toISOString();
}

export function generateTestCashflow(
  numberOfItems = 3,
  titles: string[],
  amounts: number[],
): Transactions {
  const arr: Transactions = [];

  for (let i = 0; i < numberOfItems; i++) {
    const title = titles[i];
    const amount = amounts[i];

    const rawDate = new Date();
    const currentDay = rawDate.getDay();
    const currentMonth = rawDate.getMonth() + 1;
    const currentYear = rawDate.getFullYear();
    const dateString = `${currentYear}-${currentMonth}-${currentDay + (i + 1)}`;
    const cashflowDate = new Date(dateString).toISOString().split("T")[0];

    arr.push({
      id: uuidv4(),
      period_id: i + 1 <= 3 ? `${i + 1}` : "1",
      user_id: "1-user-id",
      type: "payment/fixed",
      title,
      amount,
      date: cashflowDate,
      date_created: getTimestamp(),
    });
  }

  return arr;
}

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

export function sortAndFilterTransactions(
  transactions: Transactions,
  searchParams: TransactionsSearchParams,
): Transactions {
  const { sortBy, asc, filter } = searchParams;
  const sortedTransactions = sortTransactions(transactions, sortBy, asc);

  if (filter) {
    return filterTransactions(sortedTransactions, filter);
  } else {
    return sortedTransactions;
  }
}

export function sortTransactions(
  transactions: Transactions,
  sortBy: TransactionsSearchParams["sortBy"],
  asc: TransactionsSearchParams["asc"],
) {
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
}

export function filterTransactions(
  transactions: Transactions,
  filter: TransactionsSearchParams["filter"],
) {
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
}

export function getMarkedCashflow(
  periods: Pick<
    FinancePeriod,
    "id" | "balance_end" | "stock_end" | "forward_payments_end"
  >[],
  transactions: Transactions,
): MarkedCashflow {
  // For every period, create an object with period statistics

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
}

export function getTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  return today;
}

export function getCurrentPeriodId(periods: Periods) {
  const currentWeek = getCurrentWeek();

  const currentPeriod = periods.find((p) => {
    const periodStartDate = new Date(p.start_date).getDate();
    return periodStartDate === currentWeek.startDate;
  });

  return currentPeriod?.id;
}

export function getCurrentPeriod(periods: Periods) {
  const currentWeek = getCurrentWeek();

  const currentPeriod = periods.find((p) => {
    const periodStartDate = new Date(p.start_date).getDate();
    return periodStartDate === currentWeek.startDate;
  });

  return currentPeriod;
}

export function getToastByDispatchStatus(
  dispatchStatus: "fulfilled" | "rejected",
  message: {
    success: string;
    error: string;
  },
) {
  switch (dispatchStatus) {
    case "fulfilled":
      return toast.success(message.success);
    case "rejected":
      return toast.error(message.error);
  }
}

export async function performAuthCheck() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export function getCurrentMonthNumber() {
  return new Date().getMonth();
}

export function getCurrentYearNumber() {
  return new Date().getFullYear();
}

export function getYearAndMonthNumber(
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) {
  const rawDate = new Date(date),
    year = rawDate.getFullYear(),
    month = rawDate.getMonth();

  return [year, month] as const;
}

interface Week {
  startDate: number;
  endDate: number;
}

export function getCurrentDayOfMonthNumber() {
  return new Date().getDate();
}

export function getNumberOfDaysInMonthByDate(date: Transaction["date"]) {
  const [year, month] = date.split("-"),
    numberOfDaysInAMonth = new Date(Number(year), Number(month), 0).getDate();

  return numberOfDaysInAMonth;
}

export function getNumberOfDaysInMonth(
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) {
  const [year, month] = getYearAndMonthNumber(date),
    daysInAMonth = new Date(year, month, 0).getDate();

  return daysInAMonth;
}

export function getDBDateFromObject(date: Date) {
  const dBDate = format(date, "yyyy-MM-dd");
  return dBDate;
}

export function getDBStartDate(year: number, month: number, day: number) {
  return new Date(year, month, day + 1).toISOString().split("T")[0];
}

export function getCurrentWeek() {
  const daysInAMonth = getNumberOfDaysInMonth(),
    weeks = getWeeksByDaysInAMonth(daysInAMonth),
    today = getCurrentDayOfMonthNumber(),
    currentWeek = weeks.find(
      (w) => w.startDate <= today && w.endDate >= today,
    )!;

  return currentWeek;
}

export function getWeeksByDaysInAMonth(daysInAMonth: number) {
  const weeks: Week[] = [
    {
      startDate: 1,
      endDate: 7,
    },
    {
      startDate: 8,
      endDate: 14,
    },
    {
      startDate: 15,
      endDate: 21,
    },
    {
      startDate: 22,
      endDate: daysInAMonth,
    },
  ];

  return weeks;
}

export function getWeekNumber(
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) {
  const daysInAMonth = getNumberOfDaysInMonth(date),
    weeks = getWeeksByDaysInAMonth(daysInAMonth),
    dayNumber = new Date(date).getDate();

  const weekNumber = weeks.findIndex(
    (w) => w.startDate <= dayNumber && w.endDate >= dayNumber,
  );

  if (weekNumber === -1) throw new Error("Couldn't find a week number");

  return weekNumber + 1;
}

export function getPeriodWeekByDate(date: Transaction["date"]) {
  const numberOfDaysInAMonth = getNumberOfDaysInMonthByDate(date),
    weeks = getWeeksByDaysInAMonth(numberOfDaysInAMonth),
    [year, month, day] = date.split("-");

  const week = weeks.find(
    (w) => w.startDate <= Number(day) && w.endDate >= Number(day),
  )!;

  return {
    periodStartDate: `${year}-${month}-${week.startDate}`,
    periodEndDate: `${year}-${month}-${week.endDate}`,
  };
}

export function getPeriodEndDate(periodStartDate: FinancePeriod["start_date"]) {
  const numberOfDaysInAMonth = getNumberOfDaysInMonthByDate(periodStartDate),
    [year, month, startDateNumber] = periodStartDate.split("-"),
    smallStartDate = format(addDays(periodStartDate, 6), "yyyy-MM-dd");

  return Number(startDateNumber) < 22
    ? smallStartDate
    : `${year}-${month}-${numberOfDaysInAMonth}`;
}

export function getPreviousPeriodAndCurrentWeek(periods: Periods) {
  const currentWeek = getCurrentWeek(),
    prevPeriod = periods.findLast(
      (p) => new Date(p.start_date).getDate() < currentWeek.startDate,
    );

  return [prevPeriod, currentWeek] as const;
}

export function getPreviousPeriodByDate(
  periods: Periods,
  newStartDate: FinancePeriod["start_date"],
) {
  return periods.findLast((p) => p.start_date < newStartDate);
}

export function getMonths() {
  const months: MonthNames[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "December",
  ];
  return months;
}

export function createTransaction(
  currentPeriodId: FinancePeriod["id"],
  userId: User["id"],
  properties: {
    transactionTitle?: Transaction["title"];
    transactionAmount?: Transaction["amount"];
    transactionDate?: Transaction["date"];
    transactionType?: Transaction["type"];
  },
): Omit<Transaction, "id" | "date_created"> {
  const {
    transactionTitle,
    transactionAmount,
    transactionDate,
    transactionType,
  } = properties;

  const newTransaction: Omit<Transaction, "id" | "date_created"> = {
    period_id: currentPeriodId,
    user_id: userId,
    type: transactionType ?? "payment/fixed",
    title: transactionTitle ?? "New transaction",
    amount: transactionAmount ?? 0,
    date: transactionDate ?? getTodayDate(),
  };

  return newTransaction;
}
