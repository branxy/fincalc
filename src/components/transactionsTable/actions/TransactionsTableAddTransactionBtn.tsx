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

import { useAppSelector } from "@/lib/hooks";
import { selectAllTransactionTemplates } from "@/features/transaction-templates/transactionTemplateSlice";
import { useAddTransactionMutation } from "@/features/api/apiSlice";

import { useState } from "react";
import { toast } from "sonner";

function TransactionsTableAddTransactionBtn() {
  const transactionTemplates = useAppSelector((state) =>
    selectAllTransactionTemplates(state),
  );
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAddTransaction = async () => {
    try {
      await addTransaction().unwrap();
    } catch (e) {
      console.error("Error in handleAddTransaction: ", e);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <div className="flex">
      <Button
        className="flex gap-2 rounded-br-none rounded-tr-none pr-2"
        disabled={isLoading}
        onClick={handleAddTransaction}
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
          {!!transactionTemplates.length && <DropdownMenuSeparator />}
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

export default TransactionsTableAddTransactionBtn;
