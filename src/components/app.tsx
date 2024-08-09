import Navbar from "@/components/navbar";
import { Toaster } from "sonner";

import { store } from "@/features/store";
import { fetchPeriods } from "@/features/periods/periodsSlice";
import { fetchTransactions } from "@/features/cashflow/cashflowSlice";

import { Outlet } from "@tanstack/react-router";

store.dispatch(fetchPeriods());
store.dispatch(fetchTransactions());

function App() {
  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      <Navbar />
      <main className="h-full flex-grow overflow-y-auto overflow-x-hidden px-3 pb-24 pt-2 sm:px-5 lg:pb-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
