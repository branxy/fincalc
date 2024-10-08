import { type Transaction } from "@/features/types";

export const filterOptions = ["title", "amount", "type", "date"] as const;

export const includesString = (
  transactionTitle: Transaction["title"],
  filterValue: string,
) => {
  const search = transactionTitle.toString()?.toLowerCase();
  return search.includes(filterValue.toString()?.toLowerCase());
};
