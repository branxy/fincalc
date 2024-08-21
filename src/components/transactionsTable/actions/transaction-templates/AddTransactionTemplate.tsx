import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";

import { type TransactionTemplate } from "../CashflowTableAddTransactionBtn";
import TransactionTemplateForm from "./TransactionTemplateForm";

interface AddTransactionTemplateProps {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTransactionTemplates: React.Dispatch<
    React.SetStateAction<TransactionTemplate[]>
  >;
}

function AddTransactionTemplate({
  drawerOpen,
  setDrawerOpen,
  setTransactionTemplates,
}: AddTransactionTemplateProps) {
  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-none" onClick={() => setDrawerOpen(true)}>
          + add template
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Set the transaction template</SheetTitle>
        </SheetHeader>
        <TransactionTemplateForm
          setDrawerOpen={setDrawerOpen}
          setTransactionTemplates={setTransactionTemplates}
        >
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
          </SheetFooter>
        </TransactionTemplateForm>
      </SheetContent>
    </Sheet>
  );
}

export default AddTransactionTemplate;
