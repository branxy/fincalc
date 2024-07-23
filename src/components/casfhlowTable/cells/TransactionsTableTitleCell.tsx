import { transactionTitleChanged } from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";
import { ReturnWithCellState, useEditTableCell } from "@/lib/hooks";
import EditCellButton from "./EditCellButton";
import { Input } from "@/components/ui/input";

interface TransactionsTableTitleCellProps {
  transactionId: Transaction["id"];
  title: string;
}
function TransactionsTableTitleCell({
  transactionId,
  title,
}: TransactionsTableTitleCellProps) {
  const [
    titleState,
    setTitleState,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    finishEditing,
    dispatch,
  ] = useEditTableCell(title) as ReturnWithCellState<string>;

  function handleCellFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    finishEditingAndSave();
  }

  function finishEditingAndSave() {
    finishEditing();
    if (title !== titleState) dispatchAction();
  }

  function dispatchAction() {
    dispatch(
      transactionTitleChanged({
        transactionId,
        newTitle: titleState.toString(),
      })
    );
  }

  return (
    <>
      {isEditing ? (
        <td>
          <form className="h-full" onSubmit={handleCellFormSubmit}>
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
