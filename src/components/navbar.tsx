import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { supabase } from "@/db/supabaseClient";

const generalLinkClasses =
    "px-2 pb-1 hover:ring-1 ring-green-300 rounded align-baseline",
  activeLinkClasses = "bg-green-300 text-zinc-700 font-semibold";

function Navbar() {
  return (
    <nav className="absolute md:static bg-background left-0 bottom-0 w-full flex items-center border-t-2 md:h-full md:flex-col md:justify-between md:w-32 md:border-r-2 px-4 py-3">
      <ul className="flex flex-1 justify-center md:justify-start md:flex-col gap-2.5">
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
      <div className="flex md:flex-col gap-2">
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
