import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import NavbarLink from "./navbar-link";
import Settings from "./settings/Settings";

import { supabase } from "@/db/supabaseClient";

function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 z-10 box-border flex w-full flex-shrink-0 items-center gap-2 overflow-hidden border-t-2 bg-background px-2 py-3 lg:static lg:h-screen lg:w-36 lg:flex-col lg:justify-between lg:border-r-2 lg:px-4">
      <ul className="flex h-full flex-1 justify-center gap-2 sm:gap-6 lg:flex-col lg:justify-start lg:gap-2.5">
        <NavbarLink path="/" name="Dashboard" />
        <NavbarLink path="/list" name="List" />
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
