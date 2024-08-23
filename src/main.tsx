import Providers from "@/components/providers.tsx";

import { Button } from "@/components/ui/button";

import { routeTree } from "@/routeTree.gen.ts";
import { createRouter, Link, RouterProvider } from "@tanstack/react-router";

import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import "@/index.css";

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p>This page was not found.</p>
      <Button>
        <Link to="/">Go to homepage</Link>
      </Button>
    </div>
  ),
});

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
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}
