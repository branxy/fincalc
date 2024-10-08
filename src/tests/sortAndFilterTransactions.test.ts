import { generateFakeTransactions } from "@/tests/test-utils";
import { sortAndFilterTransactions } from "@/lib/utils";
import { add, sub } from "date-fns";

import { describe, expect, it } from "vitest";

const CUSTOM_TRANSACTION_DATE = "1970-01-01";

const fakeTransactions = generateFakeTransactions({
  transactionsAmount: 5,
  dateRange: {
    from: sub(new Date(), { days: 15 }).toISOString(),
    to: add(new Date(), { days: 30 }).toISOString(),
  },
  transactionFields: {
    title: "test",
    amount: 42,
    type: "income/profit",
    date: CUSTOM_TRANSACTION_DATE,
  },
});

describe("Sorting", () => {
  describe("By date", () => {
    it("sorts by date ascending and with no filters by default", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "date",
          asc: true,
        },
      );

      proccesedTransactions.forEach((el, i, arr) => {
        const prevElDate = Date.parse(arr[i - 1]?.date);
        if (prevElDate) {
          expect(prevElDate).toBeLessThanOrEqual(Date.parse(el.date));
        }
      });
    });

    it("sorts by date descending", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "date",
          asc: false,
        },
      );

      proccesedTransactions.forEach((el, i, arr) => {
        const prevElDate = Date.parse(arr[i - 1]?.date);
        if (prevElDate) {
          expect(prevElDate).toBeGreaterThanOrEqual(Date.parse(el.date));
        }
      });
    });
  });

  describe("By amount", () => {
    it("sorts by amount ascending", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "amount",
          asc: true,
        },
      );

      proccesedTransactions.forEach((el, i, arr) => {
        const prevElAmount = arr[i - 1]?.amount;
        if (prevElAmount) {
          expect(prevElAmount).toBeLessThanOrEqual(el.amount);
        }
      });
    });

    it("sorts by amount descending", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "amount",
          asc: false,
        },
      );

      proccesedTransactions.forEach((el, i, arr) => {
        const prevElAmount = arr[i - 1]?.amount;
        if (prevElAmount) {
          expect(prevElAmount).toBeGreaterThanOrEqual(el.amount);
        }
      });
    });
  });

  describe("By type", () => {
    it("sorts by type ascending", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "type",
          asc: true,
        },
      );

      const desiredResult = proccesedTransactions.toSorted((a, b) =>
        a.type.localeCompare(b.type),
      );

      expect(desiredResult).toStrictEqual(proccesedTransactions);
    });

    it("sorts by type descending", () => {
      const proccesedTransactions = sortAndFilterTransactions(
        fakeTransactions,
        {
          sortBy: "type",
          asc: false,
        },
      );

      const desiredResult = proccesedTransactions.toSorted((a, b) =>
        b.type.localeCompare(a.type),
      );

      expect(desiredResult).toStrictEqual(proccesedTransactions);
    });
  });
});

describe("Filtering", () => {
  it("filters by title", () => {
    const proccesedTransactions = sortAndFilterTransactions(fakeTransactions, {
      sortBy: "date",
      asc: true,
      filter: "title.test",
    });

    const amountOfCorrectlyFilteredTransactions = proccesedTransactions.reduce(
      (sum, transaction) => {
        if (transaction.title.includes("test")) {
          sum++;
        }
        return sum;
      },
      0,
    );

    expect(amountOfCorrectlyFilteredTransactions).toBe(3);
  });

  it("filters by amount", () => {
    const proccesedTransactions = sortAndFilterTransactions(fakeTransactions, {
      sortBy: "date",
      asc: true,
      filter: "amount.42",
    });

    const amountOfCorrectlyFilteredTransactions = proccesedTransactions.reduce(
      (sum, transaction) => {
        if (transaction.amount === 42) {
          sum++;
        }
        return sum;
      },
      0,
    );

    expect(amountOfCorrectlyFilteredTransactions).toBe(3);
  });

  it("filters by type", () => {
    const proccesedTransactions = sortAndFilterTransactions(fakeTransactions, {
      sortBy: "date",
      asc: true,
      filter: "type.income/profit",
    });

    const amountOfCorrectlyFilteredTransactions = proccesedTransactions.reduce(
      (sum, transaction) => {
        if (transaction.type === "income/profit") {
          sum++;
        }
        return sum;
      },
      0,
    );

    expect(amountOfCorrectlyFilteredTransactions).toBe(3);
  });

  it("filters by date", () => {
    const proccesedTransactions = sortAndFilterTransactions(fakeTransactions, {
      sortBy: "date",
      asc: true,
      filter: `date.${CUSTOM_TRANSACTION_DATE}`,
    });

    const amountOfCorrectlyFilteredTransactions = proccesedTransactions.reduce(
      (sum, transaction) => {
        if (transaction.date === CUSTOM_TRANSACTION_DATE) {
          sum++;
        }
        return sum;
      },
      0,
    );

    expect(amountOfCorrectlyFilteredTransactions).toBe(3);
  });
});
