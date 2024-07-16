import { createEntityAdapter } from "@reduxjs/toolkit";
import { CashflowItem } from "../types";
import {
  generateTestCashflow,
  getCurrentPeriodId,
  getTodayDate,
} from "../../lib/utils";
import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";
import { getCashflow, uploadTransaction } from "./cashflowApi";
import { supabase } from "@/db/supabaseClient";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testCashflow = generateTestCashflow(
  5,
  ["exp1", "exp2", "exp3", "exp4", "exp5"],
  [10000, 4000, 6000, 5000, 5000]
);

const casfhlowAdapter = createEntityAdapter<CashflowItem>();

const initialState = await getCashflow(casfhlowAdapter);

export const cashflowSlice = createAppSlice({
  name: "cashflow",
  initialState,
  reducers: (create) => ({
    transactionAdded: create.asyncThunk(
      async (_, { getState }) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities);
        const currentPeriodId = getCurrentPeriodId(periods);

        if (!currentPeriodId)
          throw new Error("Couldn't find a current period id");
        const newTransaction: Omit<CashflowItem, "id"> = {
          period_id: currentPeriodId,
          user_id: user.id,
          type: "payment/fixed",
          title: "",
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
        rejected: (state) => {
          state.status = "failed";
          toast.error("Failed to add a transaction");
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";

          casfhlowAdapter.addOne(state, action.payload);
          toast.success("Added a transaction");
        },
      }
    ),
  }),
  selectors: {},
});

export const { selectAll: selectAllCashflow } = casfhlowAdapter.getSelectors(
  (state: RootState) => state.cashflow
);

export const { transactionAdded } = cashflowSlice.actions;

export default cashflowSlice.reducer;
