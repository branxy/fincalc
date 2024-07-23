import { supabase } from "@/db/supabaseClient";
import { createAppSlice } from "@/features/createAppSlice";
import { RootState } from "@/features/store";
import { FinancePeriod, Transaction } from "@/features/types";
import { getPeriodWeekByDate, getTodayDate } from "@/lib/utils";
import { getStartBalance } from "@periods/periodsCalculator";
import {
  cashflowDeletedFromCashflow,
  periodAdded,
  periodAddedWithDate,
  periodsRecalculated,
} from "@periods/periodsSlice";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import {
  deleteCashflowItems,
  fetchCashflow,
  updateTransaction,
  uploadTransaction,
  upsertTransaction,
} from "@transactions/cashflowApi";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";

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

export const cashflowSlice = createAppSlice({
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
      }
    ),
    transactionAdded: create.asyncThunk(
      async (
        {
          currentWeekPeriodId,
        }: {
          currentWeekPeriodId?: FinancePeriod["id"];
        },
        { dispatch }
      ) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        if (!currentWeekPeriodId) {
          // If a period with dates correlating with a transaction date doesn't exist yet, create it
          const currentPeriod = await dispatch(periodAdded()).unwrap();
          currentWeekPeriodId = currentPeriod.id;
        }

        const newTransaction: Omit<Transaction, "id"> = {
          period_id: currentWeekPeriodId,
          user_id: user.id,
          type: "payment/fixed",
          title: "New transaction",
          amount: 0,
          date: getTodayDate(),
          date_created: new Date().toISOString(),
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
          toast.success("Added a transaction");
        },
      }
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
          newTitle
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
      }
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
        { dispatch, getState }
      ) => {
        await dispatch(
          transactionAmountChanged({ transactionId, newAmount })
        ).unwrap();

        const {
          cashflow: { entities },
        } = getState() as RootState;

        const pendingTransaction = entities[transactionId];

        dispatch(
          periodsRecalculated({
            originallyAffectedPeriodId: pendingTransaction.period_id,
          })
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
          toast.success(
            "Transaction amount and its corresponding period are updated"
          );
        },
      }
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
          newAmount
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
      }
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
        { dispatch, getState }
      ) => {
        await dispatch(
          transactionTypeChanged({ transactionId, newType })
        ).unwrap();

        const {
          cashflow: { entities },
        } = getState() as RootState;

        const pendingTransaction = entities[transactionId];

        dispatch(
          periodsRecalculated({
            originallyAffectedPeriodId: pendingTransaction.period_id,
          })
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
          toast.success(
            "Transaction type and its corresponding period are updated"
          );
        },
      }
    ),
    transactionTypeChanged: create.asyncThunk(
      async ({
        transactionId,
        newType,
      }: {
        transactionId: Transaction["id"];
        newType: Transaction["type"];
      }) => {
        const updatedTransaction = await updateTransaction(
          transactionId,
          "type",
          newType
        );

        return updatedTransaction;
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
          casfhlowAdapter.upsertOne(state, action.payload as Transaction);
          state.status = "succeeded";
        },
      }
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
        { dispatch, getState }
      ) => {
        const {
          cashflow: { entities },
        } = getState() as RootState;
        const pendingTransaction = entities[transactionId];

        const { newTransaction: updatedTransaction, initialStartBalance } =
          await dispatch(
            transactionDateChanged({ transactionId, newDate })
          ).unwrap();

        // if transaction had to be moved to a new period, recalculate balance
        if (pendingTransaction.period_id !== updatedTransaction.period_id) {
          dispatch(
            periodsRecalculated({
              originallyAffectedPeriodId: pendingTransaction.period_id,
              newAffectedPeriodId: updatedTransaction.period_id,
              originalStartBalance: initialStartBalance,
            })
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
          toast.success(
            "Transaction type and its corresponding period are updated"
          );
        },
      }
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
        { dispatch, getState }
      ) => {
        // if the new date is outside of scope of the new period, assign the transaction to a new period
        const {
          periods: { entities: periodEntities },
          cashflow: { entities: transactionEntities },
        } = getState() as RootState;

        const pendingTransaction = transactionEntities[transactionId],
          pendingPeriod = periodEntities[pendingTransaction.period_id],
          periods = Object.values(periodEntities),
          startBalance = getStartBalance(periods),
          newDateIsWithinTheSamePeriod =
            newDate >= pendingPeriod.start_date &&
            newDate <
              getPeriodWeekByDate(pendingPeriod.start_date).periodEndDate;

        switch (true) {
          case newDateIsWithinTheSamePeriod: {
            const updatedTransaction = await updateTransaction(
              transactionId,
              "date",
              newDate
            );

            return { newTransaction: updatedTransaction };
          }
          case !newDateIsWithinTheSamePeriod: {
            // attempt to find an existing period with appropriate dates range
            const existingPeriodForNewDate = periods.findLast(
              (p) =>
                p.start_date <= newDate &&
                differenceInCalendarDays(newDate, p.start_date) < 7
            );

            if (existingPeriodForNewDate?.start_date) {
              const newTransaction: Transaction = {
                ...pendingTransaction,
                period_id: existingPeriodForNewDate.id,
                date: newDate,
              };

              const upsertedTransaction =
                await upsertTransaction(newTransaction);

              return { newTransaction: upsertedTransaction };
            } else {
              // if appropriate period doesn't already exist, create it
              const { periodStartDate: newPeriodStartDate } =
                getPeriodWeekByDate(newDate);
              const { id } = await dispatch(
                periodAddedWithDate({ newPeriodStartDate })
              ).unwrap();

              const newTransaction: Transaction = {
                ...pendingTransaction,
                period_id: id,
                date: newDate,
              };

              const upsertedTransaction =
                await upsertTransaction(newTransaction);

              return {
                newTransaction: upsertedTransaction,
                initialStartBalance: startBalance,
              };
            }
          }

          default:
            throw new Error("Unexpected relation between new date and periods");
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
              action.payload.newTransaction as Transaction
            );
          }
          state.status = "succeeded";
        },
      }
    ),
    deletedCashflowItems: create.asyncThunk(
      async (
        {
          selectedTransactions,
        }: {
          selectedTransactions: Transaction["id"][];
        },
        { dispatch }
      ) => {
        dispatch(
          cashflowDeletedFromCashflow({
            deletedTransactionsIds: selectedTransactions,
          })
        );
        const response = await deleteCashflowItems(selectedTransactions);
        if (response === 204) {
          return selectedTransactions;
        } else {
          throw new Error("Failed to delete transaction(-s)");
        }
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
          const itemsToDelete = action.payload;
          casfhlowAdapter.removeMany(state, itemsToDelete);
          state.status = "succeeded";
          toast.success("Deleted transaction(-s)");
        },
      }
    ),
  }),
  selectors: {},
});

export const { selectAll: selectAllCashflow, selectIds: selectCashflowIds } =
  casfhlowAdapter.getSelectors((state: RootState) => state.cashflow);

export const {
  fetchTransactions,
  transactionAdded,
  transactionTitleChanged,
  transactionAmountChangedAndPeriodsRecalculated,
  transactionAmountChanged,
  transactionTypeChangedAndPeriodsRecalculated,
  transactionTypeChanged,
  transactionDateChangedAndPeriodsRecalculated,
  transactionDateChanged,
  deletedCashflowItems,
} = cashflowSlice.actions;

export default cashflowSlice.reducer;
