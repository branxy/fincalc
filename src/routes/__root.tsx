import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import useSupabaseSession from "@/db/useSupabaseSession";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/db/supabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

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
      <div className="flex h-screen">
        <ThemeProvider defaultTheme="dark" storageKey="fincalc-ui-theme">
          <Navbar />
          <Outlet />
          <TanStackRouterDevtools position="bottom-right" />
        </ThemeProvider>
      </div>
    );
}

const generalLinkClasses =
    "px-2 pb-1 hover:ring-1 ring-green-300 rounded align-baseline",
  activeLinkClasses = "bg-green-300 text-zinc-700 font-semibold";

function Navbar() {
  return (
    <nav className="flex h-full flex-col justify-between w-32 border-r-2 px-4 py-3">
      <ul className="flex flex-col justify-between gap-2.5">
        <li>
          <Link
            to="/"
            activeProps={{
              className: activeLinkClasses,
            }}
            activeOptions={{ exact: true }}
            className={generalLinkClasses}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/list"
            activeProps={{ className: activeLinkClasses }}
            activeOptions={{ exact: true }}
            className={generalLinkClasses}
          >
            List
          </Link>
        </li>
      </ul>
      <div className="flex flex-col gap-2">
        <ModeToggle />
        <Button
          variant="outline"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.error(error);
          }}
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}
