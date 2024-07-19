import { Transaction } from "@/features/types";
import EditableTableCell from "@/components/casfhlowTable/EditableTableCell";
import clsx from "clsx";

interface CashflowTableRowProps {
  cashflowType: Transaction["type"];
  casfhlowItemId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: Transaction["id"][];
  periodEndBalance?: number;
  handleSelectTransaction: (periodId: Transaction["id"]) => void;
}

function CashflowTableRow({
  cashflowType,
  casfhlowItemId,
  title,
  amount,
  date,
  selectedTransactions,
  periodEndBalance,
  handleSelectTransaction,
}: CashflowTableRowProps) {
  const isSelectedRow = Boolean(
    selectedTransactions?.find((id) => id === casfhlowItemId)
  );
  const endBalance = typeof periodEndBalance === "number" && (
    <td>${periodEndBalance}</td>
  );

  return (
    <tr className={clsx("h-10", isSelectedRow && "bg-zinc-500 text-slate-100")}>
      <td className="text-center">
        <input
          className="w-4 h-4"
          type="checkbox"
          name="select-cashflow-item"
          id="select-cashflow-item"
          aria-label={`Select ${cashflowType}`}
          onChange={() => handleSelectTransaction(casfhlowItemId)}
          checked={isSelectedRow}
        />
      </td>
      <EditableTableCell
        transactionId={casfhlowItemId}
        cellType="title"
        cellValue={title}
      />
      <EditableTableCell
        transactionId={casfhlowItemId}
        cellType="amount"
        cellValue={amount}
      />
      <EditableTableCell
        transactionId={casfhlowItemId}
        cellType="type"
        cellValue={cashflowType!}
      />
      <EditableTableCell
        transactionId={casfhlowItemId}
        cellType="date"
        cellValue={date}
      />
      {endBalance}
    </tr>
  );
}

export default CashflowTableRow;
