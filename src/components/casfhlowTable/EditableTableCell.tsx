import {
  transactionAmountChangedAndPeriodsRecalculated,
  transactionChanged,
  transactionTitleChanged,
} from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";
import { useAppDispatch } from "@/lib/hooks";
import { Pencil } from "lucide-react";
import { useState } from "react";
import TableCellInput from "./TableCellInput";

interface EditableTableCellProps {
  transactionId: Transaction["id"];
  cellType: "title" | "type" | "amount" | "date";
  cellValue: string | number;
}

function EditableTableCell({
  transactionId,
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

    dispatchActionByCellType(cellType);
    // handleCellInputBlur();
  }

  function handleCellInputBlur() {
    const inputDoesntExceedLimits =
      (cellType === "amount" && Number(inputValue) <= 100000000000) ||
      cellType !== "amount";

    if (inputDoesntExceedLimits && inputValue !== cellValue) {
      dispatch(
        transactionChanged({
          transactionId: transactionId,
          whatChanged: cellType,
          newValue: cellType === "amount" ? Number(inputValue) : inputValue,
        })
      );
    }
    setIsEditing(false);
    setIsHovered(false);
  }

  function dispatchActionByCellType(
    cellType: "title" | "type" | "amount" | "date"
  ) {
    switch (cellType) {
      case "title":
        dispatch(
          transactionTitleChanged({
            transactionId,
            newTitle: inputValue.toString(),
          })
        );
        break;
      case "amount":
        dispatch(
          transactionAmountChangedAndPeriodsRecalculated({
            transactionId,
            newAmount: Number(inputValue),
          })
        );
        break;
      default:
        throw new Error(`Unknown transaction type: ${cellType}`);
    }

    setIsEditing(false);
    setIsHovered(false);
  }

  if (isEditing) {
    return (
      <td className="">
        <form onSubmit={handleCellFormSubmit}>
          <TableCellInput
            transactionId={transactionId}
            cellType={cellType}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleCellInputBlur={handleCellInputBlur}
            dispatchActionByCellType={dispatchActionByCellType}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setIsHovered={setIsHovered}
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
            className="bg-slate-800 px-2 py-1 rounded-md absolute top-2 right-1"
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
