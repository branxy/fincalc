import { createRootRoute, Outlet } from "@tanstack/react-router";

import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import useSupabaseSession from "@/db/useSupabaseSession";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/db/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const [session, isLoading] = useSupabaseSession();

  if (isLoading) return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="w-full min-w-80 px-3 sm:mx-auto sm:w-96">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </div>
    );
  } else
    return (
      <div className="flex h-screen relative">
        <ThemeProvider defaultTheme="dark" storageKey="fincalc-ui-theme">
          <Navbar />
          <Outlet />
          <TanStackRouterDevtools position="top-right" />
        </ThemeProvider>
      </div>
    );
}
