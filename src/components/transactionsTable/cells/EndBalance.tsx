import { LoaderCircle } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

import { Transaction } from "@/features/types";
import { cn, MarkedTransactions } from "@/lib/utils";

interface EndBalanceProps {
  periodEndBalance: MarkedTransactions[Transaction["id"]] | null;
  isLoading: boolean;
}

function EndBalance({ periodEndBalance, isLoading }: EndBalanceProps) {
  const [currencySign] = useContext(CurrencyContext)!;
  if (!periodEndBalance) return;

  const { endBalance, endStock, endForwardPayments } = periodEndBalance,
    balanceIsNegative = endBalance < 0;

  return isLoading ? (
    <td>
      <LoaderCircle className="animate-spin" />
    </td>
  ) : (
    <td>
      <span className="block">
        End&nbsp;balance:&nbsp;
        <span
          className={cn("rounded-sm px-1.5", {
            "bg-red-400": balanceIsNegative,
          })}
        >
          {currencySign + endBalance}
        </span>
      </span>
      {typeof endStock !== "undefined" && (
        <span className="block">Stock:&nbsp;{currencySign + endStock}</span>
      )}
      {typeof endForwardPayments !== "undefined" && (
        <span className="block">
          Forward&nbsp;payments:&nbsp;{currencySign + endForwardPayments}
        </span>
      )}
    </td>
  );
}

export default EndBalance;
