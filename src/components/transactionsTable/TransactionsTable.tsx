import TransactionsTableActionsButtons from "@/components/transactionsTable/actions/TransactionsTableActionButtons";
import TransactionsTableHead from "@/components/transactionsTable/TransactionsTableHead";
import Spinner from "@/components/ui/spinner";

import { useTableCheckbox } from "@/lib/hooks";
import {
  cn,
  addPeriodStatistics,
  sortAndFilterTransactions,
} from "@/lib/utils";

import { getRouteApi } from "@tanstack/react-router";

import { useMemo } from "react";
import { useGetTransactionsQuery } from "@/features/api/apiSlice";
import { TransactionsTableBody } from "./TransactionsTableBody";

const { useSearch } = getRouteApi("/transactions");

function TransactionsTable() {
  const searchParams = useSearch();
  const {
    data = {
      transactions: [],
      periods: [],
    },
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetTransactionsQuery();
  const { transactions, periods } = data;

  const [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
    handleUpdateLastSelectedTransactionRef,
  ] = useTableCheckbox(transactions);

  const sortedFilteredTransactions = useMemo(
    () => sortAndFilterTransactions(transactions, searchParams),
    [transactions, searchParams],
  );

  const periodsStats = useMemo(
    () => addPeriodStatistics(periods, sortedFilteredTransactions),
    [periods, sortedFilteredTransactions],
  );

  if (isLoading) {
    return (
      <div>
        <Spinner isLoading={true} />
      </div>
    );
  } else if (isSuccess) {
    return (
      <div className="mt-6 overflow-hidden">
        <div className="flex max-w-[720px] flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <TransactionsTableActionsButtons
            selectedTransactions={selectedTransactions}
            setSelectedTransactions={setSelectedTransactions}
          />
        </div>
        {transactions.length === 0 ? (
          <p className="mt-3 text-center">No transactions yet</p>
        ) : (
          <div
            className={cn("overflow-x-auto", {
              "opacity-50": isFetching,
            })}
          >
            <table className="mt-4 w-[720px] table-fixed overflow-x-scroll">
              <colgroup>
                <col className="" />
                <col className="w-36 md:w-40" />
                <col className="w-28" />
                <col className="w-44" />
                <col className="w-32" />
                <col className="w-36" />
              </colgroup>
              <TransactionsTableHead
                isCheckedCheckbox={isCheckedCheckbox}
                handleSelectAllTransactions={handleSelectAllTransactions}
              />
              <TransactionsTableBody
                transactions={sortedFilteredTransactions}
                periodsStats={periodsStats}
                selectedTransactions={selectedTransactions}
                handleSelectTransaction={handleSelectTransaction}
                handleUpdateLastSelectedTransactionRef={
                  handleUpdateLastSelectedTransactionRef
                }
              />
            </table>
          </div>
        )}
      </div>
    );
  } else if (isError) {
    return <div>{error!.toString()}</div>;
  }
}

export default TransactionsTable;
