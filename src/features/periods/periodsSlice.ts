import { toast } from "sonner";

import { createAppSlice } from "@/features/createAppSlice";
import { createAppSelector } from "@/lib/hooks";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { login } from "@/features/auth/authSlice";
import { fetchTransactions } from "@/features/transactions/transactionsSlice";
import { fetchTransactionTemplates } from "@/features/transaction-templates/transactionTemplateSlice";

import {
  getPeriodBalanceDifference,
  getPeriodsFromTransactions,
  getPeriodsOnStartBalanceChange,
  recalculatePeriods,
} from "@/features/periods/periodsCalculator";
import {
  createPeriod,
  createPeriodWithDate,
  performAuthCheck,
} from "@/lib/utils";

import { type UpdatedFormFields } from "@/components/transactionsTable/StartBalance";
import { type RootState } from "@/features/store";
import type {
  FinancePeriod,
  PeriodBalance,
  Transaction,
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
    initApp: create.asyncThunk(
      async (_, { dispatch }) => {
        await dispatch(login()).unwrap();
        dispatch(fetchTransactions());
        dispatch(fetchTransactionTemplates());
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
        },
      },
    ),
    initializePeriods: create.asyncThunk(
      async (
        {
          transactions,
        }: {
          transactions: Omit<Transaction, "period_id">[];
        },
        { getState },
      ) => {
        const {
          auth: { userId },
        } = getState() as RootState;

        if (!userId) throw new Error("Unauthorized");

        const [periods, updatedTransactions] = getPeriodsFromTransactions(
          transactions,
          userId,
        );

        return { periods, updatedTransactions };
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        rejected: (state) => {
          state.status = "failed";
        },
        fulfilled: (state, action) => {
          const { periods } = action.payload;
          periodsAdapter.setAll(state, periods);
          state.status = "succeeded";
        },
      },
    ),
    periodAdded: create.asyncThunk(
      async (_, { getState }) => {
        const userId = await performAuthCheck();

        const newPeriod = createPeriod(userId, getState);

        return newPeriod;
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

        const newPeriod = createPeriodWithDate(
          newPeriodStartDate,
          userId,
          getState,
        );

        return newPeriod;
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

        return recalculatedPeriods;
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
        const [periods, balanceDifference] = getPeriodBalanceDifference(
          newBalance,
          getState,
        );

        const updatedPeriods = getPeriodsOnStartBalanceChange(
          periods,
          balanceDifference,
        );

        return updatedPeriods;
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
  initApp,
  initializePeriods,
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
