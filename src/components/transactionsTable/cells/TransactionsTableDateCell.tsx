import EditCellButton from "@/components/transactionsTable/cells/EditCellButton";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

import {
  ReturnWithoutCellState,
  useAppDispatch,
  useEditTableCell,
} from "@/lib/hooks";

import { transactionDateChangedAndPeriodsRecalculated } from "@/features/cashflow/cashflowSlice";
import { cn, getDBDateFromObject } from "@/lib/utils";
import { Transaction } from "@/features/types";
import { useState } from "react";
import { CashflowTableRowProps } from "@/components/transactionsTable/CashflowTableRow";

interface TransactionsTableDateCellProps {
  transactionId: Transaction["id"];
  date: Transaction["date"];
  periodEndBalance: CashflowTableRowProps["periodEndBalance"];
}

function TransactionsTableDateCell({
  transactionId,
  date,
  periodEndBalance,
}: TransactionsTableDateCellProps) {
  const [isEditing, setIsEditing, isHovered, setIsHovered, finishEditing] =
    useEditTableCell() as ReturnWithoutCellState;
  const cellColSpan = periodEndBalance ? 1 : 2;

  return (
    <>
      {isEditing ? (
        <td colSpan={cellColSpan}>
          <TransactionsTableDateCellDatepicker
            transactionId={transactionId}
            transactionDate={date}
            finishEditing={finishEditing}
          />
        </td>
      ) : (
        <td
          colSpan={cellColSpan}
          className="editable relative h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>{date}</span>
          <EditCellButton isHovered={isHovered} setIsEditing={setIsEditing} />
        </td>
      )}
    </>
  );
}

export default TransactionsTableDateCell;

function TransactionsTableDateCellDatepicker({
  transactionId,
  transactionDate,
  finishEditing,
}: {
  transactionId: Transaction["id"];
  transactionDate: Transaction["date"];
  finishEditing: () => void;
}) {
  const [datepickerOpen, setDatepickerOpen] = useState(true);

  const dispatch = useAppDispatch();

  const handleSelectDate = (newDate: Date | undefined) => {
    if (newDate) {
      finishEditing();
      dispatch(
        transactionDateChangedAndPeriodsRecalculated({
          transactionId,
          newDate: getDBDateFromObject(newDate),
        }),
      );
    }
  };

  return (
    <Popover open={datepickerOpen} onOpenChange={finishEditing}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !transactionDate && "text-muted-foreground",
          )}
          onClick={() => setDatepickerOpen(!datepickerOpen)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{transactionDate || "Pick a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={new Date(transactionDate)}
          onSelect={handleSelectDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
