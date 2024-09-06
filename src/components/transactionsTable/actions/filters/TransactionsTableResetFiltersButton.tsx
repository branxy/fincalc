import LinkToTransactionsPage from "@/components/links/LinkToTransactionsPage";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilterX } from "lucide-react";

import { ComponentPropsWithoutRef, forwardRef } from "react";

export interface TransactionsTableResetFiltersButtonProps {}

function TransactionsTableResetFiltersButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <TooltipTriggerButton />
        </TooltipTrigger>
        <TooltipContent>
          <p>Clear filters</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TransactionsTableResetFiltersButton;

const TooltipTriggerButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>((props, ref) => (
  <Button ref={ref} variant="ghost" size="sm" asChild {...props}>
    <LinkToTransactionsPage>
      <FilterX size={16} className="text-red-300" />
    </LinkToTransactionsPage>
  </Button>
));
