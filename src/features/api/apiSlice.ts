import { supabase, url } from "@/db/supabaseClient";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getPeriodsFromTransactions } from "@/features/periods/periodsCalculator";

import type { Periods, Transactions } from "@/features/types";

export interface GetTransactionsReturnT {
  transactions: Transactions;
  periods: Periods;
}

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: url + "/rest/v1",
  }),
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
              status: "FETCH_ERROR",
              error: error.message,
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
  }),
});

export const { useGetTransactionsQuery } = apiSlice;
