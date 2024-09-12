import { v4 as uuidv4 } from "uuid";
import { getMonths } from "@/lib/date-utils";
import { getPeriodWeekByDate } from "@/lib/date-utils";

import { type TSelectedTransactions } from "@/lib/hooks";
import { type Auth } from "@/features/auth/authSlice";
import { type BalanceDifference } from "@/features/periods/periodsSlice";
import type {
  FinancePeriod,
  PeriodBalance,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";
import { type RootState } from "@/features/store";
import type { UpdatedFormFields } from "@/components/transactionsTable/StartBalance";

interface ValueToUpdate {
  id: FinancePeriod["id"];
  period: {
    start_balance: FinancePeriod["balance_start"];
    end_balance: FinancePeriod["balance_end"];
  };
}

export type ValuesToUpdate = ValueToUpdate[];

export const getPeriodsFromTransactions = (
  transactions: Omit<Transaction, "period_id">[],
  userId: Auth["userId"],
): [Periods, Transactions] => {
  const periods: Periods = [];
  const updatedTransactions: Transactions = [];
  const sortedTransactions = transactions.toSorted((a, b) =>
    a.date.localeCompare(b.date),
  );

  for (const t of sortedTransactions) {
    const { periodStartDate } = getPeriodWeekByDate(t.date);
    let existingPeriod = periods.find((p) => p.start_date === periodStartDate);

    let updatedTransaction: Transaction;
    if (existingPeriod) {
      existingPeriod = updatePeriodBalanceByTransaction(existingPeriod, t);
      updatedTransaction = {
        ...t,
        period_id: existingPeriod.id,
      };
    } else {
      const prevPeriod = periods[periods.length - 1];

      const newPeriod = createPeriod(t, userId, prevPeriod);
      updatedTransaction = {
        ...t,
        period_id: newPeriod.id,
      };
      periods.push(newPeriod);
    }

    updatedTransactions.push(updatedTransaction);
  }

  return [periods, updatedTransactions] as const;
};

const updatePeriodBalanceByTransaction = (
  p: FinancePeriod,
  t: Omit<Transaction, "period_id">,
) => {
  switch (t.type) {
    case "payment/fixed":
    case "payment/variable":
      p.balance_end -= t.amount;
      break;
    case "income/profit":
      p.balance_end += t.amount;
      break;
    case "income/stock":
      p.stock_end += t.amount;
      break;
    case "income/forward-payment":
      p.forward_payments_end += t.amount;
      break;
    case "compensation/stock":
      p.stock_end -= t.amount;
      break;
    case "compensation/forward-payment":
      p.forward_payments_end -= t.amount;
      break;
    default:
      throw new Error("Unknown transaction type:", t.type);
  }

  return p;
};

const createPeriod = (
  t: Omit<Transaction, "period_id">,
  userId: Auth["userId"],
  prevPeriod?: FinancePeriod,
): FinancePeriod => {
  let newPeriod: FinancePeriod;
  const { periodStartDate } = getPeriodWeekByDate(t.date);

  if (prevPeriod) {
    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: periodStartDate,
      balance_start: prevPeriod.balance_end,
      balance_end: prevPeriod.balance_end,
      stock_start: prevPeriod.stock_end,
      stock_end: prevPeriod.stock_end,
      forward_payments_start: prevPeriod.forward_payments_end,
      forward_payments_end: prevPeriod.forward_payments_end,
    };

    const updatedPeriod = updatePeriodBalanceByTransaction(newPeriod, t);

    return updatedPeriod;
  } else {
    newPeriod = {
      id: uuidv4(),
      user_id: userId!,
      start_date: periodStartDate,
      balance_start: 0,
      balance_end: 0,
      stock_start: 0,
      stock_end: 0,
      forward_payments_start: 0,
      forward_payments_end: 0,
    };
  }

  return newPeriod;
};

