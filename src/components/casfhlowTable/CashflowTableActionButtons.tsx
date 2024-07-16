import { CashflowItem } from "@/features/types";
import { useAppDispatch } from "@/lib/hooks";

import { Button } from "@/components/ui/button";

import {
  deletedCashflowItems,
  transactionAdded,
} from "@/features/cashflow/cashflowSlice";

interface CashflowTableActionButtonsProps {
  selectedTransactions: CashflowItem["id"][];
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

function CashflowTableActionButtons({
  selectedTransactions,
  setSelectedTransactions,
}: CashflowTableActionButtonsProps) {
  const dispatch = useAppDispatch();
  const noRowsSelected = selectedTransactions.length === 0;

  function handleDeleteCashflowItems() {
    dispatch(
      deletedCashflowItems({
        selectedTransactions,
      })
    );
    setSelectedTransactions([]);
  }
  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => dispatch(transactionAdded())}>
        Add transaction
      </Button>
      <Button
        variant="destructive"
        disabled={noRowsSelected}
        onClick={handleDeleteCashflowItems}
      >
        <span className="material-symbols-outlined">delete</span>
      </Button>
    </div>
  );
}

export default CashflowTableActionButtons;
