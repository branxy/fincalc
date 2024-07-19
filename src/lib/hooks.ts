import { useState } from "react";
import type { Transactions, Transaction } from "@/features/types";

/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import {
  createSelector,
  Dispatch,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const createAppSelector = createSelector.withTypes<RootState>();

export function useTableCheckbox(tableItems: Transactions) {
  const [selectedTransactions, setSelectedTransactions] = useState<
    Transaction["id"][]
  >([]);

  const isCheckedCheckbox =
    selectedTransactions.length === tableItems.length &&
    selectedTransactions.length > 0;

  function handleSelectTransaction(cashflowItemId: Transaction["id"]) {
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

export function useEditTableCell<T>(
  value: T
): [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  () => void,
  ThunkDispatch<RootState, undefined, UnknownAction> & Dispatch<UnknownAction>,
] {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [state, setState] = useState(value);
  const dispatch = useAppDispatch();

  function finishEditing() {
    setIsEditing(false);
    setIsHovered(false);
  }

  return [
    state,
    setState,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    finishEditing,
    dispatch,
  ];
}
