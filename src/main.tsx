import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Provider } from "react-redux";
import { store } from "@/features/store.ts";

import "./index.css";
import { fetchPeriods } from "./features/periods/periodsSlice.ts";
import { fetchTransactions } from "./features/cashflow/cashflowSlice.ts";

const router = createRouter({ routeTree });
store.dispatch(fetchPeriods());
store.dispatch(fetchTransactions());
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  );
}
