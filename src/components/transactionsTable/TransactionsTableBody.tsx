import { Transaction, Transactions } from "@/features/types";
import TransactionsTableRow from "./TransactionsTableRow";
import { TSelectedTransactions } from "@/lib/hooks";
import { type MarkedTransactions } from "@/lib/utils";

export interface TransactionsTableBodyProps {
  transactions: Transactions;
  periodsStats: MarkedTransactions;
  selectedTransactions: TSelectedTransactions;
  handleSelectTransaction: (cashflowItemId: Transaction["id"]) => void;
  handleUpdateLastSelectedTransactionRef: (
    rowRef: React.MutableRefObject<HTMLTableRowElement>,
  ) => void;
}

export function TransactionsTableBody({
  transactions,
  periodsStats,
  selectedTransactions,
  handleSelectTransaction,
  handleUpdateLastSelectedTransactionRef,
}: TransactionsTableBodyProps) {
  const tableContent = transactions.map((t) => {
    const transactionPeriodStats = periodsStats[t.id] ?? null;
    return (
      <TransactionsTableRow
        transactionType={t.type}
        transactionId={t.id}
        title={t.title}
        amount={t.amount}
        date={t.date}
        selectedTransactions={selectedTransactions}
        periodEndBalance={transactionPeriodStats}
        handleSelectTransaction={handleSelectTransaction}
        handleUpdateLastSelectedTransactionRef={
          handleUpdateLastSelectedTransactionRef
        }
      />
    );
  });

  return <tbody>{tableContent}</tbody>;
}
