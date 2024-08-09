import { createLazyFileRoute } from "@tanstack/react-router";

import { useAppSelector } from "@/lib/hooks";
import { selectAllTransactions } from "@/features/cashflow/cashflowSlice";
import { selectPeriodsIdsAndEndBalance } from "@/features/periods/periodsSlice";

import CashflowTable from "@/components/transactionsTable/CashflowTable";

export const Route = createLazyFileRoute("/transactions")({
  component: List,
});

function List() {
  const periods = useAppSelector((state) =>
      selectPeriodsIdsAndEndBalance(state),
    ),
    cashflow = useAppSelector((state) => selectAllTransactions(state));

  return (
    <>
      <h1 className="text-2xl font-semibold">All transactions</h1>
      <CashflowTable periods={periods} cashflow={cashflow} />
    </>
  );
}
