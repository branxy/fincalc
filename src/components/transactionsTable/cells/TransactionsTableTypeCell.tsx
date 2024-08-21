import EditCellButton from "@/components/transactionsTable/cells/EditCellButton";
import { Transaction } from "@/features/types";
import { ReturnWithoutCellState, useEditTableCell } from "@/lib/hooks";

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
import { transactionTypeChangedAndPeriodsRecalculated } from "@/features/cashflow/cashflowSlice";
import { Fragment } from "react/jsx-runtime";

interface TransactionsTableTypeCellProps {
  transactionId: Transaction["id"];
  type: Transaction["type"];
}

export const transactionTypes: Transaction["type"][][] = [
  ["payment/fixed", "payment/variable"],
  ["income/profit", "income/stock", "income/forward-payment"],
  ["compensation/stock", "compensation/forward-payment"],
];

function TransactionsTableTypeCell({
  transactionId,
  type,
}: TransactionsTableTypeCellProps) {
  const [
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    finishEditing,
    dispatch,
  ] = useEditTableCell() as ReturnWithoutCellState;

  function finishEditingAndSave(newType: Transaction["type"]) {
    finishEditing();
    if (type !== newType) {
      dispatch(
        transactionTypeChangedAndPeriodsRecalculated({
          transactionId,
          newType,
        }),
      );
    }
  }

  return (
    <>
      {isEditing ? (
        <td>
          <Select
            defaultOpen={true}
            onOpenChange={finishEditing}
            defaultValue={type}
            name="transaction-type"
            onValueChange={finishEditingAndSave}
          >
            <SelectTrigger aria-label="Transaction type">
              <SelectValue placeholder={type} />
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map((tgroup, i) => {
                const label = tgroup[0].split("/")[0],
                  uppercaseLabel =
                    label.charAt(0).toUpperCase() + label.slice(1);
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
        </td>
      ) : (
        <td
          className="editable relative h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span>{type}</span>
          <EditCellButton isHovered={isHovered} setIsEditing={setIsEditing} />
        </td>
      )}
    </>
  );
}

export default TransactionsTableTypeCell;
