import { supabase } from "@/db/supabaseClient";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import NavbarLink from "./navbar-link";

function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 z-10 box-border flex w-full flex-shrink-0 items-center overflow-hidden border-t-2 bg-background px-4 py-3 md:static md:h-screen md:w-36 md:flex-col md:justify-between md:border-r-2">
      <ul className="flex h-full flex-1 justify-center gap-6 md:flex-col md:justify-start md:gap-2.5">
        <NavbarLink path="/" name="Dashboard" />
        <NavbarLink path="/list" name="List" />
      </ul>
      <div className="flex gap-6 md:flex-col md:gap-2">
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
