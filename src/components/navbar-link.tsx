import { Link } from "@tanstack/react-router";

import { PropsWithChildren } from "react";

function NavbarLink({
  children,
  ...rest
}: PropsWithChildren<React.ComponentProps<typeof Link>>) {
  return (
    <li className="h-full md:h-auto">
      <Link
        activeProps={{
          className: "bg-green-300 text-zinc-700 font-semibold",
        }}
        activeOptions={{ exact: true, includeSearch: false }}
        className={
          "flex h-full items-center gap-2 rounded px-4 pb-2 pt-1.5 align-baseline ring-green-300 hover:ring-1 md:px-2 md:pb-1 md:pt-0"
        }
        {...rest}
      >
        {children}
      </Link>
    </li>
  );
}

export default NavbarLink;
