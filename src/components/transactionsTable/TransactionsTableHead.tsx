import TransactionsTableHeadCell from "@/components/transactionsTable/TransactionsTableHeadCell";

export interface TransactionsTableHeadProps {
  isCheckedCheckbox: boolean;
  handleSelectAllTransactions: () => void;
}

function TransactionsTableHead({
  isCheckedCheckbox,
  handleSelectAllTransactions,
}: TransactionsTableHeadProps) {
  return (
    <tr>
      <th className="w-6 pr-2 text-right">
        <input
          className="h-4 w-4"
          type="checkbox"
          name="select-all"
          id="select-all"
          onChange={handleSelectAllTransactions}
          checked={isCheckedCheckbox}
        />
      </th>
      <th className="text-left">Name</th>
      <th className="text-left">
        <TransactionsTableHeadCell columnName="amount" />
      </th>
      <th className="text-left">
        <TransactionsTableHeadCell columnName="type" />
      </th>
      <th className="text-left">
        <TransactionsTableHeadCell columnName="date" />
      </th>
      <th className="text-left">Balance</th>
    </tr>
  );
}

export default TransactionsTableHead;
