import { createLazyFileRoute } from "@tanstack/react-router";

import { useAppSelector } from "@/lib/hooks";
import { selectAllCashflow } from "@/features/cashflow/cashflowSlice";
import { selectPeriodsIdsAndEndBalance } from "@/features/periods/periodsSlice";

import CashflowTable from "@/components/casfhlowTable/CashflowTable";

export const Route = createLazyFileRoute("/list")({
  component: List,
});

function List() {
  const periods = useAppSelector((state) =>
      selectPeriodsIdsAndEndBalance(state)
    ),
    cashflow = useAppSelector((state) => selectAllCashflow(state));

  return (
    <main className="flex-grow py-2 sm:px-5">
      <CashflowTable periods={periods} cashflow={cashflow} />
    </main>
  );
}
