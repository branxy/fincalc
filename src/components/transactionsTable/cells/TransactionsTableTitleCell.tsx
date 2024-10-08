import EditCellButton from "@/components/transactionsTable/cells/EditCellButton";

import { Input } from "@/components/ui/input";

import { transactionTitleChanged } from "@/features/transactions/transactionsSlice";
import { Transaction } from "@/features/types";
import { ReturnWithCellState, useEditTableCell } from "@/lib/hooks";

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
      }),
    );
  }

  return (
    <>
      {isEditing ? (
        <td>
          <form className="h-full px-2" onSubmit={handleCellFormSubmit}>
            <Input
              type="text"
              value={titleState}
              name="cell-value-input"
              onChange={(e) => setTitleState(e.target.value)}
              onBlur={finishEditing}
              autoFocus={isEditing}
              onKeyDown={(e) => e.key === "Tab" && finishEditingAndSave()}
              className="focus-within:bg-background focus-within:text-foreground"
            />
          </form>
        </td>
      ) : (
        <td
          className="editable relative h-full max-w-32 pr-9"
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
