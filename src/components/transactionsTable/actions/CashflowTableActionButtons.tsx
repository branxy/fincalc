import CashflowTableAddTransactionBtn from "@/components/transactionsTable/actions/CashflowTableAddTransactionBtn";
import TableInfo from "@/components/transactionsTable/TableInfo";
import Spinner from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  deletedTransactionsAndPeriodsRecalculated,
  transactionDuplicated,
} from "@/features/cashflow/cashflowSlice";

import { type Transaction } from "@/features/types";

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
  const hasSelectedTransactions = selectedTransactions.length > 0,
    singleTransactionSelected = selectedTransactions.length === 1;

  const handleDeleteCashflowItems = () => {
    dispatch(
      deletedTransactionsAndPeriodsRecalculated({ selectedTransactions }),
    );
    setSelectedTransactions([]);
  };

  const duplicateTransaction = () => {
    dispatch(transactionDuplicated({ transactionId: selectedTransactions[0] }));
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
        <Button onClick={duplicateTransaction} disabled={isLoading}>
          <Copy size={18} />
        </Button>
      )}
      <TableInfo />
    </div>
  );
}

export default CashflowTableActionButtons;
