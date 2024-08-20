import { LoaderCircle } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

import { FinancePeriod } from "@/features/types";
import { cn } from "@/lib/utils";

interface EndBalanceProps {
  periodEndBalance: Pick<
    FinancePeriod,
    "balance_end" | "stock_end" | "forward_payments_end"
  > | null;
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
      {typeof periodEndBalance?.balance_end === "number" && (
        <span className="block">
          End balance:&nbsp;
          <span
            className={cn("rounded-sm px-1.5", {
              "bg-red-400": balanceIsNegative,
            })}
          >
            {currencySign + periodEndBalance.balance_end}
          </span>
        </span>
      )}
      {typeof stock_end === "number" && (
        <span className="block">
          Stock: {currencySign + periodEndBalance.stock_end}
        </span>
      )}
      {typeof forward_payments_end === "number" && (
        <span className="block">
          Forward payments:{" "}
          {currencySign + periodEndBalance.forward_payments_end}
        </span>
      )}
    </td>
  );
}

export default EndBalance;
