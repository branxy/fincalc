import { EntityAdapter, EntityState } from "@reduxjs/toolkit";
import { CashflowItem } from "../types";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/db/supabaseClient";

export async function getCashflow(
  casfhlowAdapter: EntityAdapter<CashflowItem, string>
) {
  let initialState: EntityState<CashflowItem, string> & {
    status: string;
    error: PostgrestError | null;
  };

  const { data, error } = await supabase.from("cashflow").select();

  if (error) {
    initialState = casfhlowAdapter.getInitialState({
      status: "idle",
      error,
    });
  }

  initialState = casfhlowAdapter.getInitialState(
    {
      status: "idle",
      error: null,
    },
    data!
  );

  return initialState;
}

export async function uploadTransaction(payment: Omit<CashflowItem, "id">) {
  const { data, error } = await supabase
    .from("cashflow")
    .insert(payment)
    .select();

  if (error?.message) {
    console.error({ error });
    throw new Error(error.message);
  }
  if (!data) throw new Error("No data received from database");
  return data[0];
}
