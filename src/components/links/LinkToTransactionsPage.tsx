import { Link } from "@tanstack/react-router";

import { ComponentPropsWithoutRef, forwardRef } from "react";

// a workaround to avoid error in forwardRef props: "Exported variable 'LinkToTransactionsPage' has or is using name 'MakeOptionalPathParams' from external module "@tanstack/react-router/dist/esm/link" but cannot be named."
type LinkToTransactionsPageProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "to" | "search"
>;

const LinkToTransactionsPage = forwardRef<
  HTMLAnchorElement,
  LinkToTransactionsPageProps
>((props, ref) => (
  <Link
    ref={ref}
    to="/transactions"
    search={{
      sortBy: "date",
      asc: true,
    }}
    className="flex items-center"
    {...props}
  >
    {props.children}
  </Link>
));

export default LinkToTransactionsPage;
