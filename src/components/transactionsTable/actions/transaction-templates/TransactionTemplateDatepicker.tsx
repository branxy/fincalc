import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getDBDateFromObject } from "@/lib/date-utils";

interface TransactionTemplateDatepickerProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

function TransactionTemplateDatepicker({
  date,
  setDate,
}: TransactionTemplateDatepickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          onClick={() => setOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{getDBDateFromObject(date) || "Pick a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            d && setDate(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default TransactionTemplateDatepicker;
