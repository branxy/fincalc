import TransactionsTableActionsButtons from "@/components/transactionsTable/actions/TransactionsTableActionButtons";
import TransactionsTableHead from "@/components/transactionsTable/TransactionsTableHead";
import TransactionsTableRow from "@/components/transactionsTable/TransactionsTableRow";
// import WeekNumber from "@/components/transactionsTable/WeekNumber";

import { useTableCheckbox } from "@/lib/hooks";
import { Fragment } from "react/jsx-runtime";
import { useMemo } from "react";

import { getRouteApi } from "@tanstack/react-router";

import { useAppSelector } from "@/lib/hooks";
import { selectAllTransactions } from "@/features/transactions/transactionsSlice";
import { selectAllPeriods } from "@/features/periods/periodsSlice";

import { getMarkedCashflow, sortAndFilterTransactions } from "@/lib/utils";

const { useSearch } = getRouteApi("/transactions");

function TransactionsTable() {
  const searchParams = useSearch();
  const periods = useAppSelector(selectAllPeriods);
  const transactions = useAppSelector(selectAllTransactions);

  const [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
    handleUpdateLastSelectedTransactionRef,
  ] = useTableCheckbox(transactions);

  const periodsStats = getMarkedCashflow(periods, transactions);
  const sortedFilteredTransactions = useMemo(
    () => sortAndFilterTransactions(transactions, searchParams),
    [transactions, searchParams],
  );

  const tableContent = sortedFilteredTransactions.map((t, i) => {
    if (!periodsStats[t.period_id]) return;

    const {
      // firstTransactionIndex,
      lastTransactionIndex,
      // weekNumber,
      // monthName,
      periodEndBalance,
    } = periodsStats[t.period_id];
    // isFirstTransactionInAPeriod = firstTransactionIndex === i,
    const periodStats = lastTransactionIndex === i ? periodEndBalance : null;
    return (
      <Fragment key={`${t.id}-fragment`}>
        {/* //   {isFirstTransactionInAPeriod && ( */}
        {/* //     <WeekNumber weekNumber={weekNumber} monthName={monthName} /> */}
        {/* //   )} */}
        <TransactionsTableRow
          transactionType={t.type}
          transactionId={t.id}
          title={t.title}
          amount={t.amount}
          date={t.date}
          selectedTransactions={selectedTransactions}
          periodEndBalance={periodStats}
          handleSelectTransaction={handleSelectTransaction}
          handleUpdateLastSelectedTransactionRef={
            handleUpdateLastSelectedTransactionRef
          }
        />
      </Fragment>
    );
  });

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
        <div className="overflow-x-auto">
          <table className="mt-4 w-[720px] table-fixed overflow-x-scroll">
            <colgroup>
              <col className="" />
              <col className="w-36 md:w-40" />
              <col className="w-28" />
              <col className="w-44" />
              <col className="w-32" />
              <col className="w-36" />
            </colgroup>
            <thead>
              <TransactionsTableHead
                isCheckedCheckbox={isCheckedCheckbox}
                handleSelectAllTransactions={handleSelectAllTransactions}
              />
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionsTable;
