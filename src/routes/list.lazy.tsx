import CashflowTable from "@/components/casfhlowTable/CashflowTable";
import { selectAllCashflow } from "@/features/cashflow/cashflowSlice";
import { selectAllPeriods } from "@/features/periods/periodsSlice";
import { useAppSelector } from "@/lib/hooks";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/list")({
  component: List,
});

function List() {
  const periods = useAppSelector((state) => selectAllPeriods(state));
  const cashflow = useAppSelector((state) => selectAllCashflow(state));

  return (
    <main className="flex-grow py-2 sm:px-5">
      <CashflowTable periods={periods} cashflow={cashflow} />
    </main>
  );
}
