import EditTransactionTemplate from "@/components/transactionsTable/actions/transaction-templates/EditTransactionTemplate";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectTransactionTemplateById,
  transactionTemplateDeleted,
} from "@/features/transaction-templates/transactionTemplateSlice";

import { type TTransactionTemplate } from "@/features/types";
import { forwardRef, useContext } from "react";
import { CurrencyContext } from "@/components/providers";

interface TransactionTemplateProps {
  id: TTransactionTemplate["id"];
}

const TransactionTemplate = forwardRef<
  HTMLDivElement,
  TransactionTemplateProps
>((props, ref) => {
  const { id, ...rest } = props;
  const t = useAppSelector((state) => selectTransactionTemplateById(state, id));
  //@ts-expect-error Old Redux code, to be removed with RTKQ
  const status = useAppSelector(selectTransactionsStatus);
  const [currencySign] = useContext(CurrencyContext)!;
  const dispatch = useAppDispatch();

  const isLoading = status === "loading",
    transactionTitle =
      t.title.length >= 11 ? t.title.slice(0, 8) + "..." : t.title;

  const handleAddTransactionFromTemplate = () => {
    //@ts-expect-error implement RTKQ mutation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, amount, date, type } = t;
    // add transaction
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-sm px-0 hover:bg-foreground/20">
      <Button
        variant="ghost"
        className="max-w-28 grow justify-start pl-2 hover:bg-transparent"
        disabled={isLoading}
        onClick={handleAddTransactionFromTemplate}
      >
        {transactionTitle} ({currencySign + t.amount})
      </Button>
      <div className="shrink-0">
        <EditTransactionTemplate {...rest} template={t} ref={ref} />
        <Button
          variant="ghost"
          className="group h-min px-1.5 py-1 hover:bg-transparent"
          disabled={isLoading}
          onClick={() => dispatch(transactionTemplateDeleted(id))}
        >
          <X size={16} className="group-hover:text-red-400" />
        </Button>
      </div>
    </div>
  );
});

export default TransactionTemplate;
