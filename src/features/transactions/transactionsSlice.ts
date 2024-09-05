import { createAppSlice } from "@/features/createAppSlice";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { createAppSelector, TSelectedTransactions } from "@/lib/hooks";

import {
  addNewPeriodByDateAndReturnId,
  findPeriodByTransactionDate,
  prepareDataOnTransactionDateChanged,
} from "@/lib/redux-utils";
import {
  deleteCashflowItems,
  fetchCashflow,
  updateTransaction,
  uploadTransaction,
  upsertTransaction,
} from "@/features/transactions/transactionsApi";
import { getEarliestPeriodIdByTransactions } from "@periods/periodsCalculator";
import { periodAdded, periodsRecalculated } from "@periods/periodsSlice";

import { supabase } from "@/db/supabaseClient";
import { createTransaction, getCurrentPeriodId } from "@/lib/utils";
import { toast } from "sonner";

import { FinancePeriod, PeriodBalance, Transaction } from "@/features/types";
import { RootState } from "@/features/store";

const casfhlowAdapter = createEntityAdapter<Transaction>({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

type InitialState = EntityState<Transaction, string> & {
  status: "idle" | "loading" | "failed" | "succeeded";
  error: string | null;
};

const initialState: InitialState = casfhlowAdapter.getInitialState({
  status: "idle",
  error: null,
});

export const transactionsSlice = createAppSlice({
  name: "cashflow",
  initialState,
  reducers: (create) => ({
    fetchTransactions: create.asyncThunk(
      async () => {
        const transactions = await fetchCashflow();
        return transactions;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message ?? "Failed to fetch transactions";
          toast.error("Failed to fetch transactions");
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";
          casfhlowAdapter.setAll(state, action.payload);
          toast.success("Fetched transactions");
        },
      },
    ),
    transactionAdded: create.asyncThunk(
      async (
        {
          transactionTitle,
          transactionAmount,
          transactionDate,
          transactionType,
        }: {
          transactionTitle?: Transaction["title"];
          transactionAmount?: Transaction["amount"];
          transactionDate?: Transaction["date"];
          transactionType?: Transaction["type"];
        },
        { dispatch, getState },
      ) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const {
          periods: { entities: periodsEntities },
        } = getState() as RootState;

        let currentPeriodId = getCurrentPeriodId(
          Object.values(periodsEntities),
        );
        if (!currentPeriodId) {
          // If a period with dates correlating with a transaction date doesn't exist yet, create it
          const currentPeriod = await dispatch(periodAdded()).unwrap();
          currentPeriodId = currentPeriod.id;
        }

        const newTransaction = createTransaction(currentPeriodId, user.id, {
          transactionTitle,
          transactionAmount,
          transactionDate,
          transactionType,
        });

        const uploadedTransaction = await uploadTransaction(newTransaction);

        return uploadedTransaction;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state, action) => {
          state.status = "failed";
          if (action.error.message) state.error = action.error.message;
          toast.error("Failed to add a transaction");
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";

          casfhlowAdapter.addOne(state, action.payload);
          toast.success("Added a transaction");
        },
      },
    ),
    transactionDuplicated: create.asyncThunk(
      async (
        {
          transactionId,
        }: {
          transactionId: Transaction["id"];
        },
        { getState },
      ) => {
        const {
          cashflow: { entities },
        } = getState() as RootState;

        const { user_id, period_id, title, amount, type, date } =
          entities[transactionId];
        const newTransaction: Omit<Transaction, "id" | "date_created"> = {
          user_id,
          period_id,
          title: title + " copy",
          amount,
          type,
          date,
        };

        const uploadedTransaction = await uploadTransaction(newTransaction);

        return uploadedTransaction;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state, action) => {
          state.status = "failed";
          if (action.error.message) state.error = action.error.message;
          toast.error("Failed to add a transaction");
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";

          casfhlowAdapter.addOne(state, action.payload);
        },
      },
    ),
    transactionTitleChanged: create.asyncThunk(
      async ({
        transactionId,
        newTitle,
      }: {
        transactionId: Transaction["id"];
        newTitle: Transaction["title"];
      }) => {
        const updatedTransaction = await updateTransaction(
          transactionId,
          "title",
          newTitle,
        );

        return updatedTransaction;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to update transaction title");
        },
        fulfilled: (state, action) => {
          casfhlowAdapter.upsertOne(state, action.payload as Transaction);
          state.status = "succeeded";
        },
      },
    ),
    transactionAmountChangedAndPeriodsRecalculated: create.asyncThunk(
      async (
        {
          transactionId,
          newAmount,
        }: {
          transactionId: Transaction["id"];
          newAmount: Transaction["amount"];
        },
        { dispatch, getState },
      ) => {
        await dispatch(
          transactionAmountChanged({ transactionId, newAmount }),
        ).unwrap();

        const {
          cashflow: { entities },
        } = getState() as RootState;

        const pendingTransaction = entities[transactionId];

        dispatch(
          periodsRecalculated({
            originallyAffectedPeriodId: pendingTransaction.period_id,
          }),
        );
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state) => {
          state.status = "succeeded";
        },
      },
    ),
    transactionAmountChanged: create.asyncThunk(
      async ({
        transactionId,
        newAmount,
      }: {
        transactionId: Transaction["id"];
        newAmount: Transaction["amount"];
      }) => {
        const updatedTransaction = await updateTransaction(
          transactionId,
          "amount",
          newAmount,
        );

        return updatedTransaction;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to update transaction amount");
        },
        fulfilled: (state, action) => {
          casfhlowAdapter.upsertOne(state, action.payload as Transaction);
          state.status = "succeeded";
        },
      },
    ),
    transactionTypeChangedAndPeriodsRecalculated: create.asyncThunk(
      async (
        {
          transactionId,
          newType,
        }: {
          transactionId: Transaction["id"];
          newType: Transaction["type"];
        },
        { dispatch },
      ) => {
        const {
          originalBalance,
          updatedTransaction: { period_id },
        } = await dispatch(
          transactionTypeChanged({ transactionId, newType }),
        ).unwrap();

        dispatch(
          periodsRecalculated({
            originallyAffectedPeriodId: period_id,
            originalBalance,
          }),
        );
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state) => {
          state.status = "succeeded";
        },
      },
    ),
    transactionTypeChanged: create.asyncThunk(
      async (
        {
          transactionId,
          newType,
        }: {
          transactionId: Transaction["id"];
          newType: Transaction["type"];
        },
        { getState },
      ) => {
        const {
          periods: { entities },
          cashflow: { entities: transactionEntities },
        } = getState() as RootState;

        const pendingPeriodId = transactionEntities[transactionId].period_id,
          pendingPeriod = entities[pendingPeriodId],
          updatedTransaction = await updateTransaction(
            transactionId,
            "type",
            newType,
          );

        const {
            balance_start,
            balance_end,
            stock_start,
            stock_end,
            forward_payments_start,
            forward_payments_end,
          } = pendingPeriod,
          originalBalance: PeriodBalance = {
            balance_start,
            balance_end,
            stock_start,
            stock_end,
            forward_payments_start,
            forward_payments_end,
          };

        return {
          updatedTransaction,
          originalBalance,
        };
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to update transaction type");
        },
        fulfilled: (state, action) => {
          casfhlowAdapter.upsertOne(
            state,
            action.payload.updatedTransaction as Transaction,
          );
          state.status = "succeeded";
        },
      },
    ),
    transactionDateChangedAndPeriodsRecalculated: create.asyncThunk(
      async (
        {
          transactionId,
          newDate,
        }: {
          transactionId: Transaction["id"];
          newDate: Transaction["date"];
        },
        { dispatch, getState },
      ) => {
        const {
          cashflow: { entities },
        } = getState() as RootState;
        const pendingTransaction = entities[transactionId];

        const { newTransaction: updatedTransaction, initialStartBalance } =
          await dispatch(
            transactionDateChanged({ transactionId, newDate }),
          ).unwrap();

        // if transaction had to be moved to a new period, recalculate balance
        if (pendingTransaction.period_id !== updatedTransaction.period_id) {
          dispatch(
            periodsRecalculated({
              originallyAffectedPeriodId: pendingTransaction.period_id,
              newAffectedPeriodId: updatedTransaction.period_id,
              originalBalance: initialStartBalance,
            }),
          );
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state) => {
          state.status = "succeeded";
        },
      },
    ),
    transactionDateChanged: create.asyncThunk(
      async (
        {
          transactionId,
          newDate,
        }: {
          transactionId: Transaction["id"];
          newDate: Transaction["date"];
        },
        { dispatch, getState },
      ) => {
        // if the new date is outside of scope of its current period, assign the transaction to a new period
        const {
          periods,
          pendingTransaction,
          calculatedStartBalance,
          newDateIsWithinTheSamePeriod,
        } = prepareDataOnTransactionDateChanged(
          transactionId,
          newDate,
          getState,
        );

        const {
          balance_start: startBalance,
          balance_end,
          stock_start,
          stock_end,
          forward_payments_start,
          forward_payments_end,
        } = calculatedStartBalance;

        if (newDateIsWithinTheSamePeriod) {
          const updatedTransaction = await updateTransaction(
            transactionId,
            "date",
            newDate,
          );

          return { newTransaction: updatedTransaction };
        }

        // attempt to find an existing period with appropriate dates range
        const existingPeriodForNewDate = findPeriodByTransactionDate(
          newDate,
          periods,
        );

        if (existingPeriodForNewDate) {
          const upsertedTransaction = await upsertTransaction({
            ...pendingTransaction,
            period_id: existingPeriodForNewDate.id,
            date: newDate,
          });

          return { newTransaction: upsertedTransaction };
        } else {
          // if appropriate period doesn't already exist, create it
          const newPeriodId = await addNewPeriodByDateAndReturnId(
            newDate,
            dispatch,
          );

          const upsertedTransaction = await upsertTransaction({
            ...pendingTransaction,
            period_id: newPeriodId,
            date: newDate,
          });

          const initialStartBalance: PeriodBalance = {
            balance_start: startBalance,
            balance_end,
            stock_start,
            stock_end,
            forward_payments_start,
            forward_payments_end,
          };

          return {
            newTransaction: upsertedTransaction,
            initialStartBalance,
          };
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to update transaction date");
        },
        fulfilled: (state, action) => {
          if ("newTransaction" in action.payload) {
            casfhlowAdapter.upsertOne(
              state,
              action.payload.newTransaction as Transaction,
            );
          }
          state.status = "succeeded";
        },
      },
    ),
    deletedTransactions: create.asyncThunk(
      async ({
        selectedTransactions,
      }: {
        selectedTransactions: TSelectedTransactions;
      }) => {
        const deletedTransactionsIds =
          await deleteCashflowItems(selectedTransactions);

        return deletedTransactionsIds;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to delete transaction(-s)");
        },
        fulfilled: (state, action) => {
          casfhlowAdapter.removeMany(state, action.payload);
          state.status = "succeeded";
        },
      },
    ),
    deletedTransactionsAndPeriodsRecalculated: create.asyncThunk(
      async (
        {
          selectedTransactions,
        }: {
          selectedTransactions: TSelectedTransactions;
        },
        { dispatch, getState },
      ) => {
        const {
            cashflow: { entities },
            periods: { entities: periodEntities },
          } = getState() as RootState,
          periods = Object.values(periodEntities),
          transactions = Object.values(entities),
          earliestAffectedPeriodId = getEarliestPeriodIdByTransactions(
            periods,
            transactions,
            selectedTransactions,
          );

        await dispatch(deletedTransactions({ selectedTransactions })).unwrap();

        dispatch(
          periodsRecalculated({
            originallyAffectedPeriodId: earliestAffectedPeriodId,
          }),
        );
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state) => {
          state.status = "succeeded";
        },
      },
    ),
  }),
  selectors: {
    selectTransactionsStatus: (state) => state.status,
  },
});

export const {
  selectAll: selectAllTransactions,
  selectIds: selectCashflowIds,
} = casfhlowAdapter.getSelectors((state: RootState) => state.cashflow);

export const { selectTransactionsStatus } = transactionsSlice.selectors;

const returnId = (_state: RootState, id: FinancePeriod["id"]) => id;

export const selectTransactionsByPeriodId = createAppSelector(
  [selectAllTransactions, returnId],
  (state, id) => state.filter((t) => t.period_id === id),
);

export const {
  fetchTransactions,
  transactionAdded,
  transactionDuplicated,
  transactionTitleChanged,
  transactionAmountChangedAndPeriodsRecalculated,
  transactionAmountChanged,
  transactionTypeChangedAndPeriodsRecalculated,
  transactionTypeChanged,
  transactionDateChangedAndPeriodsRecalculated,
  transactionDateChanged,
  deletedTransactions,
  deletedTransactionsAndPeriodsRecalculated,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
