import {
  FinancePeriod,
  Periods,
  Transaction,
  Transactions,
} from "@/features/types";

interface ValueToUpdate {
  id: FinancePeriod["id"];
  period: {
    start_balance: FinancePeriod["start_balance"];
    end_balance: FinancePeriod["end_balance"];
  };
}

export type ValuesToUpdate = ValueToUpdate[];

export function getPeriodsOnStartBalanceChange(
  periods: Periods,
  balanceDifference: number
) {
  const valuesToUpdate: Periods = [];

  for (let i = 0; i < periods.length; i++) {
    const p = periods[i],
      newStartBalanceForPeriod = p.start_balance - balanceDifference,
      newEndBalanceForPeriod = p.end_balance - balanceDifference;

    valuesToUpdate.push({
      ...p,
      start_balance: newStartBalanceForPeriod,
      end_balance: newEndBalanceForPeriod,
    });
  }

  return valuesToUpdate;
}

export function getPeriodsOnEndBalanceChange(
  periods: Periods,
  currentPeriodIndex: number,
  periodId: Transaction["period_id"],
  whatChanged: "income" | "payment",
  difference: number
) {
  const valuesToUpdate: Periods = [];

  for (let i = currentPeriodIndex; i < periods.length; i++) {
    const p = periods[i];
    const isPayment = whatChanged === "payment";
    const sign = isPayment ? -1 : 1;

    let newStartBalanceForPeriod = p.start_balance + sign * difference;
    const newEndBalanceForPeriod = p.end_balance + sign * difference;

    if (p.id === periodId) {
      newStartBalanceForPeriod = p.start_balance;
    }

    valuesToUpdate.push({
      ...p,
      start_balance: newStartBalanceForPeriod,
      end_balance: newEndBalanceForPeriod,
    });
  }

  return valuesToUpdate;
}

export function getPeriodsChangesOnTransactionsDelete(
  periods: Periods,
  deletedTransactions: Transactions
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
            period.end_balance += t.amount;
            break;
          case "income/profit":
            period.end_balance -= t.amount;
            break;
          case "income/stock":
            period.stock -= t.amount;
            break;
          case "income/forward-payment":
            period.forward_payments -= t.amount;
            break;
          case "compensation/stock":
            period.stock += t.amount;
            break;
          case "compensation/forward-payment":
            period.forward_payments += t.amount;
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

export function getStartBalance(periods: Periods) {
  return periods.toSorted((a, b) => a.start_date.localeCompare(b.start_date))[0]
    .start_balance;
}

export function recalculatePeriods(
  periods: Periods,
  transactions: Transactions,
  originallyAffectedPeriodId: FinancePeriod["id"],
  newAffectedPeriodId?: FinancePeriod["id"],
  originalStartBalance?: FinancePeriod["start_balance"]
): Periods {
  const recalculatedPeriods: Periods = [],
    sortedPeriods = periods.toSorted((a, b) =>
      a.start_date.localeCompare(b.start_date)
    );

  let earliestAffectedPeriodIndex;

  if (newAffectedPeriodId) {
    earliestAffectedPeriodIndex = sortedPeriods.findIndex(
      (p) => p.id === originallyAffectedPeriodId || p.id === newAffectedPeriodId
    );
  } else {
    earliestAffectedPeriodIndex = sortedPeriods.findIndex(
      (p) => p.id === originallyAffectedPeriodId
    );
  }

  for (let i = earliestAffectedPeriodIndex; i < sortedPeriods.length; i++) {
    const p = sortedPeriods[i],
      prevUpdatedP = recalculatedPeriods[recalculatedPeriods.length - 1],
      periodTransactions = transactions.filter((t) => t.period_id === p.id),
      periodTransactionsSum = getTransactionsSumByPeriod(periodTransactions);

    // By default start_balance should be taken from prevRecalculatedPeriod. If the period is first in a loop, it either takes from sortedPeriods[i-1].end_balance or (if it's also first in sortedPeriods) from originalStartBalance
    let newStartBalance;
    if (i === 0) {
      if (originalStartBalance) {
        newStartBalance = originalStartBalance;
      } else {
        newStartBalance = p.start_balance;
      }
    } else {
      if (prevUpdatedP) {
        newStartBalance = prevUpdatedP.end_balance;
      } else newStartBalance = sortedPeriods[i - 1].end_balance;
    }
    const newEndBalance = newStartBalance + periodTransactionsSum.endBalance,
      newStock = p.stock + periodTransactionsSum.stock,
      newForwardPayments =
        p.forward_payments + periodTransactionsSum.forward_payments;
    recalculatedPeriods.push({
      ...p,
      start_balance: newStartBalance,
      end_balance: newEndBalance,
      stock: newStock,
      forward_payments: newForwardPayments,
    });
  }

  return recalculatedPeriods;
}

function getTransactionsSumByPeriod(transactions: Transactions) {
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
          sum.stock -= t.amount;
          break;
        case "income/stock":
          sum.stock += t.amount;
          break;
        case "compensation/forward-payment":
          sum.forward_payments -= t.amount;
          break;
        case "income/forward-payment":
          sum.forward_payments += t.amount;
          break;
        default:
          throw new Error(`Unknown transation type: ${t.type}`);
      }

      return sum;
    },
    {
      endBalance: 0,
      stock: 0,
      forward_payments: 0,
    }
  );
}

export function getEarliestPeriodIdByTransactions(
  periods: Periods,
  transactions: Transactions,
  selectedTransactions: Transaction["id"][]
) {
  const pendingTransactions = transactions.filter((t) =>
      selectedTransactions.includes(t.id)
    ),
    pendingTransactionsPeriodIds = pendingTransactions.map((t) => t.period_id),
    pendingPeriods = periods.filter((p) =>
      pendingTransactionsPeriodIds.includes(p.id)
    ),
    sortedPendingPeriods = pendingPeriods.toSorted((a, b) =>
      a.start_date.localeCompare(b.start_date)
    ),
    { id: earliestAffectedPeriodId } = sortedPendingPeriods[0];

  return earliestAffectedPeriodId;
}
