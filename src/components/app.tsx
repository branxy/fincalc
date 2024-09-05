import Navbar from "@/components/navbar";
import { Toaster } from "sonner";

import { store } from "@/features/store";
import { fetchPeriods } from "@/features/periods/periodsSlice";
import { fetchTransactions } from "@/features/transactions/transactionsSlice";

import { Outlet } from "@tanstack/react-router";
import React from "react";
import { fetchTransactionTemplates } from "@/features/transaction-templates/transactionTemplateSlice";

store.dispatch(fetchPeriods());
store.dispatch(fetchTransactions());
store.dispatch(fetchTransactionTemplates());

const TanStackRouterDevtools =
  import.meta.env.VITE_ENV === "development"
    ? React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )
    : () => null;

function App() {
  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      <Navbar />
      <main className="h-full flex-grow overflow-y-auto overflow-x-hidden pb-24 pl-6 pr-3 pt-2 lg:pb-8">
        <Outlet />
      </main>
      <Toaster />
      <TanStackRouterDevtools position="top-right" />
    </div>
  );
}

export default App;
