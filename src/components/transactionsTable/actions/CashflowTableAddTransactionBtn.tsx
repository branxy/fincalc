import TransactionTemplate from "@/components/transactionsTable/actions/transaction-templates/TransactionTemplate";
import AddTransactionTemplate from "@/components/transactionsTable/actions/transaction-templates/AddTransactionTemplate";
import Spinner from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAllTransactionTemplates } from "@/features/transaction-templates/transactionTemplateSlice";
import { transactionAdded } from "@/features/cashflow/cashflowSlice";

import { useState } from "react";

interface CashflowTableAddTransactionBtnProps {
  isLoading: boolean;
}

function CashflowTableAddTransactionBtn({
  isLoading,
}: CashflowTableAddTransactionBtnProps) {
  const transactionTemplates = useAppSelector((state) =>
    selectAllTransactionTemplates(state),
  );
  const dispatch = useAppDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex">
      <Button
        className="flex gap-2 rounded-br-none rounded-tr-none pr-2"
        disabled={isLoading}
        onClick={() => dispatch(transactionAdded({}))}
      >
        <Spinner isLoading={isLoading} />
        Add transaction
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-fit rounded-bl-none rounded-br-md rounded-tl-none rounded-tr-md border-none border-l-slate-300 bg-primary px-1.5 text-background hover:bg-primary/90">
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-48">
          <DropdownMenuItem asChild>
            <AddTransactionTemplate
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {transactionTemplates.map((t) => (
            <DropdownMenuItem key={t.id} asChild>
              <TransactionTemplate id={t.id} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default CashflowTableAddTransactionBtn;
