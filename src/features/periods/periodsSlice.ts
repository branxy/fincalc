import { createAppSlice } from "@/features/createAppSlice";
import {
  getPeriodsOnEndBalanceChange,
  getPeriodsOnStartBalanceChange,
  recalculatePeriods,
} from "@/features/periods/periodsCalculator";
import { RootState } from "@/features/store";
import { FinancePeriod, Transaction } from "@/features/types";
import { createAppSelector } from "@/lib/hooks";
import {
  getCurrentPeriodId,
  getCurrentYearAndMonthNumber,
  getDBStartDate,
  getPreviousPeriodAndCurrentWeek,
  getPreviousPeriodByDate,
  performAuthCheck,
} from "@/lib/utils";
import {
  fetchPeriodsFromDB,
  uploadPeriod,
  upsertPeriods,
} from "@periods/periodsApi";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { toast } from "sonner";

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
          } = getState() as RootState,
          periods = Object.values(entities);
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
    periodAddedWithDate: create.asyncThunk(
      async (
        {
          newPeriodStartDate,
        }: {
          newPeriodStartDate: FinancePeriod["start_date"];
        },
        { getState }
      ) => {
        const userId = await performAuthCheck();

        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities);
        const prevPeriod = getPreviousPeriodByDate(periods, newPeriodStartDate);

        let newPeriod: Omit<FinancePeriod, "id">;

        if (prevPeriod) {
          const { end_balance, stock, forward_payments } = prevPeriod;

          newPeriod = {
            user_id: userId,
            start_date: newPeriodStartDate,
            start_balance: end_balance,
            end_balance,
            stock,
            forward_payments,
          };
        } else {
          newPeriod = {
            user_id: userId,
            start_date: newPeriodStartDate,
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
          const periods = Object.values(state.entities);
          periods.sort((a, b) => a.start_date.localeCompare(b.start_date));
          state.status = "succeeded";
        },
      }
    ),
    periodsRecalculated: create.asyncThunk(
      async (
        {
          originallyAffectedPeriodId,
          newAffectedPeriodId,
          originalStartBalance,
        }: {
          originallyAffectedPeriodId: FinancePeriod["id"];
          newAffectedPeriodId?: FinancePeriod["id"];
          originalStartBalance?: FinancePeriod["start_balance"];
        },
        { getState }
      ) => {
        const {
            periods: { entities: periodEntities },
            cashflow: { entities: transactionEntities },
          } = getState() as RootState,
          periods = Object.values(periodEntities),
          transactions = Object.values(transactionEntities);

        const recalculatedPeriods = recalculatePeriods(
          periods,
          transactions,
          originallyAffectedPeriodId,
          newAffectedPeriodId,
          originalStartBalance
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
  }),
  extraReducers: () => {},
  selectors: {},
});

export const {
  fetchPeriods,
  periodAdded,
  periodAddedWithDate,
  periodsRecalculated,
  startBalanceChanged,
  endBalanceChanged,
} = periodsSlice.actions;

export const {
  selectAll: selectAllPeriods,
  selectById: selectPeriodById,
  selectIds: selectPeriodsIds,
  selectEntities: selectPeriodEntities,
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
