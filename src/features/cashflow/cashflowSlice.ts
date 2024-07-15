import { createEntityAdapter } from "@reduxjs/toolkit";
import { CashflowItem } from "../types";
import { generateTestCashflow } from "../../lib/utils";
import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";
import { getCashflow } from "./cashflowApi";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  reducers: (create) => ({}),
  selectors: {},
});

export const { selectAll: selectAllCashflow } = casfhlowAdapter.getSelectors(
  (state: RootState) => state.cashflow
);

export default cashflowSlice.reducer;
