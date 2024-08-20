import { getStartBalance } from "@/features/periods/periodsCalculator";
import { getPeriodEndDate, getPeriodWeekByDate } from "./utils";

import { RootState } from "@/features/store";

import { Periods, Transaction } from "@/features/types";
import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { periodAddedWithDate } from "@/features/periods/periodsSlice";

export function prepareDataOnTransactionDateChanged(
  transactionId: Transaction["id"],
  newDate: Transaction["date"],
  getState: () => unknown,
) {
  const {
    periods: { entities: periodEntities },
    cashflow: { entities: transactionEntities },
  } = getState() as RootState;

  const pendingTransaction = transactionEntities[transactionId],
    pendingPeriod = periodEntities[pendingTransaction.period_id],
    periods = Object.values(periodEntities),
    calculatedStartBalance = getStartBalance(periods),
    periodEndDate = getPeriodEndDate(pendingPeriod.start_date),
    newDateIsWithinTheSamePeriod =
      newDate >= pendingPeriod.start_date && newDate <= periodEndDate;

  return {
    periods,
    pendingTransaction,
    calculatedStartBalance,
    newDateIsWithinTheSamePeriod,
  };
}

export function findPeriodByTransactionDate(
  transactionDate: Transaction["date"],
  periods: Periods,
) {
  const existingPeriod = periods.findLast((p) => {
    const periodEndDate = getPeriodEndDate(p.start_date);

    return transactionDate >= p.start_date && transactionDate <= periodEndDate;
  });

  return existingPeriod;
}

export async function addNewPeriodByDateAndReturnId(
  newDate: Transaction["date"],
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
) {
  const { periodStartDate: newPeriodStartDate } = getPeriodWeekByDate(newDate);
  const { id } = await dispatch(
    periodAddedWithDate({ newPeriodStartDate }),
  ).unwrap();

  return id;
}
