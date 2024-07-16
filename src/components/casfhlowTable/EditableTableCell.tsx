import { CashflowItem } from "@/features/types";
import { useAppDispatch } from "@/lib/hooks";
import { Pencil } from "lucide-react";
import { useState } from "react";

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

  function handleInputBlur() {
    const inputDoesntExceedLimits =
      (cellType === "amount" && Number(inputValue) <= 100000000000) ||
      cellType !== "amount";

    if (inputDoesntExceedLimits) {
      dispatch(
        cashflowItemChanged({
          cashflowItemId,
          whatChanged: cellType,
          newValue: cellType === "amount" ? Number(inputValue) : inputValue,
        })
      );

      setIsEditing(false);
      setIsHovered(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && Boolean(inputValue)) {
      handleInputBlur();
    }
  }

  if (isEditing) {
    return (
      <td className="">
        <input
          type={inputType[cellType]}
          id="table-cell-input"
          name="table-cell-input"
          value={inputValue}
          max="1000000000"
          autoFocus={isEditing}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />
      </td>
    );
  } else {
    return (
      <td
        className="editable relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>
          {cellType === "amount" && " $"}
          {inputValue}
        </span>
        {isHovered && (
          <button
            className="bg-slate-800 px-2 py-1 rounded-md absolute top-[calc(100% - 16px)] right-1"
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
