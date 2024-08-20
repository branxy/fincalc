import TransactionsTableDateCell from "@/components/transactionsTable//cells/TransactionsTableDateCell";
import TransactionsTableTypeCell from "@/components/transactionsTable//cells/TransactionsTableTypeCell";
import TransactionsTableAmountCell from "@/components/transactionsTable/cells/TransactionsTableAmountCell";
import TransactionsTableTitleCell from "@/components/transactionsTable/cells/TransactionsTableTitleCell";
import EndBalance from "@/components/transactionsTable/cells/EndBalance";

import { useAppSelector } from "@/lib/hooks";

import { FinancePeriod, Transaction } from "@/features/types";
import { MarkedCashflow } from "@/lib/utils";
import clsx from "clsx";

interface CashflowTableRowProps {
  transactionType: Transaction["type"];
  transactionId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: Transaction["id"][];
  periodEndBalance:
    | MarkedCashflow[FinancePeriod["id"]]["periodEndBalance"]
    | null;
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
      selectedTransactions?.find((id) => id === transactionId),
    ),
    isLoading = periodsStatus === "loading";

  return (
    <>
      <tr
        className={clsx(
          "h-[44px]",
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
        <TransactionsTableTitleCell
          title={title}
          transactionId={transactionId}
        />
        <TransactionsTableAmountCell
          amount={amount}
          transactionId={transactionId}
        />
        <TransactionsTableTypeCell
          type={transactionType}
          transactionId={transactionId}
        />
        <TransactionsTableDateCell transactionId={transactionId} date={date} />
        {periodEndBalance && (
          <EndBalance
            periodEndBalance={periodEndBalance}
            isLoading={isLoading}
          />
        )}
      </tr>
    </>
  );
}

export default CashflowTableRow;
