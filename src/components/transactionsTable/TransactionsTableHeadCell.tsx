import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Link } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { TransactionsSearchParams } from "@/routes/transactions";

export interface TransactionsTableHeadCellProps {
  columnName: TransactionsSearchParams["sortBy"];
}

const { useSearch } = getRouteApi("/transactions");

function TransactionsTableHeadCell({
  columnName,
}: TransactionsTableHeadCellProps) {
  const { sortBy, asc } = useSearch();

  const SortingIcon =
    sortBy !== columnName ? ArrowUpDown : asc ? ArrowUp : ArrowDown;
  const formattedCellName =
    columnName.charAt(0).toUpperCase() + columnName.slice(1);

  const updateSorting = (
    column: TransactionsSearchParams["sortBy"],
  ): TransactionsSearchParams => {
    const currentSortBy = sortBy,
      currentAsc = asc;
    switch (column) {
      case "amount":
        return {
          sortBy: "amount",
          asc: currentSortBy === "amount" ? !currentAsc : true,
        };
      case "type":
        return {
          sortBy: "type",
          asc: currentSortBy === "type" ? !currentAsc : true,
        };
      case "date":
        return {
          sortBy: "date",
          asc: currentSortBy === "date" ? !currentAsc : true,
        };
      default:
        throw new Error("Unexpected sorting type");
    }
  };

  return (
    <Button variant="ghost" className="group" asChild>
      <Link
        search={() => updateSorting(columnName)}
        className="flex items-center gap-2 text-base font-bold"
      >
        <span>{formattedCellName}</span>
        <SortingIcon
          size={16}
          className={cn(
            sortBy !== columnName &&
              "opacity-0 duration-300 group-hover:opacity-100",
          )}
        />
      </Link>
    </Button>
  );
}

export default TransactionsTableHeadCell;
