import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { Transaction, FinancePeriod } from "../types";
import { generateTestCashflow, getTodayDate } from "../../lib/utils";
import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";
import {
  deleteCashflowItems,
  fetchCashflow,
  updateTransaction,
  uploadTransaction,
  upsertTransaction,
} from "./cashflowApi";
import { supabase } from "@/db/supabaseClient";
import { toast } from "sonner";
import {
  cashflowDeletedFromCashflow,
  endBalanceChanged,
  periodAdded,
  periodsRecalculated,
} from "../periods/periodsSlice";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testCashflow = generateTestCashflow(
  5,
  ["exp1", "exp2", "exp3", "exp4", "exp5"],
  [10000, 4000, 6000, 5000, 5000]
);

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
    transactionChanged: create.asyncThunk(
      async (
        {
          transactionId,
          whatChanged,
          newValue,
        }: {
          transactionId: Transaction["id"];
          whatChanged: "title" | "type" | "amount" | "date";
          newValue: string | number;
        },
        { dispatch, getState }
      ) => {
        const {
          cashflow: { entities },
          periods: { entities: periodEntities, ids: periodsIds },
        } = getState() as RootState;
        const updatedTransaction = entities[transactionId];

        if (whatChanged === "amount" && typeof newValue === "number") {
          if (updatedTransaction) {
            const difference = newValue - updatedTransaction.amount;
            dispatch(
              endBalanceChanged({
                periodId: updatedTransaction.period_id,
                whatChanged:
                  updatedTransaction.type === "income/profit"
                    ? "income"
                    : "payment",
                difference,
              })
            );
          }

          const updatedValue = await updateTransaction(
            transactionId,
            whatChanged,
            newValue
          );

          return updatedValue;
        } else if (whatChanged === "date") {
          const transactionPeriod =
            periodEntities[updatedTransaction.period_id];

          const newValueIsWithinSamePeriod =
            newValue >= transactionPeriod.start_date &&
            newValue <= transactionPeriod.start_date + 7;
          if (newValueIsWithinSamePeriod) {
            const updatedValue = await updateTransaction(
              transactionId,
              whatChanged,
              newValue
            );

            return updatedValue;
          } else {
            // handle moving transaction to another period — change period_id on a transaction

            // search for another period to attach the transaction to
            const periods = Object.values(periodEntities);
            const newTransactionPeriod = periods.find(
              (p) => p.start_date <= newValue && p.start_date + 7 >= newValue
            );

            if (newTransactionPeriod) {
              const newTransaction: Transaction = {
                ...updatedTransaction,
                period_id: newTransactionPeriod.id,
              };

              const periodsStartDateOrder =
                transactionPeriod.start_date.localeCompare(
                  newTransactionPeriod.start_date
                );

              if (periodsStartDateOrder === -1) {
                // new period comes after the current one and you need to start recalculation from the current period
                // dispatch balance recalculation
              } else {
                // new period comes before the current one and you need to start recalculation from the new period
                // dispatch balance recalculation
              }
              // upload to db
              const updatedValue = await upsertTransaction(newTransaction);

              // return updatedValue;
            } else {
              // create new period
              // dispatch periodAdded with desired date frame
            }
          }
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to update the transaction");
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";
          casfhlowAdapter.upsertOne(state, action.payload as Transaction);
          toast.success("Transaction updated");
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
          periods: { ids },
        } = getState() as RootState;

        const pendingTransaction = entities[transactionId];
        const startIndex = ids.findIndex(
          (periodId) => periodId === pendingTransaction.period_id
        );

        if (startIndex === -1)
          throw new Error(
            "Failed to find the corresponding period for transaction"
          );

        dispatch(periodsRecalculated({ startIndex }));
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
  transactionAmountChangedAndPeriodsRecalculated,
  transactionAmountChanged,
  transactionChanged,
  deletedCashflowItems,
} = cashflowSlice.actions;

export default cashflowSlice.reducer;
