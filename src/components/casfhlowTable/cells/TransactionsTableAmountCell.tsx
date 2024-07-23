import { transactionAmountChangedAndPeriodsRecalculated } from "@/features/cashflow/cashflowSlice";
import { Transaction } from "@/features/types";
import { ReturnWithCellState, useEditTableCell } from "@/lib/hooks";
import EditCellButton from "./EditCellButton";
import { Input } from "@/components/ui/input";

interface TransactionsTableAmountCellProps {
  transactionId: Transaction["id"];
  amount: number;
}
function TransactionsTableAmountCell({
  transactionId,
  amount,
}: TransactionsTableAmountCellProps) {
  const [
    amountState,
    setAmountState,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    finishEditing,
    dispatch,
  ] = useEditTableCell(amount) as ReturnWithCellState<number>;

  function handleCellFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    finishEditingAndSave();
  }

  function finishEditingAndSave() {
    finishEditing();
    if (amount !== amountState) dispatchAction();
  }

  function dispatchAction() {
    dispatch(
      transactionAmountChangedAndPeriodsRecalculated({
        transactionId,
        newAmount: amountState,
      })
    );
  }

  return (
    <>
      {isEditing ? (
        <td>
          <form onSubmit={handleCellFormSubmit}>
            <Input
              type="number"
              defaultValue={amountState}
              max="1000000000"
              name="transaction-amount"
              autoFocus={isEditing}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setAmountState(Number(e.target.value))}
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
          <span>
            {typeof amount === "number" && "$"}
            {amount}
          </span>
          <EditCellButton isHovered={isHovered} setIsEditing={setIsEditing} />
        </td>
      )}
    </>
  );
}

export default TransactionsTableAmountCell;
