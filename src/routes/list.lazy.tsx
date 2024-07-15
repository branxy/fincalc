import { selectAllCashflow } from "@/features/cashflow/cashflowSlice";
import { useAppSelector } from "@/lib/hooks";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/list")({
  component: List,
});

function List() {
  const cashflow = useAppSelector((state) => selectAllCashflow(state));

  return <main className="flex-grow py-2 sm:px-5">list</main>;
}
