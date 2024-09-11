import { toast } from "sonner";

import { createAppSlice } from "@/features/createAppSlice";
import { createAppSelector } from "@/lib/hooks";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";

import {
  getPeriodsFromTransactions,
  getPeriodsOnStartBalanceChange,
  recalculatePeriods,
} from "@/features/periods/periodsCalculator";
import {
  getYearAndMonthNumber,
  getPreviousPeriodByDate,
  getPreviousPeriodAndCurrentWeek,
  getDBStartDate,
} from "@/lib/date-utils";
import { performAuthCheck } from "@/lib/utils";
import {
  fetchPeriodsFromDB,
  uploadPeriod,
  upsertPeriods,
} from "@periods/periodsApi";

import { type UpdatedFormFields } from "@/components/transactionsTable/StartBalance";
import { type RootState } from "@/features/store";
import type {
  FinancePeriod,
  PeriodBalance,
  Transactions,
} from "@/features/types";

export interface BalanceDifference {
  balance: number;
  stock: number;
  forward_payments: number;
}

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
      },
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
        const [year, month] = getYearAndMonthNumber(),
          currentWeekStartDate = getDBStartDate(
            year,
            month,
            currentWeek.startDate,
          );

        if (prevPeriod) {
          const { balance_end, stock_end, forward_payments_end } = prevPeriod;

          newPeriod = {
            user_id: userId,
            start_date: currentWeekStartDate,
            balance_start: balance_end,
            balance_end,
            stock_start: stock_end,
            stock_end: stock_end,
            forward_payments_start: forward_payments_end,
            forward_payments_end: forward_payments_end,
          };
        } else {
          newPeriod = {
            user_id: userId,
            start_date: currentWeekStartDate,
            balance_start: 0,
            balance_end: 0,
            stock_start: 0,
            stock_end: 0,
            forward_payments_start: 0,
            forward_payments_end: 0,
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
      },
    ),
    periodAddedWithDate: create.asyncThunk(
      async (
        {
          newPeriodStartDate,
        }: {
          newPeriodStartDate: FinancePeriod["start_date"];
        },
        { getState },
      ) => {
        const userId = await performAuthCheck();

        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities);
        const prevPeriod = getPreviousPeriodByDate(periods, newPeriodStartDate);

        let newPeriod: Omit<FinancePeriod, "id">;

        if (prevPeriod) {
          const { balance_end, stock_end, forward_payments_end } = prevPeriod;

          newPeriod = {
            user_id: userId,
            start_date: newPeriodStartDate,
            balance_start: balance_end,
            balance_end,
            stock_start: stock_end,
            stock_end,
            forward_payments_start: forward_payments_end,
            forward_payments_end,
          };
        } else {
          newPeriod = {
            user_id: userId,
            start_date: newPeriodStartDate,
            balance_start: 0,
            balance_end: 0,
            stock_start: 0,
            stock_end: 0,
            forward_payments_start: 0,
            forward_payments_end: 0,
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
      },
    ),
    periodsRecalculated: create.asyncThunk(
      async (
        {
          originallyAffectedPeriodId,
          newAffectedPeriodId,
          originalBalance,
        }: {
          originallyAffectedPeriodId: FinancePeriod["id"];
          newAffectedPeriodId?: FinancePeriod["id"];
          originalBalance?: PeriodBalance;
        },
        { getState },
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
          originalBalance,
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
      },
    ),
    startBalanceChanged: create.asyncThunk(
      async (
        {
          newBalance,
        }: {
          newBalance: UpdatedFormFields;
        },
        { getState },
      ) => {
        const {
          periods: { entities },
        } = getState() as RootState;

        const periods = Object.values(entities),
          firstPeriod = periods[0],
          balanceDifference: BalanceDifference = {
            balance: newBalance.balance_start
              ? firstPeriod.balance_start - newBalance.balance_start
              : 0,
            stock: newBalance.stock_start
              ? firstPeriod.stock_start - newBalance.stock_start
              : 0,
            forward_payments: newBalance.forward_payments_start
              ? firstPeriod.forward_payments_start -
                newBalance.forward_payments_start
              : 0,
          };

        const periodsToUpdateInDB = getPeriodsOnStartBalanceChange(
          periods,
          balanceDifference,
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
      },
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
      balance_end: p.balance_end,
      stock_end: p.stock_end,
      forward_payments_end: p.forward_payments_end,
    })),
);

export const selectFirstPeriod = createAppSelector(
  selectAllPeriods,
  (state) =>
    state[0] ?? {
      balance_start: undefined,
      stock_start: undefined,
      forward_payments_start: undefined,
    },
);

export default periodsSlice.reducer;
