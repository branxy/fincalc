import { Cashflow, Periods } from "@/features/types";
import { useTableCheckbox } from "@/lib/hooks";
import { getMarkedCashflow } from "@/lib/utils";
import CashflowTableRow from "./CashflowTableRow";
import CashflowTableActionButtons from "./CashflowTableActionButtons";

interface CasfhlowTableProps {
  cashflow: Cashflow;
  periods: Periods;
}
function CashflowTable({ cashflow, periods }: CasfhlowTableProps) {
  const [
    selectedTransactions,
    setSelectedTransactions,
    isCheckedCheckbox,
    handleSelectTransaction,
    handleSelectAllTransactions,
  ] = useTableCheckbox(cashflow);

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
      <table className="w-full table-fixed mt-4 max-w-[720px] overflow-x-auto">
        <colgroup>
          <col className="w-12" />
          <col className="w-40 max-w-64" />
          <col className="w-28" />
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
    </div>
  );
}

export default CashflowTable;