export function getPeriodsOnStartBalanceChange(
  periods: Periods,
  balanceDifference: BalanceDifference,
) {
  const valuesToUpdate: Periods = [];
  const {
    balance: startBalanceDifference,
    stock: stockDifference,
    forward_payments: forwardPaymentsDifference,
  } = balanceDifference;

  for (let i = 0; i < periods.length; i++) {
    const p = { ...periods[i] };

    p.balance_start -= startBalanceDifference;
    p.balance_end -= startBalanceDifference;

    p.stock_start -= stockDifference;
    p.stock_end -= stockDifference;

    p.forward_payments_start -= forwardPaymentsDifference;
    p.forward_payments_end -= forwardPaymentsDifference;

    valuesToUpdate.push(p);
  }

  return valuesToUpdate;
}

export function getPeriodsOnEndBalanceChange(
  periods: Periods,
  currentPeriodIndex: number,
  periodId: Transaction["period_id"],
  whatChanged: "income" | "payment",
  difference: number,
) {
  const valuesToUpdate: Periods = [];

  for (let i = currentPeriodIndex; i < periods.length; i++) {
    const p = periods[i];
    const isPayment = whatChanged === "payment";
    const sign = isPayment ? -1 : 1;

    let newStartBalanceForPeriod = p.balance_start + sign * difference;
    const newEndBalanceForPeriod = p.balance_end + sign * difference;

    if (p.id === periodId) {
      newStartBalanceForPeriod = p.balance_start;
    }

    valuesToUpdate.push({
      ...p,
      balance_start: newStartBalanceForPeriod,
      balance_end: newEndBalanceForPeriod,
    });
  }

  return valuesToUpdate;
}

export function getPeriodsChangesOnTransactionsDelete(
  periods: Periods,
  deletedTransactions: Transactions,
) {
  const valuesToUpdate: Periods = [];

  for (const p of periods) {
    const period = { ...p };

    let wasUpdated = false;

    for (const t of deletedTransactions) {
      if (t.period_id === p.id) {
        wasUpdated = true;
        switch (t.type) {
          case "payment/fixed":
          case "payment/variable":
            period.balance_end += t.amount;
            break;
          case "income/profit":
            period.balance_end -= t.amount;
            break;
          case "income/stock":
            period.stock_end -= t.amount;
            break;
          case "income/forward-payment":
            period.forward_payments_end -= t.amount;
            break;
          case "compensation/stock":
            period.stock_end += t.amount;
            break;
          case "compensation/forward-payment":
            period.forward_payments_end += t.amount;
            break;
          default:
            throw new Error("Unknown transaction type:", t.type);
        }
      }
    }

    if (wasUpdated) valuesToUpdate.push(period);
  }

  return valuesToUpdate;
}

export function getStartBalance(periods: Periods): PeriodBalance {
  const {
    balance_start,
    balance_end,
    stock_start,
    stock_end,
    forward_payments_start,
    forward_payments_end,
  } = periods.toSorted((a, b) => a.start_date.localeCompare(b.start_date))[0];

  return {
    balance_start,
    balance_end,
    stock_start,
    stock_end,
    forward_payments_start,
    forward_payments_end,
  };
}

