import { supabase } from "@/db/supabaseClient";

import {
  BaseQueryFn,
  createApi,
  fakeBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { getPeriodsFromTransactions } from "@/features/periods/periodsCalculator";
import { createTransaction, performAuthCheck } from "@/lib/utils";

import type { Periods, Transaction, Transactions } from "@/features/types";
import { type PostgrestError } from "@supabase/supabase-js";

export interface GetTransactionsReturnT {
  transactions: Transactions;
  periods: Periods;
}

type AddTransactionMutationProps = Partial<
  Pick<Transaction, "title" | "amount" | "date" | "type">
> | void;

type TransactionsApiError = Pick<PostgrestError, "message">;

type CustomBaseQuery = BaseQueryFn<
  void,
  unknown,
  TransactionsApiError,
  NonNullable<unknown>
>;

export const apiSlice = createApi({
  baseQuery: fakeBaseQuery<TransactionsApiError>() as CustomBaseQuery,
  tagTypes: ["Transaction"],
  endpoints: (builder) => ({
    getTransactions: builder.query<GetTransactionsReturnT, void>({
      queryFn: async () => {
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select()
          .order("date", { ascending: true });

        if (error) {
          return {
            error: {
              message: error.message,
            },
          };
        } else {
          const periods = getPeriodsFromTransactions(transactions);
          return {
            data: {
              transactions,
              periods,
            },
          };
        }
      },
      providesTags: ["Transaction"],
    }),
    addTransaction: builder.mutation<Transaction, AddTransactionMutationProps>({
      queryFn: async ({ title, amount, date, type } = {}) => {
        await performAuthCheck();

        const newTransaction = createTransaction({
          title,
          amount,
          date,
          type,
        });

        const { data, error } = await supabase
          .from("transactions")
          .insert(newTransaction)
          .select();

        if (error) {
          return {
            error: {
              message: error.message,
            },
          };
        } else return { data: data[0] };
      },
      invalidatesTags: ["Transaction"],
    }),
  }),
});

export const { useGetTransactionsQuery, useAddTransactionMutation } = apiSlice;
