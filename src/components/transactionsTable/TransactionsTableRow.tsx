import TransactionsTableDateCell from "@/components/transactionsTable//cells/TransactionsTableDateCell";
import TransactionsTableTypeCell from "@/components/transactionsTable//cells/TransactionsTableTypeCell";
import TransactionsTableAmountCell from "@/components/transactionsTable/cells/TransactionsTableAmountCell";
import TransactionsTableTitleCell from "@/components/transactionsTable/cells/TransactionsTableTitleCell";
import EndBalance from "@/components/transactionsTable/cells/EndBalance";

import {
  TSelectedTransactions,
  useAppDispatch,
  useAppSelector,
} from "@/lib/hooks";
import { transactionDuplicated } from "@/features/transactions/transactionsSlice";

import { FinancePeriod, Transaction } from "@/features/types";
import { MarkedCashflow } from "@/lib/utils";
import clsx from "clsx";

export interface TransactionsTableRowProps {
  transactionType: Transaction["type"];
  transactionId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: TSelectedTransactions;
  periodEndBalance:
    | MarkedCashflow[FinancePeriod["id"]]["periodEndBalance"]
    | null;
  handleSelectTransaction: (periodId: Transaction["id"]) => void;
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
}: TransactionsTableRowProps) {
  const periodsStatus = useAppSelector((state) => state.periods.status);
  const dispatch = useAppDispatch();
  const isSelectedRow = Boolean(
      selectedTransactions?.find((id) => id === transactionId),
    ),
    isLoading = periodsStatus === "loading";

  const handleDuplicateTransaction = (
    e: React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (!(e.ctrlKey && e.code === "KeyD") || selectedTransactions.length !== 1)
      return;

    e.preventDefault();
    dispatch(
      transactionDuplicated({
        transactionId: selectedTransactions[0],
      }),
    );
  };

  return (
    <tr
      onKeyDown={handleDuplicateTransaction}
      className={clsx(
        "h-[48px]",
        isSelectedRow && "bg-zinc-500 text-slate-100",
      )}
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
        periodEndBalance={periodEndBalance}
      />
      {periodEndBalance && (
        <EndBalance periodEndBalance={periodEndBalance} isLoading={isLoading} />
      )}
    </tr>
  );
}

export default TransactionsTableRow;
