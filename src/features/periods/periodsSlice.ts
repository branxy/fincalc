import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { Transaction, FinancePeriod } from "../types";
import { createAppSlice } from "@/features/createAppSlice";
import { RootState } from "../store";
import { fetchPeriodsFromDB, upsertPeriods, uploadPeriod } from "./periodsApi";
import {
  getPeriodsChangesOnTransactionsDelete,
  getPeriodsOnEndBalanceChange,
  getPeriodsOnStartBalanceChange,
  recalculatePeriodsFromIndex,
} from "./periodsCalculator";
import { toast } from "sonner";
import {
  getCurrentPeriodId,
  getCurrentYearAndMonthNumber,
  getDBStartDate,
  getPreviousPeriodAndCurrentWeek,
  performAuthCheck,
} from "@/lib/utils";
import { createAppSelector } from "@/lib/hooks";

const periodsAdapter = createEntityAdapter<FinancePeriod>({
  sortComparer: (a, b) => a.start_date.localeCompare(b.start_date),
});

type InitialState = EntityState<FinancePeriod, string> & {
  status: "idle" | "loading" | "failed" | "succeeded";
  error: string | null;
};

const initialState: InitialState = periodsAdapter.getInitialState({
  status: "idle",
  error: null,
});

export const periodsSlice = createAppSlice({
  name: "periods",
  initialState,
  reducers: (create) => ({
    fetchPeriods: create.asyncThunk(
      async () => {
        const periods = await fetchPeriodsFromDB();

        return periods;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          periodsAdapter.setAll(state, action.payload);
          state.status = "succeeded";
        },
      }
    ),
    periodAdded: create.asyncThunk(
      async (_, { getState }) => {
        const userId = await performAuthCheck();

        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities);
        const [prevPeriod, currentWeek] =
          getPreviousPeriodAndCurrentWeek(periods);

        let newPeriod: Omit<FinancePeriod, "id">;
        const [year, month] = getCurrentYearAndMonthNumber(),
          currentWeekStartDate = getDBStartDate(
            year,
            month,
            currentWeek.startDate
          );

        if (prevPeriod) {
          const { end_balance, stock, forward_payments } = prevPeriod;

          newPeriod = {
            user_id: userId,
            start_date: currentWeekStartDate,
            start_balance: end_balance,
            end_balance: end_balance,
            stock: stock,
            forward_payments: forward_payments,
          };
        } else {
          newPeriod = {
            user_id: userId,
            start_date: currentWeekStartDate,
            start_balance: 0,
            end_balance: 0,
            stock: 0,
            forward_payments: 0,
          };
        }
        const receivedPeriod: FinancePeriod = await uploadPeriod(newPeriod);
        return receivedPeriod;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          periodsAdapter.addOne(state, action.payload);

          state.status = "succeeded";
        },
      }
    ),
    periodsRecalculated: create.asyncThunk(
      async (
        {
          startIndex,
        }: {
          startIndex: number;
        },
        { getState }
      ) => {
        const {
          periods: { entities: periodEntities },
          cashflow: { entities: transactionEntities },
        } = getState() as RootState;

        const recalculatedPeriods = recalculatePeriodsFromIndex(
          Object.values(periodEntities),
          Object.values(transactionEntities),
          startIndex
        );

        const receivedPeriods = await upsertPeriods(recalculatedPeriods);

        return receivedPeriods;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message ?? null;
          toast.error("Failed to update periods");
        },
        fulfilled: (state, action) => {
          const periodsToUpdate = action.payload;
          periodsAdapter.upsertMany(state, periodsToUpdate);
          state.status = "succeeded";
        },
      }
    ),
    startBalanceChanged: create.asyncThunk(
      async (
        {
          newStartBalance,
        }: {
          newStartBalance: FinancePeriod["start_balance"];
        },
        { getState }
      ) => {
        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities),
          firstPeriod = periods[0],
          balanceDifference = firstPeriod.start_balance - newStartBalance;

        const periodsToUpdateInDB = getPeriodsOnStartBalanceChange(
          periods,
          balanceDifference
        );

        const receivedPeriods = await upsertPeriods(periodsToUpdateInDB);

        return receivedPeriods;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.error = action.error.message ?? null;
          toast.error("Failed to update start balance");
        },
        fulfilled: (state, action) => {
          const periodsToUpdate = action.payload;
          periodsAdapter.upsertMany(state, periodsToUpdate);
          state.status = "succeeded";
          toast.success("Updated start balance");
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
          periodId: Transaction["period_id"];
          whatChanged: "income" | "payment";
          difference: number;
        },
        { getState }
      ) => {
        const {
          periods: { entities, ids },
        } = getState() as RootState;

        const currentPeriod = entities[periodId];
        const periods = Object.values(entities);
        const currentPeriodIndex = ids.findIndex((id) => id === periodId);

        if (currentPeriod) {
          const valuesToUpdate = getPeriodsOnEndBalanceChange(
            periods,
            currentPeriodIndex,
            periodId,
            whatChanged,
            difference
          );

          const newValues = await upsertPeriods(valuesToUpdate);

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
          deletedTransactionsIds: Transaction["id"][];
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

        const periodsToUpdate = await upsertPeriods(valuesToUpdate);

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

export const {
  fetchPeriods,
  periodAdded,
  periodsRecalculated,
  startBalanceChanged,
  endBalanceChanged,
  cashflowDeletedFromCashflow,
} = periodsSlice.actions;

export const {
  selectAll: selectAllPeriods,
  selectById: selectPeriodById,
  selectIds: selectPeriodsIds,
} = periodsAdapter.getSelectors((state: RootState) => state.periods);

export const selectPeriodsIdsAndEndBalance = createAppSelector(
  selectAllPeriods,
  (state) =>
    state.map((p) => ({
      id: p.id,
      end_balance: p.end_balance,
    }))
);

export const selectCurrentWeekPeriodId = createAppSelector(
  selectAllPeriods,
  (state) => getCurrentPeriodId(state)
);

export const selectFirstPeriod = createAppSelector(
  selectAllPeriods,
  (state) => state[0]
);

export default periodsSlice.reducer;
