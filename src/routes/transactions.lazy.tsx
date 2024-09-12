import { createLazyFileRoute } from "@tanstack/react-router";

import TransactionsTable from "@/components/transactionsTable/TransactionsTable";

export const Route = createLazyFileRoute("/transactions")({
  component: Transactions,
});

function Transactions() {
  return (
    <div className="xl:pl-6">
      <h1 className="text-2xl font-semibold">All transactions</h1>
      <TransactionsTable />
    </div>
  );
}
