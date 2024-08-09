import { createContext, ReactNode, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/features/store.ts";
import { ThemeProvider } from "@/components/theme-provider";

export const CurrencyContext = createContext<
  [Currency, React.Dispatch<React.SetStateAction<Currency>>] | null
>(null);

export type Currency = "$" | "₱" | "€" | "£";

function Providers({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("$");
  return (
    <ThemeProvider defaultTheme="dark" storageKey="fincalc-ui-theme">
      <CurrencyContext.Provider value={[currency, setCurrency]}>
        <Provider store={store}>{children}</Provider>
      </CurrencyContext.Provider>
    </ThemeProvider>
  );
}

export default Providers;
