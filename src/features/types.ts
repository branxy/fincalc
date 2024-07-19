export interface FinancePeriod {
  id: string;
  user_id: string;
  start_date: string;
  start_balance: number;
  end_balance: number;
  stock: number;
  forward_payments: number;
}

export type Periods = FinancePeriod[];

export interface Transaction {
  id: string;
  period_id: FinancePeriod["id"];
  user_id: FinancePeriod["user_id"];
  type:
    | "income/profit"
    | "income/stock"
    | "income/forward-payment"
    | "payment/fixed"
    | "payment/variable"
    | "compensation/stock"
    | "compensation/forward-payment";
  title: string;
  amount: number;
  date: string;
  date_created: string;
}

export type Transactions = Transaction[];

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
