import CashflowTableActionButtons from "@/components/transactionsTable/CashflowTableActionButtons";
import CashflowTableRow from "@/components/transactionsTable/CashflowTableRow";
import StartBalance from "@/components/transactionsTable/StartBalance";

import { FinancePeriod, Transactions } from "@/features/types";
import { useTableCheckbox } from "@/lib/hooks";
import { getMarkedCashflow } from "@/lib/utils";

interface CashflowTableProps {
  cashflow: Transactions;
  periods: Pick<FinancePeriod, "id" | "end_balance">[];
}
function CashflowTable({ cashflow, periods }: CashflowTableProps) {
  const [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
  ] = useTableCheckbox(cashflow);

  // For each period, find the last transaction's index and return {"transactionIndex": period_end_balance}
  const endBalance = getMarkedCashflow(periods, cashflow);

  const tableContent = cashflow.map((item, i) => {
    const periodEndBalance = endBalance[i];
    return (
      <CashflowTableRow
        key={item.id}
        transactionType={item.type}
        transactionId={item.id}
        title={item.title}
        amount={item.amount}
        date={item.date}
        selectedTransactions={selectedTransactions}
        periodEndBalance={periodEndBalance}
        handleSelectTransaction={handleSelectTransaction}
      />
    );
  });
  return (
    <div className="mt-6 overflow-hidden">
      <div className="flex max-w-[600px] flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <CashflowTableActionButtons
          selectedTransactions={selectedTransactions}
          setSelectedTransactions={setSelectedTransactions}
        />
        <StartBalance />
      </div>
      {cashflow.length === 0 ? (
        <p className="mt-3 text-center">No transactions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="mt-4 w-[600px] table-fixed overflow-x-scroll">
            <colgroup>
              <col className="" />
              <col className="w-36 md:w-40" />
              <col className="w-16 md:w-20" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-16" />
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

export default CashflowTable;
