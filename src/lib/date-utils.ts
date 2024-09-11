import { addDays, format } from "date-fns";

import type { FinancePeriod, Periods, Transaction } from "@/features/types";
import { type MonthNames } from "@/features/periods/periodsCalculator";

export const getTodayDate = () => {
  const today = new Date().toISOString().split("T")[0];
  return today;
};

export const getCurrentYearNumber = () => {
  return new Date().getFullYear();
};

export const getYearAndMonthNumber = (
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) => {
  const rawDate = new Date(date),
    year = rawDate.getFullYear(),
    month = rawDate.getMonth();

  return [year, month] as const;
};

//
// Months
//

export const getMonths = () => {
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
};

export const getCurrentMonthNumber = () => {
  return new Date().getMonth();
};

export const getNumberOfDaysInMonth = (
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) => {
  const [year, month] = getYearAndMonthNumber(date),
    daysInAMonth = new Date(year, month, 0).getDate();

  return daysInAMonth;
};

export const getNumberOfDaysInMonthByDate = (date: Transaction["date"]) => {
  const [year, month] = date.split("-"),
    numberOfDaysInAMonth = new Date(Number(year), Number(month), 0).getDate();

  return numberOfDaysInAMonth;
};

export const getCurrentDayOfMonthNumber = () => {
  return new Date().getDate();
};

//
// Weeks
//

export const getCurrentWeek = () => {
  const daysInAMonth = getNumberOfDaysInMonth(),
    weeks = getWeeksByDaysInAMonth(daysInAMonth),
    today = getCurrentDayOfMonthNumber(),
    currentWeek = weeks.find(
      (w) => w.startDate <= today && w.endDate >= today,
    )!;

  return currentWeek;
};

interface Week {
  startDate: number;
  endDate: number;
}

export const getWeeksByDaysInAMonth = (daysInAMonth: number) => {
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
};

export const getWeekNumber = (
  date: Transaction["date"] = getDBDateFromObject(new Date()),
) => {
  const daysInAMonth = getNumberOfDaysInMonth(date),
    weeks = getWeeksByDaysInAMonth(daysInAMonth),
    dayNumber = new Date(date).getDate();

  const weekNumber = weeks.findIndex(
    (w) => w.startDate <= dayNumber && w.endDate >= dayNumber,
  );

  if (weekNumber === -1) throw new Error("Couldn't find a week number");

  return weekNumber + 1;
};

export const getPeriodWeekByDate = (date: Transaction["date"]) => {
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
};

//
// Other
//

export const getDBDateFromObject = (date: Date) => {
  const dBDate = format(date, "yyyy-MM-dd");
  return dBDate;
};

export const getDBStartDate = (year: number, month: number, day: number) => {
  return new Date(year, month, day + 1).toISOString().split("T")[0];
};

export const getPeriodEndDate = (
  periodStartDate: FinancePeriod["start_date"],
) => {
  const numberOfDaysInAMonth = getNumberOfDaysInMonthByDate(periodStartDate),
    [year, month, startDateNumber] = periodStartDate.split("-"),
    smallStartDate = format(addDays(periodStartDate, 6), "yyyy-MM-dd");

  return Number(startDateNumber) < 22
    ? smallStartDate
    : `${year}-${month}-${numberOfDaysInAMonth}`;
};

export const getPreviousPeriodAndCurrentWeek = (periods: Periods) => {
  const currentWeek = getCurrentWeek(),
    prevPeriod = periods.findLast(
      (p) => new Date(p.start_date).getDate() < currentWeek.startDate,
    );

  return [prevPeriod, currentWeek] as const;
};

export const getPreviousPeriodByDate = (
  periods: Periods,
  newStartDate: FinancePeriod["start_date"],
) => {
  return periods.findLast((p) => p.start_date < newStartDate);
};
