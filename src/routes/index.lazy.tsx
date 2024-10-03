import PeriodCard from "@/features/periods/PeriodCard";
import LinkToTransactionsPage from "@/components/links/LinkToTransactionsPage";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Spinner from "@/components/ui/spinner";

import { createLazyFileRoute } from "@tanstack/react-router";

import { useGetTransactionsQuery } from "@/features/api/apiSlice";

import {
  getPeriodsByMonth,
  MonthNames,
} from "@/features/periods/periodsCalculator";

export const Route = createLazyFileRoute("/")({
  component: PeriodsGrid,
});

function PeriodsGrid() {
  const {
    data = {
      transactions: [],
      periods: [],
    },
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetTransactionsQuery();
  const { transactions, periods } = data;

  if (isLoading) {
    return (
      <div>
        <Spinner isLoading={true} />
      </div>
    );
  } else if (isSuccess) {
    const months = getPeriodsByMonth(periods, transactions);
    return (
      <main>
        <h1 className="text-2xl font-semibold">Periods</h1>
        {periods.length === 0 ? (
          <Button variant="link" className="mt-6">
            <LinkToTransactionsPage>
              Go to transactions
              <ArrowRight size={18} className="ml-2" />
            </LinkToTransactionsPage>
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
  } else if (isError) {
    return <div>{error?.toString()}</div>;
  }
}
