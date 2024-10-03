import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { type TSelectedTransactions, useAppSelector } from "@/lib/hooks";

export interface TransactionsTableDuplicateButtonProps {
  selectedTransactions: TSelectedTransactions;
}

function TransactionsTableDuplicateButton({
  selectedTransactions,
}: TransactionsTableDuplicateButtonProps) {
  const transactionsStatus = useAppSelector((state) => state.cashflow.status);
  const isLoading = transactionsStatus === "loading";

  const duplicateTransaction = () => {
    dispatch(transactionDuplicated({ transactionId: selectedTransactions[0] }));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={duplicateTransaction}
            disabled={isLoading}
            className="flex-col"
          >
            <Copy size={18} className="shrink-0" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="pt-1">
          <kbd className="text-xs">Ctrl + D</kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TransactionsTableDuplicateButton;
