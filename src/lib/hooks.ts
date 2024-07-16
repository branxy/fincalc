import { useState } from "react";
import type { Cashflow, CashflowItem } from "@/features/types";

/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import { createSelector } from "@reduxjs/toolkit";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const createAppSelector = createSelector.withTypes<RootState>();

export function useTableCheckbox(tableItems: Cashflow) {
  const [selectedTransactions, setSelectedTransactions] = useState<
    CashflowItem["id"][]
  >([]);

  const isCheckedCheckbox =
    selectedTransactions.length === tableItems.length &&
    selectedTransactions.length > 0;

  function handleSelectTransaction(cashflowItemId: CashflowItem["id"]) {
    if (!selectedTransactions.length) {
      setSelectedTransactions([cashflowItemId]);
    } else if (!selectedTransactions.includes(cashflowItemId)) {
      setSelectedTransactions((prev) => [...prev, cashflowItemId]);
    } else {
      setSelectedTransactions((prev) =>
        prev.filter((id) => id !== cashflowItemId)
      );
    }
  }

  function handleSelectAllTransactions() {
    if (selectedTransactions.length < tableItems.length) {
      const allTransactionsIds = tableItems.map((i) => i.id);
      setSelectedTransactions(allTransactionsIds);
    } else setSelectedTransactions([]);
  }
  return [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
  ] as const;
}
