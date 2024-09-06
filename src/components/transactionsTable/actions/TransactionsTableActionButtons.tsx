import TransactionsTableAddTransactionBtn from "@/components/transactionsTable/actions/TransactionsTableAddTransactionBtn";
import TransactionsTableDuplicateButton from "@/components/transactionsTable/actions/TransactionsTableDuplicateButton";
import TransactionsTableFilters from "@/components/transactionsTable/actions/filters/TransactionsTableFilters";
import TableInfo from "@/components/transactionsTable/TableInfo";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

import {
  TSelectedTransactions,
  useAppDispatch,
  useAppSelector,
} from "@/lib/hooks";
import { deletedTransactionsAndPeriodsRecalculated } from "@/features/transactions/transactionsSlice";

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
    <div className="flex w-full items-start justify-between">
      <div className="flex flex-wrap gap-4">
        <TransactionsTableAddTransactionBtn isLoading={isLoading} />
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
      <TransactionsTableFilters />
    </div>
  );
}

export default TransactionsTableActionButtons;
