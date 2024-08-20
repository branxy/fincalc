import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { transactionAdded } from "@/features/cashflow/cashflowSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Transaction } from "@/features/types";

import { useState } from "react";

interface CashflowTableAddTransactionBtnProps {
  isLoading: boolean;
}

function CashflowTableAddTransactionBtn({
  isLoading,
}: CashflowTableAddTransactionBtnProps) {
  const [selectedTransactionType, setSelectedTransactionType] = useState("");

  const dispatch = useAppDispatch();

  const handleAddTransactionByType = (type: Transaction["type"]) => {
    switch (type) {
      case "payment/fixed":
        dispatch(transactionAdded({ newTransactionType: "payment/fixed" }));
        break;
      case "income/profit":
        dispatch(transactionAdded({ newTransactionType: "income/profit" }));
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
        onValueChange={handleAddTransactionByType}
      >
        <SelectTrigger className="w-fit rounded-bl-none rounded-tl-none border-none border-l-slate-300 bg-primary text-background hover:bg-primary/90"></SelectTrigger>
        <SelectContent position="popper" align="center">
          <SelectItem value="payment/fixed">Payment</SelectItem>
          <SelectItem value="income/profit">Income</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default CashflowTableAddTransactionBtn;
