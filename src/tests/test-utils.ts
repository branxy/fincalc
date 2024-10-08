import { faker } from "@faker-js/faker";

import { getDBDateFromObject, getTodayDate } from "@/lib/date-utils";
import { transactionTypes } from "@transactions/transactionTypes";

import { type FilterTransactionFields } from "@/routes/transactions";
import type { Transaction, Transactions } from "@/features/types";

type GenerateFakeTransactionsParams = Partial<{
  transactionsAmount: number;
  dateRange: {
    from: string;
    to: string;
  };
  transactionFields: Partial<Pick<Transaction, FilterTransactionFields>>;
}>;

const NUMBER_OF_SPECIFIC_DATA_REPEATS = 3;

type CustomFieldValuesRepeats = Record<FilterTransactionFields, number>;

export const generateFakeTransactions = ({
  transactionsAmount = 2,
  dateRange = {
    from: new Date().toISOString(),
    to: new Date().toISOString(),
  },
  transactionFields = {
    title: "",
    amount: 0,
    type: "payment/fixed",
    date: getTodayDate(),
  },
}: GenerateFakeTransactionsParams) => {
  const transactions: Transactions = [];

  transactionFields.title ??= "";
  transactionFields.amount ??= 0;
  transactionFields.type ??= "payment/fixed";
  transactionFields.date ??= getTodayDate();

  const { title, amount, type, date } = transactionFields;
  const customFieldValuesRepeats: CustomFieldValuesRepeats = {
    title: 0,
    amount: 0,
    type: 0,
    date: 0,
  };
  const specificTitle = !!title;
  const specificAmount = !!amount;
  const specificType = !!type;
  const specificDate = !!date;

  for (let i = 0; i < transactionsAmount; i++) {
    const transactionDate = assignTransactionDate(
      dateRange,
      specificDate,
      date,
      customFieldValuesRepeats,
    );

    const newTransaction: Transaction = {
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      title: assignTransactionTitle(
        specificTitle,
        title,
        customFieldValuesRepeats,
      ),
      amount: assignTransactionAmount(
        specificAmount,
        amount,
        customFieldValuesRepeats,
      ),
      type: assignTransactionType(specificType, type, customFieldValuesRepeats),
      date: transactionDate,
      date_created: transactionDate,
    };

    transactions.push(newTransaction);
  }

  return transactions;
};

const assignTransactionTitle = (
  specificTitle: boolean,
  userValue: Transaction["title"],
  repeats: CustomFieldValuesRepeats,
) => {
  if (specificTitle && repeats.title < NUMBER_OF_SPECIFIC_DATA_REPEATS) {
    repeats.title++;
    return userValue;
  } else return faker.finance.transactionDescription();
};

const assignTransactionAmount = (
  specificAmount: boolean,
  userValue: Transaction["amount"],
  repeats: CustomFieldValuesRepeats,
) => {
  if (specificAmount && repeats.amount < NUMBER_OF_SPECIFIC_DATA_REPEATS) {
    repeats.amount++;
    return userValue;
  } else return Number(faker.finance.amount({ dec: 0 }));
};

const assignTransactionType = (
  specificType: boolean,
  userValue: Transaction["type"],
  repeats: CustomFieldValuesRepeats,
): Transaction["type"] => {
  const availableTypes = transactionTypes.flat();

  if (!specificType) {
    const randomIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[randomIndex];
  }

  if (repeats.type < NUMBER_OF_SPECIFIC_DATA_REPEATS) {
    repeats.type++;
    return userValue;
  } else {
    const withoutCustomType = availableTypes.filter(
      (type) => type !== userValue,
    );

    const randomIndex = Math.floor(Math.random() * withoutCustomType.length);

    return withoutCustomType[randomIndex];
  }
};

const assignTransactionDate = (
  dateRange: Parameters<typeof generateFakeTransactions>[0]["dateRange"] & {},
  specificDate: boolean,
  userValue: Transaction["date"],
  repeats: CustomFieldValuesRepeats,
): Transaction["date"] => {
  if (specificDate && repeats.date < NUMBER_OF_SPECIFIC_DATA_REPEATS) {
    repeats.date++;
    return userValue;
  } else {
    const randomTransactionDate = getDBDateFromObject(
      faker.date.between(dateRange),
    );
    return randomTransactionDate;
  }
};
