import CashflowTableAddTransactionBtn from "@/components/transactionsTable/actions/CashflowTableAddTransactionBtn";
import TableInfo from "@/components/transactionsTable/TableInfo";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { deletedTransactionsAndPeriodsRecalculated } from "@/features/cashflow/cashflowSlice";

import { Button } from "@/components/ui/button";

import { Transaction } from "@/features/types";
import Spinner from "@/components/ui/spinner";

interface CashflowTableActionButtonsProps {
  selectedTransactions: Transaction["id"][];
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

function CashflowTableActionButtons({
  selectedTransactions,
  setSelectedTransactions,
}: CashflowTableActionButtonsProps) {
  const transactionsStatus = useAppSelector((state) => state.cashflow.status);
  const isLoading = transactionsStatus === "loading";
  const dispatch = useAppDispatch();
  const hasSelectedTransactions = selectedTransactions.length > 0;

  function handleDeleteCashflowItems() {
    dispatch(
      deletedTransactionsAndPeriodsRecalculated({ selectedTransactions }),
    );
    setSelectedTransactions([]);
  }

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
      <TableInfo />
    </div>
  );
}

export default CashflowTableActionButtons;
