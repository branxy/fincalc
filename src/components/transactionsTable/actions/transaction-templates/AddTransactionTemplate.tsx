import AddTransactionTemplateForm from "@/components/transactionsTable/actions/transaction-templates/AddTransactionTemplateForm";

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

import { ComponentPropsWithoutRef, forwardRef } from "react";

interface AddTransactionTemplateProps {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddTransactionTemplate = forwardRef<
  HTMLDivElement,
  AddTransactionTemplateProps
>((props, ref) => {
  const { drawerOpen, setDrawerOpen, ...rest } = props;

  return (
    <Sheet
      {...rest}
      open={drawerOpen}
      onOpenChange={() => setDrawerOpen((open) => !open)}
    >
      <SheetTrigger asChild>
        <SheetTriggerButton />
      </SheetTrigger>
      <SheetContent ref={ref} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Set the transaction template</SheetTitle>
        </SheetHeader>
        <AddTransactionTemplateForm setDrawerOpen={setDrawerOpen}>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
          </SheetFooter>
        </AddTransactionTemplateForm>
      </SheetContent>
    </Sheet>
  );
});

export default AddTransactionTemplate;

const SheetTriggerButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>((props, ref) => (
  <Button
    ref={ref}
    variant="secondary"
    className="w-full rounded-sm"
    {...props}
  >
    + Add template
  </Button>
));
