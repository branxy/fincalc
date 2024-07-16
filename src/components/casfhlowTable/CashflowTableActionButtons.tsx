import { CashflowItem } from "@/features/types";
import { useAppDispatch } from "@/lib/hooks";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { transactionAdded } from "@/features/cashflow/cashflowSlice";
import { getToastByDispatchStatus } from "@/lib/utils";

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

  async function handleAddTransaction() {
    const {
      meta: { requestStatus },
    } = await dispatch(transactionAdded());

    getToastByDispatchStatus(requestStatus, {
      success: "Created a transaction",
      error: "Failed to create a transation",
    });
  }

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
      <Button onClick={handleAddTransaction}>Add transaction</Button>
      <Button
        variant="destructive"
        disabled={noRowsSelected}
        onClick={handleDeleteCashflowItems}
      >
        <span className="material-symbols-outlined">delete</span>
      </Button>
      <Button onClick={() => toast.error("Success")}>toast</Button>
    </div>
  );
}

export default CashflowTableActionButtons;
