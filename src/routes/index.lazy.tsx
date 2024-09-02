import PeriodCard from "@/features/periods/PeriodCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import { useAppSelector } from "@/lib/hooks";
import { selectAllTransactions } from "@/features/transactions/transactionsSlice";
import { selectAllPeriods } from "@/features/periods/periodsSlice";

import { createLazyFileRoute, Link } from "@tanstack/react-router";

import {
  getPeriodsByMonth,
  MonthNames,
} from "@/features/periods/periodsCalculator";

export const Route = createLazyFileRoute("/")({
  component: PeriodsGrid,
});

function PeriodsGrid() {
  const periods = useAppSelector((state) => selectAllPeriods(state));
  const transactions = useAppSelector((state) => selectAllTransactions(state));

  const months = getPeriodsByMonth(periods, transactions);
  return (
    <main>
      <h1 className="text-2xl font-semibold">Periods</h1>
      {periods.length === 0 ? (
        <Button variant="link" className="mt-6">
          <Link to="/transactions" className="flex items-center">
            Go to transactions
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </Button>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(months).map(([monthName, monthStats]) => (
            <PeriodCard
              key={monthName}
              monthName={monthName as MonthNames}
              monthStats={monthStats}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
