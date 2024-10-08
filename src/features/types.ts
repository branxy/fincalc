import { Database } from "@/db/types_supabase";
import { z } from "zod";

type TransactionsTableRow = Database["public"]["Tables"]["transactions"]["Row"];
export interface FinancePeriod {
  id: string;
  user_id: string;
  start_date: string;
  balance_start: number;
  balance_end: number;
  stock_start: number;
  stock_end: number;
  forward_payments_start: number;
  forward_payments_end: number;
}

export type PeriodBalance = Pick<
  FinancePeriod,
  | "balance_start"
  | "balance_end"
  | "stock_start"
  | "stock_end"
  | "forward_payments_start"
  | "forward_payments_end"
>;

export type Periods = FinancePeriod[];

export interface Transaction {
  id: TransactionsTableRow["id"];
  user_id: FinancePeriod["user_id"];
  period_id: FinancePeriod["id"];
  type: TransactionsTableRow["type"];
  title: TransactionsTableRow["title"];
  amount: TransactionsTableRow["amount"];
  date: TransactionsTableRow["date"];
  date_created: TransactionsTableRow["date_created"];
}

export type Transactions = Transaction[];

export type TTransactionTemplate = Pick<
  Transaction,
  "id" | "user_id" | "title" | "amount" | "type" | "date"
>;

export const zTransactionTemplate = z.object({
  title: z
    .string({
      message: "Title must be of text format",
    })
    .trim()
    .min(1, {
      message: "Title must contain at least 1 character",
    })
    .max(80, {
      message: "Title couldn't be longer than 80 characters",
    }),
  amount: z.coerce
    .number()
    .nonnegative({ message: "Amount must be greater than or equal to 0" })
    .max(999999999),
  type: z.enum([
    "payment/fixed",
    "payment/variable",
    "income/profit",
    "income/stock",
    "income/forward-payment",
    "compensation/stock",
    "compensation/forward-payment",
  ]),
});

export type zTTransactionTemplate = z.infer<typeof zTransactionTemplate>;

export interface CashFlowTable {
  cashflow: Transactions;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface StockCompensation {
  id: Transaction["id"];
  period_id: Transaction["period_id"];
  type: "income/stock";
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
}

export type StockCompensations = StockCompensation[];

export interface FPCompensation {
  id: Transaction["id"];
  period_id: Transaction["period_id"];
  type: "income/forward-payment";
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
}

export type FPCompensations = FPCompensation[];
