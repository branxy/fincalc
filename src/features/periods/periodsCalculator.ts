import { Transactions, Transaction, FinancePeriod, Periods } from "../types";

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
