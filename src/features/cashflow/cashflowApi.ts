import { supabase } from "@/db/supabaseClient";
import { Transaction, Transactions } from "@/features/types";

export async function fetchCashflow() {
  const { data, error } = await supabase.from("cashflow").select();

  if (error) throw new Error(error.message);

  return data as Transactions;
}

export async function uploadTransaction(payment: Omit<Transaction, "id">) {
  const { data, error } = await supabase
    .from("cashflow")
    .insert(payment)
    .select();

  if (error?.message) {
    console.error({ error });
    throw new Error(error.message);
  }
  if (!data) throw new Error("No data received from database");
  return data[0] as Transaction;
}

export async function updateTransaction(
  transactionId: Transaction["id"],
  newValueType: "title" | "type" | "amount" | "date",
  newValue: string | number
) {
  switch (newValueType) {
    case "title": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ title: newValue as string })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "type": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ type: newValue as string })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "amount": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ amount: newValue as number })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
    case "date": {
      const { data, error } = await supabase
        .from("cashflow")
        .update({ date: newValue as string })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    }
  }
}

export async function upsertTransaction(transaction: Transaction) {
  const { data, error } = await supabase
    .from("cashflow")
    .upsert(transaction)
    .select();

  if (error) throw new Error(error.message);
  return data[0];
}

export async function deleteCashflowItems(
  casfhlowItemsIds: Transaction["id"][]
) {
  const response = await supabase
    .from("cashflow")
    .delete()
    .in("id", casfhlowItemsIds);

  return response.status;
}
