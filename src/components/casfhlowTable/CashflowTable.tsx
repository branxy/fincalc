import { Cashflow, FinancePeriod } from "@/features/types";
import { useTableCheckbox } from "@/lib/hooks";
import { getMarkedCashflow } from "@/lib/utils";
import CashflowTableRow from "./CashflowTableRow";
import CashflowTableActionButtons from "./CashflowTableActionButtons";

interface CasfhlowTableProps {
  cashflow: Cashflow;
  periods: Pick<FinancePeriod, "id" | "end_balance">[];
}
function CashflowTable({ cashflow, periods }: CasfhlowTableProps) {
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
        cashflowType={item.type}
        casfhlowItemId={item.id}
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
    <div className="md:overflow-x-auto h-full">
      <CashflowTableActionButtons
        selectedTransactions={selectedTransactions}
        setSelectedTransactions={setSelectedTransactions}
      />
      {cashflow.length === 0 ? (
        <p className="text-center mt-3">No transactions yet</p>
      ) : (
        <table className="w-full table-fixed mt-4 max-w-[720px] overflow-x-auto">
          <colgroup>
            <col className="w-12" />
            <col className="w-28 md:w-40 max-w-64" />
            <col className="w-16 md:w-28" />
            <col className="w-32" />
            <col className="w-28" />
            <col className="w-16" />
          </colgroup>
          <thead>
            <tr>
              <th>
                <input
                  className="w-4 h-4"
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
      )}
    </div>
  );
}

export default CashflowTable;
