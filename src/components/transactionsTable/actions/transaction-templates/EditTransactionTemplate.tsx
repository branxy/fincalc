import EditTransactionTemplateForm from "@/components/transactionsTable/actions/transaction-templates/EditTransactionTemplateForm";

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
import { Edit2 } from "lucide-react";

import { TTransactionTemplate } from "@/features/types";
import { ComponentPropsWithoutRef, forwardRef, useState } from "react";

interface EditTransactionTemplateProps {
  template: TTransactionTemplate;
}

const EditTransactionTemplate = forwardRef<
  HTMLDivElement,
  EditTransactionTemplateProps
>((props, ref) => {
  const { template, ...rest } = props;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet {...rest} open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <SheetTriggerButton />
      </SheetTrigger>
      <SheetContent ref={ref} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Edit the transaction template</SheetTitle>
        </SheetHeader>
        <EditTransactionTemplateForm
          template={template}
          setDrawerOpen={setSheetOpen}
        >
          <SheetFooter>
            <SheetClose asChild>
              <SheetCloseButton />
            </SheetClose>
          </SheetFooter>
        </EditTransactionTemplateForm>
      </SheetContent>
    </Sheet>
  );
});

export default EditTransactionTemplate;

const SheetTriggerButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>((props, ref) => (
  <Button
    {...props}
    variant="ghost"
    className="group h-min px-1.5 py-1 hover:bg-transparent"
    ref={ref}
  >
    <Edit2 size={14} className="group-hover:text-foreground/40" />
  </Button>
));

const SheetCloseButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>((props, ref) => (
  <Button {...props} variant="secondary" ref={ref}>
    Close
  </Button>
));
