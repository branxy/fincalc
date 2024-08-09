import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useContext } from "react";

import { CurrencyContext } from "@/components/providers";
import { Currency } from "@/components/providers";

function SelectCurrency() {
  const [currency, setCurrency] = useContext(CurrencyContext)!;

  const handleSetCurrency = (newValue: string) => {
    const currencies: Currency[] = ["$", "₱", "€", "£"];
    if (currencies.includes(newValue as Currency))
      setCurrency(newValue as Currency);
  };

  return (
    <>
      <Label htmlFor="currency">Currency</Label>
      <Select
        value={currency}
        name="currency"
        onValueChange={handleSetCurrency}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={"Currency: " + currency} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="$">$</SelectItem>
          <SelectItem value="₱">₱</SelectItem>
          <SelectItem value="€">€</SelectItem>
          <SelectItem value="£">£</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

export default SelectCurrency;
