import { transactionTitleChanged } from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";
import { useAppDispatch, useEditTableCell } from "@/lib/hooks";
import EditCellButton from "./EditCellButton";
import { Input } from "@/components/ui/input";

interface TransactionTableTitleColumnProps {
  transactionId: Transaction["id"];
  title: string;
}
function TransactionsTableTitleCell({
  transactionId,
  title,
}: TransactionTableTitleColumnProps) {
  const [
    titleState,
    setTitleState,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
  ] = useEditTableCell(title);

  const dispatch = useAppDispatch();

  function handleCellFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    finishEditingAndSave();
  }

  function dispatchAction() {
    dispatch(
      transactionTitleChanged({
        transactionId,
        newTitle: titleState.toString(),
      })
    );
  }

  function finishEditing() {
    setIsEditing(false);
    setIsHovered(false);
  }

  function finishEditingAndSave() {
    finishEditing();
    if (title !== titleState) dispatchAction();
  }

  return (
    <>
      {isEditing ? (
        <td>
          <form onSubmit={handleCellFormSubmit}>
            <Input
              type="text"
              value={titleState}
              name="cell-value-input"
              autoFocus={isEditing}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTitleState(e.target.value)}
              onBlur={finishEditingAndSave}
            />
          </form>
        </td>
      ) : (
        <td
          className="editable relative h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>{title}</span>
          <EditCellButton isHovered={isHovered} setIsEditing={setIsEditing} />
        </td>
      )}
    </>
  );
}

export default TransactionsTableTitleCell;
