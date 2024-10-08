import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { type TSelectedTransactions } from "@/lib/hooks";

export interface TransactionsTableDuplicateButtonProps {
  selectedTransactions: TSelectedTransactions;
}

function TransactionsTableDuplicateButton({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedTransactions,
}: TransactionsTableDuplicateButtonProps) {
  const duplicateTransaction = () => {
    // RTKQ mutation
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={duplicateTransaction}
            //@ts-expect-error not implemented yet
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
