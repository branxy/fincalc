import { Transaction } from "@/features/types";
import EditableTableCell from "@/components/casfhlowTable/EditableTableCell";
import clsx from "clsx";
import TransactionsTableTitleCell from "./cells/TransactionsTableTitleCell";
import TransactionsTableAmountCell from "./cells/TransactionsTableAmountCell";
import { useAppSelector } from "@/lib/hooks";
import { LoaderCircle } from "lucide-react";

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
  const periodsStatus = useAppSelector((state) => state.periods.status);
  const isSelectedRow = Boolean(
      selectedTransactions?.find((id) => id === transactionId)
    ),
    isLoading = periodsStatus === "loading",
    endBalance = isLoading ? (
      <LoaderCircle className="animate-spin" />
    ) : (
      typeof periodEndBalance === "number" && <td>${periodEndBalance}</td>
    );

  return (
    <tr
      className={clsx(
        "h-[44px]",
        isSelectedRow && "bg-zinc-500 text-slate-100"
      )}
    >
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
      <TransactionsTableTitleCell title={title} transactionId={transactionId} />
      <TransactionsTableAmountCell
        amount={amount}
        transactionId={transactionId}
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
