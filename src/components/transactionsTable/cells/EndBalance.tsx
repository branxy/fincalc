import { LoaderCircle } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

import { FinancePeriod } from "@/features/types";
import { cn, MarkedCashflow } from "@/lib/utils";

interface EndBalanceProps {
  periodEndBalance:
    | MarkedCashflow[FinancePeriod["id"]]["periodEndBalance"]
    | null;
  isLoading: boolean;
}

function EndBalance({ periodEndBalance, isLoading }: EndBalanceProps) {
  const [currencySign] = useContext(CurrencyContext)!;
  if (!periodEndBalance) return;

  const { balance_end, stock_end, forward_payments_end } = periodEndBalance,
    balanceIsNegative = balance_end < 0;

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
          {currencySign + balance_end}
        </span>
      </span>
      {typeof stock_end !== "undefined" && (
        <span className="block">Stock:&nbsp;{currencySign + stock_end}</span>
      )}
      {typeof forward_payments_end !== "undefined" && (
        <span className="block">
          Forward&nbsp;payments:&nbsp;{currencySign + forward_payments_end}
        </span>
      )}
    </td>
  );
}

export default EndBalance;
