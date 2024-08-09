import TransactionsTableDateCell from "@/components/transactionsTable//cells/TransactionsTableDateCell";
import TransactionsTableTypeCell from "@/components/transactionsTable//cells/TransactionsTableTypeCell";
import TransactionsTableAmountCell from "@/components/transactionsTable/cells/TransactionsTableAmountCell";
import TransactionsTableTitleCell from "@/components/transactionsTable/cells/TransactionsTableTitleCell";

import { useAppSelector } from "@/lib/hooks";

import { FinancePeriod, Transaction } from "@/features/types";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

interface CashflowTableRowProps {
  transactionType: Transaction["type"];
  transactionId: Transaction["id"];
  title: Transaction["title"];
  amount: Transaction["amount"];
  date: Transaction["date"];
  selectedTransactions: Transaction["id"][];
  periodEndBalance?: Pick<
    FinancePeriod,
    "balance_end" | "stock_end" | "forward_payments_end"
  >;
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
  const [currencySign] = useContext(CurrencyContext)!;
  const isSelectedRow = Boolean(
      selectedTransactions?.find((id) => id === transactionId),
    ),
    isLoading = periodsStatus === "loading",
    endBalance = isLoading ? (
      <td>
        <LoaderCircle className="animate-spin" />
      </td>
    ) : (
      <td>
        {typeof periodEndBalance?.balance_end === "number" && (
          <span className="block">
            End balance: {currencySign + periodEndBalance.balance_end}
          </span>
        )}
        {typeof periodEndBalance?.stock_end === "number" && (
          <span className="block">
            Stock: {currencySign + periodEndBalance.stock_end}
          </span>
        )}
        {typeof periodEndBalance?.forward_payments_end === "number" && (
          <span className="block">
            Forward payments:{" "}
            {currencySign + periodEndBalance.forward_payments_end}
          </span>
        )}
      </td>
    );

  return (
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
      <TransactionsTableTitleCell title={title} transactionId={transactionId} />
      <TransactionsTableAmountCell
        amount={amount}
        transactionId={transactionId}
      />
      <TransactionsTableTypeCell
        type={transactionType}
        transactionId={transactionId}
      />
      <TransactionsTableDateCell transactionId={transactionId} date={date} />
      {endBalance}
    </tr>
  );
}

export default CashflowTableRow;
