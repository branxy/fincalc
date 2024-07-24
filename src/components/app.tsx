import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { store } from "@/features/store";
import { fetchPeriods } from "@/features/periods/periodsSlice";
import { fetchTransactions } from "@/features/cashflow/cashflowSlice";

store.dispatch(fetchPeriods());
store.dispatch(fetchTransactions());

function App() {
  return (
    <div className="relative flex h-screen flex-col md:flex-row">
      <ThemeProvider defaultTheme="dark" storageKey="fincalc-ui-theme">
        <Navbar />
        <main className="h-full flex-grow overflow-y-auto overflow-x-hidden px-3 pb-24 pt-2 sm:px-5 md:pb-8">
          <Outlet />
        </main>
        <Toaster />
        <TanStackRouterDevtools position="top-right" />
      </ThemeProvider>
    </div>
  );
}

export default App;
