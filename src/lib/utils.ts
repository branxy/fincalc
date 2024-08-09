import {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { supabase } from "@/db/supabaseClient";
import { format } from "date-fns";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { MonthNames } from "@/features/periods/periodsCalculator";

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

export function getMarkedCashflow(
  periods: Pick<
    FinancePeriod,
    "id" | "balance_end" | "stock_end" | "forward_payments_end"
  >[],
  cashflow: Transactions,
) {
  // Returns an object with indexes of every last transaction in a period and that period's end_balance
  const returnObject: {
    [key: number]: Pick<
      FinancePeriod,
      "balance_end" | "stock_end" | "forward_payments_end"
    >;
  } = {};

  for (const p of periods) {
    const lastCashflowIndex = cashflow.findLastIndex(
      (c) => c.period_id === p.id,
    );

    returnObject[lastCashflowIndex] = {
      balance_end: p.balance_end,
      stock_end: p.stock_end,
      forward_payments_end: p.forward_payments_end,
    };
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

export function getNumberOfDaysInMonthByDate(date: Transaction["date"]) {
  const [year, month] = date.split("-"),
    numberOfDaysInAMonth = new Date(Number(year), Number(month), 0).getDate();

  return numberOfDaysInAMonth;
}

export function getNumberOfDaysInCurrentMonth() {
  const [year, month] = getCurrentYearAndMonthNumber(),
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
  const daysInAMonth = getNumberOfDaysInCurrentMonth(),
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
