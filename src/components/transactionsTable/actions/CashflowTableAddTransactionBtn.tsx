import AddTransactionTemplate from "@/components/transactionsTable/actions/transaction-templates/AddTransactionTemplate";
import Spinner from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { transactionAdded } from "@/features/cashflow/cashflowSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Transaction } from "@/features/types";

import { useContext, useState } from "react";
import { CurrencyContext } from "@/components/providers";

export type TransactionTemplate = Pick<
  Transaction,
  "id" | "title" | "amount" | "type" | "date"
>;
interface CashflowTableAddTransactionBtnProps {
  isLoading: boolean;
}

function CashflowTableAddTransactionBtn({
  isLoading,
}: CashflowTableAddTransactionBtnProps) {
  const [transactionTemplates, setTransactionTemplates] = useState<
    TransactionTemplate[]
  >([]);
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [currencySign] = useContext(CurrencyContext)!;
  const dispatch = useAppDispatch();

  const handleAddTransactionFromTemplate = (
    selectedTemplate: Transaction["type"] | Transaction["id"],
  ) => {
    switch (selectedTemplate) {
      case "payment/fixed":
        dispatch(transactionAdded({ transactionType: "payment/fixed" }));
        break;
      case "income/profit":
        dispatch(transactionAdded({ transactionType: "income/profit" }));
        break;
      default:
        {
          const template = transactionTemplates.find(
            (templ) => templ.id === selectedTemplate,
          );

          if (!template) return;

          const { title, amount, date, type } = template;
          dispatch(
            transactionAdded({
              transactionTitle: title,
              transactionAmount: amount,
              transactionDate: date,
              transactionType: type,
            }),
          );
        }
        break;
    }

    setSelectedTransactionType("");
  };

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
      <Select
        value={selectedTransactionType}
        onValueChange={handleAddTransactionFromTemplate}
      >
        <SelectTrigger className="w-fit rounded-bl-none rounded-tl-none border-none border-l-slate-300 bg-primary text-background hover:bg-primary/90"></SelectTrigger>
        <SelectContent position="popper" align="center">
          {transactionTemplates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.title} ({currencySign + t.amount})
            </SelectItem>
          ))}
          <SelectItem value="payment/fixed">Payment</SelectItem>
          <SelectItem value="income/profit">Income</SelectItem>
          <AddTransactionTemplate
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            setTransactionTemplates={setTransactionTemplates}
          />
        </SelectContent>
      </Select>
    </div>
  );
}

export default CashflowTableAddTransactionBtn;
