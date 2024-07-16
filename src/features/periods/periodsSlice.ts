import { createEntityAdapter } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { CashflowItem, FinancePeriod } from "../types";
import { createAppSlice } from "@/features/createAppSlice";
import { RootState } from "../store";
import { getPeriods, updatePeriodsBalance, uploadPeriod } from "./periodsApi";
import {
  getPeriodsChangesOnTransactionsDelete,
  getPeriodsOnEndBalanceChange,
} from "./periodsCalculator";
import { toast } from "sonner";

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
    endBalanceChanged: create.asyncThunk(
      async (
        {
          periodId,
          whatChanged,
          difference,
        }: {
          periodId: CashflowItem["period_id"];
          whatChanged: "income" | "payment";
          difference: number;
        },
        { getState }
      ) => {
        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities);
        const currentPeriodIndex = periods.findIndex((p) => p.id === periodId);
        const currentPeriod = periods[currentPeriodIndex];

        if (currentPeriod) {
          const valuesToUpdate = getPeriodsOnEndBalanceChange(
            periods,
            currentPeriodIndex,
            periodId,
            whatChanged,
            difference
          );

          const newValues = await updatePeriodsBalance(valuesToUpdate);

          return newValues;
        } else {
          throw new Error(`Period with id ${periodId} not found`);
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          periodsAdapter.upsertMany(state, action.payload);

          state.status = "succeeded";
        },
      }
    ),
    cashflowDeletedFromCashflow: create.asyncThunk(
      async (
        {
          deletedTransactionsIds,
        }: {
          deletedTransactionsIds: CashflowItem["id"][];
        },
        { getState }
      ) => {
        const {
          periods: { entities },
          cashflow: { entities: casfhlowEntities },
        } = getState() as RootState;

        const cashflow = Object.values(casfhlowEntities);
        const periods = Object.values(entities);
        const deletedTransactions = cashflow.filter((c) =>
          deletedTransactionsIds.includes(c.id)
        );

        const valuesToUpdate = getPeriodsChangesOnTransactionsDelete(
          periods,
          deletedTransactions
        );

        const periodsToUpdate = await updatePeriodsBalance(valuesToUpdate);

        return { periodsToUpdate };
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          const { periodsToUpdate } = action.payload;
          periodsAdapter.upsertMany(state, periodsToUpdate);
          state.status = "succeeded";
          toast.success("Updated balance");
        },
      }
    ),
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  extraReducers: (builder) => {},
  selectors: {},
});

export const { periodAdded, endBalanceChanged, cashflowDeletedFromCashflow } =
  periodsSlice.actions;

export const { selectAll: selectAllPeriods, selectById: selectPeriodById } =
  periodsAdapter.getSelectors((state: RootState) => state.periods);

export default periodsSlice.reducer;
