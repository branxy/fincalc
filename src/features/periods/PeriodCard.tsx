import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MonthNames, Months } from "./periodsCalculator";
import { cn } from "@/lib/utils";
import { Minus, Plus, Scale, ShieldCheck } from "lucide-react";

import { useContext } from "react";
import { CurrencyContext } from "@/components/providers";

interface PeriodsCardProps {
  monthName: MonthNames;
  monthStats: Months[MonthNames];
}

const PeriodCard = ({ monthName, monthStats }: PeriodsCardProps) => {
  const [currencySign] = useContext(CurrencyContext)!;
  const { balance, earned, spent, saved } = monthStats!,
    balanceDifference = earned - spent;
  return (
    <li>
      <Card>
        <CardHeader>
          <CardTitle>{monthName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Scale className="shrink-0" size={18} />
            <span className="ml-1 shrink-0">
              Balance: {currencySign + balance}
            </span>
            <span
              className={cn("ml-3 rounded-md px-2 pb-0.5", {
                "bg-green-400": balanceDifference > 0,
                "bg-red-400": balanceDifference < 0,
              })}
            >
              {balanceDifference > 0 && "+" + currencySign + balanceDifference}
              {balanceDifference < 0 && currencySign + balanceDifference}
            </span>
          </div>
          <div className="flex items-center">
            <Plus size={18} />
            <span className="ml-1 shrink-0">
              Earned: {currencySign + earned}
            </span>
          </div>
          <div className="flex items-center">
            <Minus size={18} />
            <span className="ml-1 shrink-0">Spent: {currencySign + spent}</span>
          </div>
          <div className="flex items-center">
            <ShieldCheck size={18} />
            <span className="ml-1 shrink-0">Saved: {currencySign + saved}</span>
          </div>
        </CardContent>
      </Card>
    </li>
  );
};

export default PeriodCard;
