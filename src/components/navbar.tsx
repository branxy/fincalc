import NavbarLink from "@/components/navbar-link";
import Settings from "@/components/settings/Settings";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

import { Home, List } from "lucide-react";

import { useMediaQuery } from "@uidotdev/usehooks";
import { supabase } from "@/db/supabaseClient";
import { PropsWithChildren } from "react";

function Navbar() {
  const isMobile = useMediaQuery("only screen and (max-width: 460px)");

  return (
    <nav className="fixed bottom-0 left-0 z-10 box-border flex w-full flex-shrink-0 items-center gap-2 overflow-hidden border-t-2 bg-background px-2 py-3 lg:static lg:h-screen lg:w-36 lg:flex-col lg:justify-between lg:border-r-2 lg:px-4">
      <ul className="flex h-full flex-1 justify-center gap-2 sm:gap-6 lg:flex-col lg:justify-start lg:gap-2.5">
        <ResponsiveNavLink to="/">
          {isMobile ? <Home size={20} /> : <span>Dashboard</span>}
        </ResponsiveNavLink>
        <ResponsiveNavLink
          to="/transactions"
          search={{
            sortBy: "date",
            asc: true,
          }}
        >
          {isMobile ? <List size={20} /> : <span>Transactions</span>}
        </ResponsiveNavLink>
      </ul>
      <div className="flex gap-2 sm:gap-6 lg:flex-col lg:gap-2">
        <div className="flex gap-1.5">
          <Settings />
          <ModeToggle />
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.error(error.message);
          }}
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;

type TSRouterLinkProps = React.ComponentProps<typeof Link>;
type ResponsiveNavLinkProps = PropsWithChildren<TSRouterLinkProps>;

function ResponsiveNavLink({ children, ...rest }: ResponsiveNavLinkProps) {
  const isMobile = useMediaQuery("only screen and (max-width: 460px)");
  return isMobile ? (
    <Link
      activeProps={{
        className: "bg-green-300 text-zinc-700 font-semibold",
      }}
      activeOptions={{ exact: true }}
      className={
        "flex h-full items-center gap-2 rounded px-4 pb-2 pt-1.5 align-baseline ring-green-300 hover:ring-1 md:px-2 md:pb-1 md:pt-0"
      }
      {...rest}
    >
      {children}
    </Link>
  ) : (
    <NavbarLink {...rest}>{children}</NavbarLink>
  );
}
