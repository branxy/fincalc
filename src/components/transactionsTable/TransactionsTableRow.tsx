import TransactionsTableDateCell from "@/components/transactionsTable//cells/TransactionsTableDateCell";
import TransactionsTableTypeCell from "@/components/transactionsTable//cells/TransactionsTableTypeCell";
import TransactionsTableAmountCell from "@/components/transactionsTable/cells/TransactionsTableAmountCell";
import TransactionsTableTitleCell from "@/components/transactionsTable/cells/TransactionsTableTitleCell";
import EndBalance from "@/components/transactionsTable/cells/EndBalance";

import { TSelectedTransactions } from "@/lib/hooks";

import { Transaction } from "@/features/types";
import { MarkedTransactions } from "@/lib/utils";
import clsx from "clsx";
import { useRef } from "react";

export interface TransactionsTableRowProps {
  transactionType: Transaction["type"];
  transactionId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: TSelectedTransactions;
  periodEndBalance: MarkedTransactions[Transaction["id"]] | null;
  handleSelectTransaction: (periodId: Transaction["id"]) => void;
  handleUpdateLastSelectedTransactionRef: (
    rowRef: React.MutableRefObject<HTMLTableRowElement>,
  ) => void;
}

function TransactionsTableRow({
  transactionType,
  transactionId,
  title,
  amount,
  date,
  selectedTransactions,
  periodEndBalance,
  handleSelectTransaction,
  handleUpdateLastSelectedTransactionRef,
}: TransactionsTableRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null!);
  const isSelectedRow = Boolean(
    selectedTransactions?.find((id) => id === transactionId),
  );

  const handleDuplicateTransaction = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (!(e.ctrlKey && e.code === "KeyD") || selectedTransactions.length !== 1)
      return;

    e.preventDefault();
    // RTKQ mutation

    // dispatch(
    //   transactionDuplicated({
    //     transactionId: selectedTransactions[0],
    //   }),
    // );
  };

  return (
    <tr
      ref={rowRef}
      onKeyDown={handleDuplicateTransaction}
      className={clsx(
        "h-[48px]",
        isSelectedRow && "bg-zinc-500 text-slate-100",
      )}
      onClick={() => handleUpdateLastSelectedTransactionRef(rowRef)}
    >
      <td className="w-fit pr-2 text-right">
        <input
          className="h-4 w-4"
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
      <TransactionsTableTypeCell
        type={transactionType}
        transactionId={transactionId}
      />
      <TransactionsTableDateCell
        transactionId={transactionId}
        date={date}
        columnSpan={periodEndBalance ? 1 : 2}
      />
      {periodEndBalance && <EndBalance periodEndBalance={periodEndBalance} />}
    </tr>
  );
}

export default TransactionsTableRow;
