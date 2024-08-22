import TransactionTemplateDatepicker from "@/components/transactionsTable/actions/transaction-templates/TransactionTemplateDatepicker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type TransactionTemplate } from "@/features/types";

import { Fragment, useState } from "react";
import { transactionTypes } from "@/components/transactionsTable/cells/TransactionsTableTypeCell";
import { Transaction } from "@/features/types";
import { getDBDateFromObject } from "@/lib/utils";

import { useAppDispatch } from "@/lib/hooks";
import { transactionTemplateAdded } from "@/features/transaction-templates/transactionTemplateSlice";

interface TransactionTemplateFormProps {
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}

function TransactionTemplateForm({
  setDrawerOpen,
  children,
}: TransactionTemplateFormProps) {
  const [type, setType] = useState<Transaction["type"]>("payment/fixed");
  const [date, setDate] = useState(new Date());
  const dispatch = useAppDispatch();

  const handleAddTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget),
      title = (formData.get("template-transaction-title") as string) ?? "",
      amount = formData.get("template-transaction-amount") ?? 0;

    e.currentTarget.reset();

    const newTemplate: Omit<TransactionTemplate, "id" | "user_id"> = {
      title,
      amount: Number(amount),
      type,
      date: getDBDateFromObject(date),
    };

    dispatch(transactionTemplateAdded(newTemplate));

    setDrawerOpen(false);
    clearInputs();
  };

  const clearInputs = () => {
    setType("payment/fixed");
    setDate(new Date());
  };

  return (
    <form onSubmit={handleAddTemplate} className="mt-3 w-full md:max-w-64">
      <fieldset>
        <Label htmlFor="template-transaction-title">Title</Label>
        <Input
          type="text"
          name="template-transaction-title"
          id="template-transaction-title"
          maxLength={80}
          className="mt-1"
        />
      </fieldset>
      <fieldset className="mt-2">
        <Label htmlFor="template-transaction-amount">Amount</Label>
        <Input
          type="number"
          name="template-transaction-amount"
          id="template-transaction-amount"
          max={1000000000}
          onFocus={(e) => e.target.select()}
        />
      </fieldset>
      <fieldset className="mt-2">
        <Label htmlFor="template-transaction-type">Type</Label>
        <Select
          value={type}
          name="template-transaction-type"
          onValueChange={(e: Transaction["type"]) => setType(e)}
        >
          <SelectTrigger
            aria-label="Transaction type"
            className="mt-1"
            id="template-transaction-type"
          >
            <SelectValue placeholder={type} />
          </SelectTrigger>
          <SelectContent className="max-h-56 lg:max-h-none">
            {transactionTypes.map((tgroup, i) => {
              const label = tgroup[0].split("/")[0],
                uppercaseLabel = label.charAt(0).toUpperCase() + label.slice(1);
              return (
                <Fragment key={"template-" + i}>
                  {i > 0 && <SelectSeparator />}
                  <SelectGroup>
                    <SelectLabel>{uppercaseLabel}</SelectLabel>
                    {tgroup.map((t, i) => {
                      const selectValues = t
                          .split("/")[1]
                          .split("-")
                          .join(" ")
                          .replace(/^\b\w/g, (l) => l.toUpperCase()),
                        selectValue = selectValues;
                      return (
                        <SelectItem key={i} value={t}>
                          {selectValue} {label}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </Fragment>
              );
            })}
          </SelectContent>
        </Select>
      </fieldset>
      <fieldset className="mt-3">
        <Label>
          <span className="mb-1.5 block">Date</span>
          <TransactionTemplateDatepicker date={date} setDate={setDate} />
        </Label>
      </fieldset>
      <div className="mt-6 flex justify-between gap-6">
        <Button type="submit">Add template</Button>
        {children}
      </div>
    </form>
  );
}

export default TransactionTemplateForm;
