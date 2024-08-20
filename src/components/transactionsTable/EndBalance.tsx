import { LoaderCircle } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

import { FinancePeriod } from "@/features/types";

interface EndBalanceProps {
  periodEndBalance: Pick<
    FinancePeriod,
    "balance_end" | "stock_end" | "forward_payments_end"
  > | null;
  isLoading: boolean;
}

function EndBalance({ periodEndBalance, isLoading }: EndBalanceProps) {
  const [currencySign] = useContext(CurrencyContext)!;

  return isLoading ? (
    <td>
      <LoaderCircle className="animate-spin" />
    </td>
  ) : (
    <td>
      {typeof periodEndBalance?.balance_end === "number" && (
        <span className="block">
          End balance: {currencySign + periodEndBalance.balance_end}
        </span>
      )}
      {typeof periodEndBalance?.stock_end === "number" && (
        <span className="block">
          Stock: {currencySign + periodEndBalance.stock_end}
        </span>
      )}
      {typeof periodEndBalance?.forward_payments_end === "number" && (
        <span className="block">
          Forward payments:{" "}
          {currencySign + periodEndBalance.forward_payments_end}
        </span>
      )}
    </td>
  );
}

export default EndBalance;
