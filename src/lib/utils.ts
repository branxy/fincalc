import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transactions, FinancePeriod, Periods } from "../features/types";

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabase } from "@/db/supabaseClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimestamp() {
  return new Date().toISOString();
}

export function generateTestCashflow(
  numberOfItems = 3,
  titles: string[],
  amounts: number[]
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

export function getMarkedCashflow(
  periods: Pick<FinancePeriod, "id" | "end_balance">[],
  cashflow: Transactions
) {
  // Returns an object with indexes of every last transaction in a period and that period's end_balance
  const returnObject: {
    [key: number]: number;
  } = {};

  for (const p of periods) {
    const lastCashflowIndex = cashflow.findLastIndex(
      (c) => c.period_id === p.id
    );

    returnObject[lastCashflowIndex] = p.end_balance;
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

export function getToastByDispatchStatus(
  dispatchStatus: "fulfilled" | "rejected",
  message: {
    success: string;
    error: string;
  }
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
export function getCurrentYearAndMonthNumber() {
  const rawDate = new Date(),
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

export function getNumberOfDaysInCurrentMonth() {
  const [year, month] = getCurrentYearAndMonthNumber(),
    daysInAMonth = new Date(year, month, 0).getDate();

  return daysInAMonth;
}

export function getDBStartDate(year: number, month: number, day: number) {
  return new Date(year, month, day + 1).toISOString().split("T")[0];
}

export function getCurrentWeek() {
  const daysInAMonth = getNumberOfDaysInCurrentMonth(),
    weeks: Week[] = [
      {
        startDate: 1,
        endDate: 8,
      },
      {
        startDate: 8,
        endDate: 15,
      },
      {
        startDate: 15,
        endDate: 22,
      },
      {
        startDate: 22,
        endDate: daysInAMonth,
      },
    ],
    today = getCurrentDayOfMonthNumber(),
    currentWeek = weeks.find(
      (w) => w.startDate <= today && w.endDate >= today
    )!;

  return currentWeek;
}

export function getPreviousPeriodAndCurrentWeek(periods: Periods) {
  const sortedPeriods = periods.toSorted(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    ),
    currentWeek = getCurrentWeek(),
    prevPeriod = sortedPeriods.findLast(
      (p) => new Date(p.start_date).getDate() < currentWeek.startDate
    );

  return [prevPeriod, currentWeek] as const;
}
