import { Input } from "@/components/ui/input";
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
import { Transaction } from "@/features/types";
import DatePicker from "../ui/date-picker";
import { Fragment } from "react/jsx-runtime";

const transactionTypes: Transaction["type"][][] = [
  ["payment/fixed", "payment/variable"],
  ["income/profit", "income/stock", "income/forward-payment"],
  ["compensation/stock", "compensation/forward-payment"],
];

function TableCellInput({
  transactionId,
  cellType,
  inputValue,
  setInputValue,
  isEditing,
  setIsEditing,
  setIsHovered,
  handleCellInputBlur,
  dispatchActionByCellType,
}: {
  transactionId: Transaction["id"];
  cellType: "title" | "type" | "amount" | "date";
  inputValue: string | number;
  setInputValue: React.Dispatch<React.SetStateAction<string | number>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
  handleCellInputBlur: () => void;
  dispatchActionByCellType: (
    cellType: "title" | "type" | "amount" | "date"
  ) => void;
}) {
  const cellInput = {
    title: (
      <Input
        type="text"
        value={inputValue}
        name="cell-value-input"
        autoFocus={isEditing}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleCellInputBlur}
      />
    ),
    type: (
      <Select defaultOpen={true} onOpenChange={handleCellInputBlur}>
        <SelectTrigger aria-label="Transaction type">
          <SelectValue placeholder={inputValue} />
        </SelectTrigger>
        <SelectContent>
          {transactionTypes.map((tgroup, i) => {
            const label = tgroup[0].split("/")[0],
              uppercaseLabel = label.charAt(0).toUpperCase() + label.slice(1);
            return (
              <Fragment key={i}>
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
                        {selectValue}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </Fragment>
            );
          })}
        </SelectContent>
      </Select>
    ),
    amount: (
      <Input
        type="text"
        max="1000000000"
        value={inputValue}
        name="cell-value-input"
        autoFocus={isEditing}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => dispatchActionByCellType(cellType)}
      />
    ),
    date: (
      <DatePicker
        transactionId={transactionId}
        inputValue={inputValue as string}
        setIsEditing={setIsEditing}
        setIsHovered={setIsHovered}
      />
    ),
  };
  return cellInput[cellType];
}

export default TableCellInput;
