import TransactionsTableAddTransactionBtn from "@/components/transactionsTable/actions/TransactionsTableAddTransactionBtn";
import TransactionsTableDuplicateButton from "@/components/transactionsTable/actions/TransactionsTableDuplicateButton";
import TransactionsTableFilters from "@/components/transactionsTable/actions/filters/TransactionsTableFilters";
import TransactionsTableResetFiltersButton from "@/components/transactionsTable/actions/filters/TransactionsTableResetFiltersButton";
import TableInfo from "@/components/transactionsTable/TableInfo";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

import { TSelectedTransactions } from "@/lib/hooks";

import { filterOptions } from "@/components/transactionsTable/actions/filters/filterFns";

import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";

export type TransactionFilterNames = (typeof filterOptions)[number];
export type TransactionFilters = {
  [key in TransactionFilterNames]: React.ReactNode;
};

interface TransactionsTableActionButtonsProps {
  selectedTransactions: TSelectedTransactions;
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

const { useSearch } = getRouteApi("/transactions");

function TransactionsTableActionButtons({
  selectedTransactions,
  setSelectedTransactions,
}: TransactionsTableActionButtonsProps) {
  const { filter } = useSearch();

  const hasSelectedTransactions = selectedTransactions.length > 0,
    singleTransactionSelected = selectedTransactions.length === 1;

  const [selectedFilter, setSelectedFilter] =
    useState<TransactionFilterNames | null>(null);

  const handleDeleteTransactions = () => {
    // RTKQ mutation
    setSelectedTransactions([]);
  };

  return (
    <div className="flex w-full items-start justify-between">
      <div className="flex flex-wrap gap-4">
        <TransactionsTableAddTransactionBtn />
        {hasSelectedTransactions && (
          <Button
            variant="destructive"
            className="gap-1.5"
            //@ts-expect-error will be fixed with RTKQ
            disabled={isLoading}
            onClick={handleDeleteTransactions}
          >
            <Spinner
              //@ts-expect-error will be fixed with RTKQ
              isLoading={isLoading}
            />
            <span className="material-symbols-outlined">delete</span>
          </Button>
        )}
        {singleTransactionSelected && (
          <TransactionsTableDuplicateButton
            selectedTransactions={selectedTransactions}
          />
        )}
        <TableInfo />
      </div>
      <div className="flex items-center gap-2">
        {filter && <TransactionsTableResetFiltersButton />}
        <TransactionsTableFilters
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      </div>
    </div>
  );
}

export default TransactionsTableActionButtons;
