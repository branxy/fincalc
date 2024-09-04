/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/features/store";
import {
  createSelector,
  Dispatch,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";

import { useEffect, useRef, useState } from "react";
import type {
  Transactions,
  Transaction,
  zTTransactionTemplate,
} from "@/features/types";

export type TSelectedTransactions = Transaction["id"][];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const createAppSelector = createSelector.withTypes<RootState>();

export function useTableCheckbox(tableItems: Transactions) {
  const [selectedTransactions, setSelectedTransactions] =
    useState<TSelectedTransactions>([]);
  const lastSelectedTransactionRef = useRef<HTMLTableRowElement>(null!);
  const singleTransactionSelected = selectedTransactions.length === 1;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        singleTransactionSelected &&
        lastSelectedTransactionRef.current &&
        !lastSelectedTransactionRef.current.contains(e.target as Node)
      ) {
        setSelectedTransactions([]);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [singleTransactionSelected, selectedTransactions]);

  const isCheckedCheckbox =
    selectedTransactions.length === tableItems.length &&
    selectedTransactions.length > 0;

  const handleSelectTransaction = (cashflowItemId: Transaction["id"]) => {
    if (!selectedTransactions.length) {
      setSelectedTransactions([cashflowItemId]);
    } else if (!selectedTransactions.includes(cashflowItemId)) {
      setSelectedTransactions((prev) => [...prev, cashflowItemId]);
    } else {
      setSelectedTransactions((prev) =>
        prev.filter((id) => id !== cashflowItemId),
      );
    }
  };

  const handleSelectAllTransactions = () => {
    if (selectedTransactions.length < tableItems.length) {
      const allTransactionsIds = tableItems.map((i) => i.id);
      setSelectedTransactions(allTransactionsIds);
    } else setSelectedTransactions([]);
  };

  const handleUpdateLastSelectedTransactionRef = (
    rowRef: React.MutableRefObject<HTMLTableRowElement>,
  ) => {
    lastSelectedTransactionRef.current = rowRef.current;
  };

  return [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
    handleUpdateLastSelectedTransactionRef,
  ] as const;
}

export type ReturnWithCellState<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  () => void,
  ThunkDispatch<RootState, undefined, UnknownAction> & Dispatch<UnknownAction>,
];

export type ReturnWithoutCellState = [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  () => void,
  ThunkDispatch<RootState, undefined, UnknownAction> & Dispatch<UnknownAction>,
];

export function useEditTableCell<T>(
  value?: T,
): ReturnWithCellState<T> | ReturnWithoutCellState {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [state, setState] = useState(value);
  const dispatch = useAppDispatch();

  function finishEditing() {
    setIsEditing(false);
    setIsHovered(false);
  }

  if (typeof value === "undefined") {
    return [
      isEditing,
      setIsEditing,
      isHovered,
      setIsHovered,
      finishEditing,
      dispatch,
    ] as ReturnWithoutCellState;
  } else
    return [
      state,
      setState,
      isEditing,
      setIsEditing,
      isHovered,
      setIsHovered,
      finishEditing,
      dispatch,
    ] as ReturnWithCellState<T>;
}

export type TransactionTemplateFormError<T> = {
  [K in keyof T]?: string[];
};

export const useTransactionTemplateFormError = () => {
  const [formError, setFormError] = useState<
    TransactionTemplateFormError<zTTransactionTemplate>
  >({});

  return [formError, setFormError] as const;
};
