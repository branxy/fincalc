import { CashflowItem } from "@/features/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { Button } from "@/components/ui/button";

import {
  deletedCashflowItems,
  transactionAdded,
} from "@/features/cashflow/cashflowSlice";
import { LoaderCircle } from "lucide-react";
import { selectCurrentWeekPeriodId } from "@/features/periods/periodsSlice";

interface CashflowTableActionButtonsProps {
  selectedTransactions: CashflowItem["id"][];
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

function CashflowTableActionButtons({
  selectedTransactions,
  setSelectedTransactions,
}: CashflowTableActionButtonsProps) {
  const currentWeekPeriodId = useAppSelector((state) =>
    selectCurrentWeekPeriodId(state)
  );
  const cashflowStatus = useAppSelector((state) => state.cashflow.status);
  const isLoading = cashflowStatus === "loading";
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

  const spinner = isLoading && <LoaderCircle className="animate-spin" />;

  return (
    <div className="flex items-center gap-4">
      <Button
        className="gap-2"
        disabled={isLoading}
        onClick={() => dispatch(transactionAdded({ currentWeekPeriodId }))}
      >
        {spinner}
        Add transaction
      </Button>
      {!noRowsSelected && (
        <Button
          variant="destructive"
          className="gap-1.5"
          disabled={noRowsSelected || isLoading}
          onClick={handleDeleteCashflowItems}
        >
          {spinner}
          <span className="material-symbols-outlined">delete</span>
        </Button>
      )}
    </div>
  );
}

export default CashflowTableActionButtons;
