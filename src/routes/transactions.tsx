import { Transaction } from "@/features/types";
import { createFileRoute } from "@tanstack/react-router";

export interface TransactionsSearchParams {
  sortBy: keyof Pick<Transaction, "amount" | "type" | "date">;
  asc: boolean;
  filter?: `${keyof Pick<Transaction, "title" | "amount" | "type" | "date">}.${string}`;
}

export const Route = createFileRoute("/transactions")({
  validateSearch: (search): TransactionsSearchParams => {
    return {
      sortBy: (search?.sortBy as TransactionsSearchParams["sortBy"]) || "date",
      asc: (search?.asc as boolean) ?? true,
      filter:
        (search?.filter as TransactionsSearchParams["filter"]) || undefined,
    };
  },
});
