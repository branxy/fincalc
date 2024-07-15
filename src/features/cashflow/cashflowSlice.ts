import { createEntityAdapter } from "@reduxjs/toolkit";
import { CashflowItem } from "../types";
import { generateTestCashflow } from "../../lib/utils";
import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";

const testCashflow = generateTestCashflow(
  5,
  ["exp1", "exp2", "exp3", "exp4", "exp5"],
  [10000, 4000, 6000, 5000, 5000]
);

const casfhlowAdapter = createEntityAdapter<CashflowItem>();
const initialState = casfhlowAdapter.getInitialState(
  {
    status: "idle",
    error: null,
  },
  testCashflow
);

export const cashflowSlice = createAppSlice({
  name: "cashflow",
  initialState,
  reducers: (create) => ({}),
  selectors: {},
});

export const { selectAll: selectAllCashflow } = casfhlowAdapter.getSelectors(
  (state: RootState) => state.cashflow
);

export default cashflowSlice.reducer;
