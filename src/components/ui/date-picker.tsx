import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn, getDBDateFromObject } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { transactionChanged } from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";

function DatePicker({
  transactionId,
  inputValue,
  setIsEditing,
  setIsHovered,
}: {
  transactionId: Transaction["id"];
  inputValue: string;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date(inputValue));
  const dispatch = useAppDispatch();

  function handleSelectDate(e: Date | undefined) {
    if (e) {
      console.log({ e });

      setDate(e);
      dispatch(
        transactionChanged({
          transactionId,
          whatChanged: "date",
          newValue: getDBDateFromObject(e),
        })
      );
    }
  }

  function close() {
    setIsEditing(false);
    setIsHovered(false);
  }

  return (
    <Popover defaultOpen={true} onOpenChange={close}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !inputValue && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{inputValue || "Pick a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