export function recalculatePeriods(
  periods: Periods,
  transactions: Transactions,
  originallyAffectedPeriodId: FinancePeriod["id"],
  newAffectedPeriodId?: FinancePeriod["id"],
  originalBalance?: PeriodBalance,
): Periods {
  // The goal of this function is to update periods after a change is transactions array.
  const recalculatedPeriods: Periods = [],
    //
    //
    // 1. Sort periods by date ascending
    sortedPeriods = periods.toSorted((a, b) =>
      a.start_date.localeCompare(b.start_date),
    );

  // 2. Establish the index of the earliest affected period.
  // It might be originallyAffectedPeriodId, or, if a new period was created, newAffectedPeriodId.
  let earliestAffectedPeriodIndex: number;

  if (newAffectedPeriodId) {
    earliestAffectedPeriodIndex = sortedPeriods.findIndex(
      (p) =>
        p.id === originallyAffectedPeriodId || p.id === newAffectedPeriodId,
    );
  } else {
    earliestAffectedPeriodIndex = sortedPeriods.findIndex(
      (p) => p.id === originallyAffectedPeriodId,
    );
  }

  if (earliestAffectedPeriodIndex === -1)
    throw new Error("Failed to find the index of earliestAffectedPeriod");

  // 3. Loop through periods array and recalculate balance fields.
  for (let i = earliestAffectedPeriodIndex; i < sortedPeriods.length; i++) {
    const p = sortedPeriods[i],
      prevUpdatedP = recalculatedPeriods[recalculatedPeriods.length - 1],
      prevSortedP = sortedPeriods[i - 1],
      periodTransactions = transactions.filter((t) => t.period_id === p.id),
      periodTransactionsSum = getTransactionsSumByPeriod(periodTransactions);

    const newStartBalance = getNewStartBalanceValue(
      p,
      i,
      originalBalance?.balance_start,
      prevUpdatedP,
      prevSortedP,
    );
    const newEndBalance = newStartBalance + periodTransactionsSum.endBalance,
      newStockStart = getNewStockValue(
        p,
        i,
        originalBalance?.stock_start,
        prevUpdatedP,
        prevSortedP,
      ),
      newStockEnd = newStockStart + periodTransactionsSum.endStock,
      newForwardPaymentsStart = getNewForwardPaymentsValue(
        p,
        i,
        originalBalance?.forward_payments_start,
        prevUpdatedP,
        prevSortedP,
      ),
      newForwardPaymentsEnd =
        newForwardPaymentsStart + periodTransactionsSum.endForwardPayments;

    recalculatedPeriods.push({
      ...p,
      balance_start: newStartBalance,
      balance_end: newEndBalance,
      stock_start: newStockStart,
      stock_end: newStockEnd,
      forward_payments_start: newForwardPaymentsStart,
      forward_payments_end: newForwardPaymentsEnd,
    });
  }

  return recalculatedPeriods;
}

function getNewStartBalanceValue(
  p: FinancePeriod,
  i: number,
  originalStartBalance: number | undefined,
  prevUpdatedP?: FinancePeriod,
  prevSortedP?: FinancePeriod,
) {
  // By default start_balance should be taken from prevRecalculatedPeriod. If the period is first in a loop:
  // try to take the value from originalStartBalance
  // if there's no originalStartBalance, leave the old value
  //  If the period IS NOT first in a loop:
  // Try to take from prevUpdatedPeriod
  // Else take from prevSortedPeriod
  let newStartBalance;

  if (i === 0) {
    if (originalStartBalance) {
      newStartBalance = originalStartBalance;
    } else {
      newStartBalance = p.balance_start;
    }
  } else {
    if (prevUpdatedP) {
      newStartBalance = prevUpdatedP.balance_end;
    } else newStartBalance = prevSortedP!.balance_end;
  }

  return newStartBalance;
}

function getNewStockValue(
  p: FinancePeriod,
  i: number,
  originalStock: number | undefined,
  prevUpdatedP: FinancePeriod,
  prevSortedP?: FinancePeriod,
) {
  let newStockStart;
  if (i === 0) {
    if (originalStock) {
      newStockStart = originalStock;
    } else {
      newStockStart = p.stock_start;
    }
  } else {
    if (prevUpdatedP) {
      newStockStart = prevUpdatedP.stock_end;
    } else newStockStart = prevSortedP!.stock_end;
  }

  return newStockStart;
}

function getNewForwardPaymentsValue(
  p: FinancePeriod,
  i: number,
  originalFP: number | undefined,
  prevUpdatedP: FinancePeriod,
  prevSortedP?: FinancePeriod,
) {
  let newFPStart;
  if (i === 0) {
    if (originalFP) {
      newFPStart = originalFP;
    } else {
      newFPStart = p.forward_payments_start;
    }
  } else {
    if (prevUpdatedP) {
      newFPStart = prevUpdatedP.forward_payments_end;
    } else newFPStart = prevSortedP!.forward_payments_end;
  }

  return newFPStart;
}

