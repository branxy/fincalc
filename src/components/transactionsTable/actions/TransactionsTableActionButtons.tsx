import CashflowTableAddTransactionBtn from "@/components/transactionsTable/actions/TransactionsTableAddTransactionBtn";
import TableInfo from "@/components/transactionsTable/TableInfo";
import Spinner from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";

import {
  TSelectedTransactions,
  useAppDispatch,
  useAppSelector,
} from "@/lib/hooks";
import { deletedTransactionsAndPeriodsRecalculated } from "@/features/transactions/transactionsSlice";

import TransactionsTableDuplicateButton from "./TransactionsTableDuplicateButton";

interface TransactionsTableActionButtonsProps {
  selectedTransactions: TSelectedTransactions;
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

function TransactionsTableActionButtons({
  selectedTransactions,
  setSelectedTransactions,
}: TransactionsTableActionButtonsProps) {
  const transactionsStatus = useAppSelector((state) => state.cashflow.status);
  const isLoading = transactionsStatus === "loading";
  const dispatch = useAppDispatch();
  const hasSelectedTransactions = selectedTransactions.length > 0,
    singleTransactionSelected = selectedTransactions.length === 1;

  const handleDeleteCashflowItems = () => {
    dispatch(
      deletedTransactionsAndPeriodsRecalculated({ selectedTransactions }),
    );
    setSelectedTransactions([]);
  };

  return (
    <div className="flex items-center gap-4">
      <CashflowTableAddTransactionBtn isLoading={isLoading} />
      {hasSelectedTransactions && (
        <Button
          variant="destructive"
          className="gap-1.5"
          disabled={isLoading}
          onClick={handleDeleteCashflowItems}
        >
          <Spinner isLoading={isLoading} />
          <span className="material-symbols-outlined">delete</span>
        </Button>
      )}
      {singleTransactionSelected && (
        <TransactionsTableDuplicateButton
          selectedTransactions={selectedTransactions}
        />
      )}
      <TableInfo />
    </div>
  );
}

export default TransactionsTableActionButtons;
