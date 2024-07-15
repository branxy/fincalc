import { createLazyFileRoute } from "@tanstack/react-router";
import { selectAllPeriods } from "@/features/periods/periodsSlice";
import { useAppSelector } from "@/lib/hooks";

export const Route = createLazyFileRoute("/")({
  component: PeriodsGrid,
});

function PeriodsGrid() {
  const financePeriods = useAppSelector(selectAllPeriods);
  console.log({ financePeriods });

  return <main className="flex-grow py-2 sm:px-5">grid</main>;
}
