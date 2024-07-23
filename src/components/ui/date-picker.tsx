import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn, getDBDateFromObject } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { transactionDateChangedAndPeriodsRecalculated } from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";

function DatePicker({
  transactionId,
  date,
  finishEditing,
}: {
  transactionId: Transaction["id"];
  date: string;
  finishEditing: () => void;
}) {
  const dispatch = useAppDispatch();

  function handleSelectDate(newDate: Date | undefined) {
    if (newDate) {
      finishEditing();
      dispatch(
        transactionDateChangedAndPeriodsRecalculated({
          transactionId,
          newDate: getDBDateFromObject(newDate),
        })
      );
    }
  }

  return (
    <Popover defaultOpen={true} onOpenChange={finishEditing}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{date || "Pick a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={new Date(date)}
          onSelect={handleSelectDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
