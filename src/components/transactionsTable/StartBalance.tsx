import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  selectFirstPeriod,
  startBalanceChanged,
} from "@/features/periods/periodsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { useState } from "react";

export type UpdatedFormFields = {
  balance_start?: number;
  stock_start?: number;
  forward_payments_start?: number;
};

interface StartBalanceProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function StartBalance({ setOpen }: StartBalanceProps) {
  const { balance_start, stock_start, forward_payments_start } = useAppSelector(
    (state) => selectFirstPeriod(state),
  );
  const [newStartBalance, setNewStartBalance] = useState(balance_start);
  const [newStock, setNewStock] = useState(stock_start);
  const [newFP, setNewFP] = useState(forward_payments_start);

  const dispatch = useAppDispatch();

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedFields: UpdatedFormFields = {};

    if (newStartBalance !== balance_start) {
      updatedFields.balance_start = newStartBalance;
    }

    if (newStock !== stock_start) {
      updatedFields.stock_start = newStock;
    }

    if (newFP !== forward_payments_start) {
      updatedFields.forward_payments_start = newFP;
    }

    const hasUpdates = Object.keys(updatedFields).length > 0;
    if (hasUpdates) {
      dispatch(startBalanceChanged({ newBalance: updatedFields }));
    }

    setOpen(false);
  };

  const startBalanceExists = [newStartBalance, newStock, newFP].every(
    (p) => !isNaN(p),
  );

  const noStartBalance = !startBalanceExists && <p>Add a transaction first.</p>;

  return (
    <>
      {noStartBalance}
      <form
        className="flex h-full flex-col justify-between"
        onSubmit={onFormSubmit}
      >
        <div>
          {!isNaN(balance_start) && (
            <>
              <Label htmlFor="start-balance" className="shrink-0">
                Start balance
              </Label>
              <Input
                type="number"
                value={newStartBalance}
                name="start-balance"
                id="start-balance"
                max={1000000000000}
                className="min-w-24 max-w-48"
                onChange={(e) => setNewStartBalance(Number(e.target.value))}
              />
            </>
          )}
          {!isNaN(stock_start) && (
            <>
              <Label htmlFor="stock_start" className="shrink-0">
                Stock
              </Label>
              <Input
                type="number"
                value={newStock}
                name="stock_start"
                id="stock_start"
                max={1000000000000}
                className="min-w-24 max-w-48"
                onChange={(e) => setNewStock(Number(e.target.value))}
              />
            </>
          )}
          {!isNaN(forward_payments_start) && (
            <>
              <Label htmlFor="forward-payments" className="shrink-0">
                Forward payments
              </Label>
              <Input
                type="number"
                value={newFP}
                name="forward-payments"
                id="forward-payments"
                max={1000000000000}
                className="min-w-24 max-w-48"
                onChange={(e) => setNewFP(Number(e.target.value))}
              />
            </>
          )}
        </div>
        {startBalanceExists && (
          <Button type="submit" className="mb-1 mt-12 w-full">
            Apply
          </Button>
        )}
      </form>
    </>
  );
}

export default StartBalance;
