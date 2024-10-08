import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { ListFilter } from "lucide-react";

import { ComponentPropsWithoutRef, forwardRef, Fragment } from "react";

import { useNavigate } from "@tanstack/react-router";
import { Route, TransactionsSearchParams } from "@/routes/transactions";

import { getDBDateFromObject } from "@/lib/date-utils";
import { transactionTypes } from "@transactions/transactionTypes";
import {
  TransactionFilters,
  TransactionFilterNames,
} from "@/components/transactionsTable/actions/TransactionsTableActionButtons";
import { filterOptions } from "@/components/transactionsTable/actions/filters//filterFns";

export interface TransactionsTableFiltersProps {
  selectedFilter: TransactionFilterNames | null;
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<TransactionFilterNames | null>
  >;
}

function TransactionsTableFilters({
  selectedFilter,
  setSelectedFilter,
}: TransactionsTableFiltersProps) {
  const filters: TransactionFilters = {
    title: <TransactionTitleFilter />,
    amount: <TransactionAmountFilter />,
    type: <TransactionTypeFilter setSelectedFilter={setSelectedFilter} />,
    date: <TransactionDateFilter setSelectedFilter={setSelectedFilter} />,
  };

  return !selectedFilter ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FiltersButton />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter options</DropdownMenuLabel>
        {filterOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setSelectedFilter(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Popover
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          setSelectedFilter(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <FiltersButton />
      </PopoverTrigger>
      <PopoverContent align="end">{filters[selectedFilter]}</PopoverContent>
    </Popover>
  );
}

export default TransactionsTableFilters;

const FiltersButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>((props, ref) => (
  <Button ref={ref} variant="ghost" size="icon" {...props}>
    <ListFilter size={16} />
  </Button>
));

const TransactionTitleFilter = () => {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <>
      <Label htmlFor="transaction-title-filter">Title contains:</Label>
      <Input
        type="text"
        id="transaction-title-filter"
        autoFocus
        className="mt-1.5"
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              filter:
                e.target.value.length > 0
                  ? (("title." +
                      e.target.value) as TransactionsSearchParams["filter"])
                  : undefined,
            }),
          })
        }
      />
    </>
  );
};

const TransactionAmountFilter = () => {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <>
      <Label htmlFor="transaction-amount-filter">Amount is:</Label>
      <Input
        type="amount"
        id="transaction-amount-filter"
        autoFocus
        className="mt-1.5"
        onChange={(e) =>
          navigate({
            search: (prev) => ({
              ...prev,
              filter:
                e.target.value.length > 0
                  ? (("amount." +
                      e.target.value) as TransactionsSearchParams["filter"])
                  : undefined,
            }),
          })
        }
      />
    </>
  );
};

const TransactionTypeFilter = ({
  setSelectedFilter,
}: {
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<(typeof filterOptions)[number] | null>
  >;
}) => {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <Select
      defaultOpen
      onOpenChange={(open) => {
        !open && setSelectedFilter(null);
      }}
      onValueChange={(v) => {
        navigate({
          search: (prev) => ({
            ...prev,
            filter: ("type." + v) as TransactionsSearchParams["filter"],
          }),
        });
      }}
    >
      <SelectTrigger aria-label="Transaction type" className="text-foreground">
        <SelectValue placeholder="Transaction type is:" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        <SelectScrollUpButton />
        {transactionTypes.map((tgroup, i) => {
          const label = tgroup[0].split("/")[0],
            uppercaseLabel = label.charAt(0).toUpperCase() + label.slice(1);
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
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
  );
};

const TransactionDateFilter = ({
  setSelectedFilter,
}: {
  setSelectedFilter: React.Dispatch<
    React.SetStateAction<(typeof filterOptions)[number] | null>
  >;
}) => {
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <Calendar
      mode="single"
      selected={new Date()}
      onSelect={(date) => {
        navigate({
          search: (prev) => ({
            ...prev,
            filter: ("date." +
              getDBDateFromObject(date!)) as TransactionsSearchParams["filter"],
          }),
        });

        setSelectedFilter(null);
      }}
      initialFocus
    />
  );
};
