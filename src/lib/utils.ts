import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Cashflow } from "../features/types";

import { v4 as uuidv4 } from "uuid";

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
): Cashflow {
  const arr: Cashflow = [];

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
