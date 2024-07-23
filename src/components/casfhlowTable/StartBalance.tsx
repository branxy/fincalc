import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import {
  selectFirstPeriod,
  startBalanceChanged,
} from "@/features/periods/periodsSlice";

function StartBalance() {
  const { start_balance } =
    useAppSelector((state) => selectFirstPeriod(state)) || 0;
  const [startBalance, setStartBalance] = useState(start_balance);
  const dispatch = useAppDispatch();

  function handleStartBalanceChange() {
    if (startBalance !== start_balance) {
      dispatch(
        startBalanceChanged({
          newStartBalance: startBalance,
        })
      );
    }
  }

  return (
    <form
      className="flex flex-col items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleStartBalanceChange();
      }}
    >
      {typeof startBalance === "number" && (
        <>
          <Label htmlFor="start-balance-input" className="shrink-0">
            Start balance
          </Label>
          <Input
            type="number"
            id="start-balance-input"
            placeholder={`${startBalance}`}
            value={startBalance}
            onChange={(e) => setStartBalance(Number(e.target.value))}
            onBlur={handleStartBalanceChange}
          />
        </>
      )}
    </form>
  );
}

export default StartBalance;
