import { transactionChanged } from "@/features/cashflow/cashflowSlice";
import { CashflowItem } from "@/features/types";
import { useAppDispatch } from "@/lib/hooks";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

interface EditableTableCellProps {
  cashflowItemId: CashflowItem["id"];
  cellType: "title" | "type" | "amount" | "date";
  cellValue: string | number;
}

const inputType = {
  title: "text",
  date: "text",
  type: "select",
  amount: "number",
};

function EditableTableCell({
  cashflowItemId,
  cellType,
  cellValue,
}: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState(cellValue);
  const dispatch = useAppDispatch();

  function handleClickEdit() {
    setIsEditing(true);
  }

  function handleCellFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    handleCellInputBlur();
  }

  function handleCellInputBlur() {
    const inputDoesntExceedLimits =
      (cellType === "amount" && Number(inputValue) <= 100000000000) ||
      cellType !== "amount";

    if (inputDoesntExceedLimits && inputValue !== cellValue) {
      dispatch(
        transactionChanged({
          transactionId: cashflowItemId,
          whatChanged: cellType,
          newValue: cellType === "amount" ? Number(inputValue) : inputValue,
        })
      );
    }
    setIsEditing(false);
    setIsHovered(false);
  }

  if (isEditing) {
    return (
      <td className="">
        <form onSubmit={handleCellFormSubmit}>
          <Input
            type={inputType[cellType]}
            value={inputValue}
            name="cell-value-input"
            max="1000000000"
            autoFocus={isEditing}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleCellInputBlur}
          />
        </form>
      </td>
    );
  } else {
    return (
      <td
        className="editable relative h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>
          {cellType === "amount" && " $"}
          {inputValue}
        </span>
        {isHovered && (
          <button
            className="bg-slate-800 px-2 py-1 rounded-md absolute top-1 right-1"
            onClick={handleClickEdit}
          >
            <Pencil size={16} />
          </button>
        )}
      </td>
    );
  }
}

export default EditableTableCell;
