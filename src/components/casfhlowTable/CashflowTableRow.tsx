import { Transaction } from "@/features/types";
import EditableTableCell from "@/components/casfhlowTable/EditableTableCell";
import clsx from "clsx";

interface CashflowTableRowProps {
  transactionType: Transaction["type"];
  transactionId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: Transaction["id"][];
  periodEndBalance?: number;
  handleSelectTransaction: (periodId: Transaction["id"]) => void;
}

function CashflowTableRow({
  transactionType,
  transactionId,
  title,
  amount,
  date,
  selectedTransactions,
  periodEndBalance,
  handleSelectTransaction,
}: CashflowTableRowProps) {
  const isSelectedRow = Boolean(
    selectedTransactions?.find((id) => id === transactionId)
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
          aria-label={`Select ${transactionType}`}
          onChange={() => handleSelectTransaction(transactionId)}
          checked={isSelectedRow}
        />
      </td>
      <EditableTableCell
        transactionId={casfhlowItemId}
        cellType="title"
        cellValue={title}
      />
      <EditableTableCell
        transactionId={transactionId}
        cellType="amount"
        cellValue={amount}
      />
      <EditableTableCell
        transactionId={transactionId}
        cellType="type"
        cellValue={transactionType!}
      />
      <EditableTableCell
        transactionId={transactionId}
        cellType="date"
        cellValue={date}
      />
      {endBalance}
    </tr>
  );
}

export default CashflowTableRow;
