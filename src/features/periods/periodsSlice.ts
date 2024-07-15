import { createEntityAdapter } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { FinancePeriod } from "../types";
import { createAppSlice } from "@/features/createAppSlice";
import { RootState } from "../store";
import { getPeriods, uploadPeriod } from "./periodsApi";

interface AddPeriodProps {
  prevPeriodId: FinancePeriod["id"];
  user_id: FinancePeriod["user_id"];
}

const periodsAdapter = createEntityAdapter<FinancePeriod>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const samplePeriods = [
  {
    id: uuidv4(),
    user_id: "1-user-id",
    start_date: "2024-07-04",
    start_balance: 10000,
    end_balance: -20000,
    stock: 15000,
    forward_payments: 23000,
  },
  {
    id: uuidv4(),
    user_id: "1-user-id",
    start_date: "2024-07-06",
    start_balance: -20000,
    end_balance: -24000,
    stock: 45000,
    forward_payments: 23000,
  },
  {
    id: uuidv4(),
    user_id: "1-user-id",
    start_date: "2024-07-08",
    start_balance: -24000,
    end_balance: -30000,
    stock: 45000,
    forward_payments: 23000,
  },
];

const initialState = await getPeriods(periodsAdapter);

export const periodsSlice = createAppSlice({
  name: "periods",
  initialState,
  reducers: (create) => ({
    periodAdded: create.asyncThunk(
      async ({ prevPeriodId, user_id }: AddPeriodProps, { getState }) => {
        const state = getState() as RootState;

        const prevPeriod = state.periods.entities[prevPeriodId];

        if (prevPeriod) {
          const { end_balance, stock, forward_payments } = prevPeriod;

          const newPeriod: Omit<FinancePeriod, "id"> = {
            user_id: user_id,
            start_date: prevPeriod.start_date,
            start_balance: end_balance,
            end_balance: end_balance,
            stock: stock,
            forward_payments: forward_payments,
          };

          const receivedPeriod: FinancePeriod = await uploadPeriod(newPeriod);
          return { newPeriod: receivedPeriod };
        } else {
          throw new Error(`No previous period found: ${prevPeriod}`);
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        rejected: (state, action) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          const { newPeriod } = action.payload;
          periodsAdapter.addOne(state, newPeriod);

          state.status = "succeeded";
        },
      }
    ),
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extraReducers: (builder) => {},
  selectors: {},
});

export const { periodAdded } = periodsSlice.actions;

export const { selectAll: selectAllPeriods, selectById: selectPeriodById } =
  periodsAdapter.getSelectors((state: RootState) => state.periods);

export default periodsSlice.reducer;
