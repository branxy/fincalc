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
    <div className="flex h-screen relative">
      <ThemeProvider defaultTheme="dark" storageKey="fincalc-ui-theme">
        <Navbar />
        <Outlet />
        <Toaster />
        <TanStackRouterDevtools position="top-right" />
      </ThemeProvider>
    </div>
  );
}

export default App;
