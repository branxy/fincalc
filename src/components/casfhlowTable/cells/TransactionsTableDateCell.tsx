import { Transaction } from "@/features/types";
import { ReturnWithoutCellState, useEditTableCell } from "@/lib/hooks";
import EditCellButton from "./EditCellButton";

import DatePicker from "@/components/ui/date-picker";

interface TransactionsTableDateCellProps {
  transactionId: Transaction["id"];
  date: Transaction["date"];
}

function TransactionsTableDateCell({
  transactionId,
  date,
}: TransactionsTableDateCellProps) {
  const [isEditing, setIsEditing, isHovered, setIsHovered, finishEditing] =
    useEditTableCell() as ReturnWithoutCellState;

  return (
    <>
      {isEditing ? (
        <td>
          <DatePicker
            transactionId={transactionId}
            date={date}
            finishEditing={finishEditing}
          />
        </td>
      ) : (
        <td
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
