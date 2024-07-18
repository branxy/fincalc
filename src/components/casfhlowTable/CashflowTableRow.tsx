import { CashflowItem } from "@/features/types";
import EditableTableCell from "@/components/casfhlowTable/EditableTableCell";
import clsx from "clsx";

interface CashflowTableRowProps {
  cashflowType: CashflowItem["type"];
  casfhlowItemId: CashflowItem["id"];
  title: CashflowItem["title"];
  amount: CashflowItem["amount"];
  date: CashflowItem["date"];
  selectedTransactions: CashflowItem["id"][];
  periodEndBalance?: number;
  handleSelectTransaction: (periodId: CashflowItem["id"]) => void;
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
    <tr className={clsx("h-8", isSelectedRow && "bg-zinc-500 text-slate-100")}>
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
        cashflowItemId={casfhlowItemId}
        cellType="title"
        cellValue={title}
      />
      <EditableTableCell
        cashflowItemId={casfhlowItemId}
        cellType="amount"
        cellValue={amount}
      />
      <EditableTableCell
        cashflowItemId={casfhlowItemId}
        cellType="type"
        cellValue={cashflowType!}
      />
      <EditableTableCell
        cashflowItemId={casfhlowItemId}
        cellType="date"
        cellValue={date}
      />
      {endBalance}
    </tr>
  );
}

export default CashflowTableRow;
