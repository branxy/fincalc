import CashflowTableActionButtons from "@/components/transactionsTable/actions/TransactionsTableActionButtons";
import CashflowTableRow from "@/components/transactionsTable/TransactionsTableRow";
import WeekNumber from "@/components/transactionsTable/WeekNumber";

import { FinancePeriod, Transactions } from "@/features/types";
import { useTableCheckbox } from "@/lib/hooks";
import { getMarkedCashflow } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";

interface TransactionsTableProps {
  transactions: Transactions;
  periods: Pick<
    FinancePeriod,
    "id" | "balance_end" | "stock_end" | "forward_payments_end"
  >[];
}
function TransactionsTable({ transactions, periods }: TransactionsTableProps) {
  const [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
    handleUpdateLastSelectedTransactionRef,
  ] = useTableCheckbox(transactions);

  // For each period, create a `stats` object. Needed to display week numbers and end-balance on last transactions
  const periodsStats = getMarkedCashflow(periods, transactions);

  const tableContent = transactions.map((t, i) => {
    if (!periodsStats[t.period_id]) return;

    const {
        firstTransactionIndex,
        lastTransactionIndex,
        weekNumber,
        monthName,
        periodEndBalance,
      } = periodsStats[t.period_id],
      isFirstTransactionInAPeriod = firstTransactionIndex === i,
      periodStats = lastTransactionIndex === i ? periodEndBalance : null;
    return (
      <Fragment key={`${t.id}-fragment`}>
        {isFirstTransactionInAPeriod && (
          <WeekNumber weekNumber={weekNumber} monthName={monthName} />
        )}
        <CashflowTableRow
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
        <CashflowTableActionButtons
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
              <col className="w-16 md:w-20" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-36" />
            </colgroup>
            <thead>
              <tr>
                <th className="w-6 pr-2 text-right">
                  <input
                    className="h-4 w-4"
                    type="checkbox"
                    name="select-all"
                    id="select-all"
                    onChange={handleSelectAllTransactions}
                    checked={isCheckedCheckbox}
                  />
                </th>
                <th className="text-left">Name</th>
                <th className="text-left">Amount</th>
                <th className="text-left">Type</th>
                <th className="text-left">Date</th>
                <th className="text-left">Balance</th>
              </tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionsTable;
