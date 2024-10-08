import type { Transaction } from "@/features/types";

export const transactionTypes: Transaction["type"][][] = [
  ["payment/fixed", "payment/variable"],
  ["income/profit", "income/stock", "income/forward-payment"],
  ["compensation/stock", "compensation/forward-payment"],
];
