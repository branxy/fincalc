import { EntityAdapter, EntityState } from "@reduxjs/toolkit";
import { Cashflow, CashflowItem } from "../types";
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
    data as Cashflow
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
  return data[0] as CashflowItem;
}

export async function updateTransaction(
  itemId: CashflowItem["id"],
  newValueType: "title" | "type" | "amount" | "date",
  newValue: string | number
) {
  switch (newValueType) {
    case "title": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ title: newValue as string })
        .eq("id", itemId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "type": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ type: newValue as string })
        .eq("id", itemId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "amount": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ amount: newValue as number })
        .eq("id", itemId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "date": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ type: newValue as string })
        .eq("id", itemId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
  }
}

export async function deleteCashflowItems(
  casfhlowItemsIds: CashflowItem["id"][]
) {
  const response = await supabase
    .from("cashflow")
    .delete()
    .in("id", casfhlowItemsIds);

  return response.status;
}
