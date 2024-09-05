import { Link } from "@tanstack/react-router";

import { PropsWithChildren } from "react";

export type LinkToTransactionsPageProps = PropsWithChildren<
  React.ComponentProps<typeof Link>
>;

function LinkToTransactionsPage({
  children,
  ...rest
}: LinkToTransactionsPageProps) {
  return (
    <Link
      to="/transactions"
      search={{
        sortBy: "date",
        asc: true,
      }}
      className="flex items-center"
      {...rest}
    >
      {children}
    </Link>
  );
}

export default LinkToTransactionsPage;