export function getTransactionsSumByPeriod(transactions: Transactions) {
  return transactions.reduce(
    (sum, t) => {
      switch (t.type) {
        case "payment/fixed":
        case "payment/variable":
          sum.endBalance -= t.amount;
          break;
        case "income/profit":
          sum.endBalance += t.amount;
          break;
        case "compensation/stock":
          sum.endStock -= t.amount;
          sum.endBalance += t.amount;
          break;
        case "income/stock":
          sum.endStock += t.amount;
          break;
        case "compensation/forward-payment":
          sum.endForwardPayments -= t.amount;
          sum.endBalance += t.amount;
          break;
        case "income/forward-payment":
          sum.endForwardPayments += t.amount;
          break;
        default:
          throw new Error(`Unknown transation type: ${t.type}`);
      }

      return sum;
    },
    {
      endBalance: 0,
      endStock: 0,
      endForwardPayments: 0,
    },
  );
}

export function sumTransactionsByCategory(transactions: Transactions) {
  return transactions.reduce(
    (sum, t) => {
      switch (t.type) {
        case "payment/fixed":
        case "payment/variable":
          sum.spent += t.amount;
          break;
        case "income/profit":
          sum.earned += t.amount;
          break;
        case "compensation/stock":
          sum.spent += t.amount;
          break;
        case "income/stock":
          sum.saved += t.amount;
          break;
        case "compensation/forward-payment":
          sum.spent += t.amount;
          break;
        case "income/forward-payment":
          sum.saved += t.amount;
          break;
        default:
          throw new Error(`Unknown transation type: ${t.type}`);
      }

      return sum;
    },
    {
      earned: 0,
      spent: 0,
      saved: 0,
    },
  );
}

export function getEarliestPeriodIdByTransactions(
  selectedTransactions: TSelectedTransactions,
  getState: () => unknown,
) {
  const {
      cashflow: { entities },
      periods: { entities: periodEntities },
    } = getState() as RootState,
    periods = Object.values(periodEntities),
    transactions = Object.values(entities);

  const pendingTransactions = transactions.filter((t) =>
      selectedTransactions.includes(t.id),
    ),
    pendingTransactionsPeriodIds = pendingTransactions.map((t) => t.period_id),
    pendingPeriods = periods.filter((p) =>
      pendingTransactionsPeriodIds.includes(p.id),
    ),
    sortedPendingPeriods = pendingPeriods.toSorted((a, b) =>
      a.start_date.localeCompare(b.start_date),
    ),
    { id: earliestAffectedPeriodId } = sortedPendingPeriods[0];

  return earliestAffectedPeriodId;
}

export type MonthNames =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "December";

export type Months = {
  [M in MonthNames]?: {
    balance: number;
    earned: number;
    spent: number;
    saved: number;
  };
};

export function getPeriodsByMonth(
  periods: Periods,
  transactions: Transactions,
) {
  periods = periods.sort((a, b) => a.start_date.localeCompare(b.start_date));
  const monthNames = getMonths();
  const months: Months = {};

  for (const p of periods) {
    const periodMonthNumber = new Date(p.start_date).getMonth(),
      periodMonthName = monthNames[periodMonthNumber],
      existingMonth = months[periodMonthName],
      periodTransactions = transactions.filter((t) => t.period_id === p.id),
      transactionsSum = sumTransactionsByCategory(periodTransactions);

    if (existingMonth) {
      existingMonth.balance = p.balance_end;
      existingMonth.earned += transactionsSum.earned;
      existingMonth.spent += transactionsSum.spent;
      existingMonth.saved += transactionsSum.saved;
    } else {
      months[periodMonthName] = {
        balance: p.balance_end,
        earned: transactionsSum.earned,
        spent: transactionsSum.spent,
        saved: transactionsSum.saved,
      };
    }
  }

  return months;
}

export const getPeriodBalanceDifference = (
  newBalance: UpdatedFormFields,
  getState: () => unknown,
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
        ? firstPeriod.forward_payments_start - newBalance.forward_payments_start
        : 0,
    };

  return [periods, balanceDifference] as const;
};
