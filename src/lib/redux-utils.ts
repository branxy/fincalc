import { getPeriodEndDate } from "@/lib/date-utils";

import type { Periods, Transaction } from "@/features/types";

export const findPeriodByTransactionDate = (
  transactionDate: Transaction["date"],
  periods: Periods,
) => {
  const existingPeriod = periods.findLast((p) => {
    const periodEndDate = getPeriodEndDate(p.start_date);

    return transactionDate >= p.start_date && transactionDate <= periodEndDate;
  });

  return existingPeriod;
};
