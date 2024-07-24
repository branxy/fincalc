import { supabase } from "@/db/supabaseClient";
import { Link } from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

const generalLinkClasses =
    "px-2 pb-1 hover:ring-1 ring-green-300 rounded align-baseline",
  activeLinkClasses = "bg-green-300 text-zinc-700 font-semibold";

function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 z-10 flex w-full items-center overflow-hidden border-t-2 bg-background px-4 py-3 md:static md:h-screen md:w-32 md:flex-col md:justify-between md:border-r-2">
      <ul className="flex flex-1 justify-center gap-2.5 md:flex-col md:justify-start">
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
      <div className="flex gap-2 md:flex-col">
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

export default Navbar;
