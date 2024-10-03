import { createFileRoute } from "@tanstack/react-router";

import type { Transaction } from "@/features/types";

export type TSortBy = keyof Pick<Transaction, "amount" | "type" | "date">;
export type FilterTransactionFields = keyof Pick<
  Transaction,
  "title" | "amount" | "type" | "date"
>;
export interface TransactionsSearchParams {
  sortBy: TSortBy;
  asc: boolean;
  filter?: `${FilterTransactionFields}.${string}`;
}

export const Route = createFileRoute("/transactions")({
  validateSearch: (search): TransactionsSearchParams => {
    return {
      sortBy: (search?.sortBy as TransactionsSearchParams["sortBy"]) || "date",
      asc: (search?.asc as boolean) ?? true,
      filter: search?.filter as TransactionsSearchParams["filter"],
    };
  },
});
