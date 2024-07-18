import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { CashflowItem, FinancePeriod } from "../types";
import { generateTestCashflow, getTodayDate } from "../../lib/utils";
import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";
import {
  deleteCashflowItems,
  fetchCashflow,
  updateTransaction,
  uploadTransaction,
} from "./cashflowApi";
import { supabase } from "@/db/supabaseClient";
import { toast } from "sonner";
import {
  cashflowDeletedFromCashflow,
  endBalanceChanged,
  periodAdded,
} from "../periods/periodsSlice";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testCashflow = generateTestCashflow(
  5,
  ["exp1", "exp2", "exp3", "exp4", "exp5"],
  [10000, 4000, 6000, 5000, 5000]
);

const casfhlowAdapter = createEntityAdapter<CashflowItem>({
  sortComparer: (a, b) => a.date.localeCompare(b.date),
});

type InitialState = EntityState<CashflowItem, string> & {
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

        const newTransaction: Omit<CashflowItem, "id"> = {
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
          transactionId: CashflowItem["id"];
          whatChanged: "title" | "type" | "amount" | "date";
          newValue: string | number;
        },
        { dispatch, getState }
      ) => {
        const {
          cashflow: { entities },
        } = getState() as RootState;

        if (whatChanged === "amount" && typeof newValue === "number") {
          const currentItem = entities[transactionId];
          if (currentItem) {
            const difference = newValue - currentItem.amount;
            dispatch(
              endBalanceChanged({
                periodId: currentItem.period_id,
                whatChanged:
                  currentItem.type === "income/profit" ? "income" : "payment",
                difference,
              })
            );
          }
        }

        const updatedValue = await updateTransaction(
          transactionId,
          whatChanged,
          newValue
        );

        return updatedValue;
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
          casfhlowAdapter.upsertOne(state, action.payload as CashflowItem);
          toast.success("Transaction updated");
        },
      }
    ),
    deletedCashflowItems: create.asyncThunk(
      async (
        {
          selectedTransactions,
        }: {
          selectedTransactions: CashflowItem["id"][];
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
  transactionChanged,
  deletedCashflowItems,
} = cashflowSlice.actions;

export default cashflowSlice.reducer;
