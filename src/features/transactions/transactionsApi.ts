import { supabase } from "@/db/supabaseClient";

import type { Transaction } from "@/features/types";

export const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from("transactions")
    .select()
    .order("date", { ascending: true });

  return { data, error };
};

export async function uploadTransaction(
  payment: Omit<Transaction, "id" | "user_id" | "date_created">,
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert(payment)
    .select();

  if (error?.message) {
    console.error({ error });
    throw new Error(error.message);
  }
  if (!data) throw new Error("No data received from database");
  return data[0] as Transaction;
}

interface UpdateTransactionBase {
  transactionId: Transaction["id"];
}

type UpdateTransaction = UpdateTransactionBase &
  (
    | {
        newValueType: "title";
        newValue: Transaction["title"];
      }
    | {
        newValueType: "type";
        newValue: Transaction["type"];
      }
    | {
        newValueType: "amount";
        newValue: Transaction["amount"];
      }
    | {
        newValueType: "date";
        newValue: Transaction["date"];
      }
  );

export async function updateTransaction({
  transactionId,
  newValueType,
  newValue,
}: UpdateTransaction): Promise<Transaction> {
  switch (newValueType) {
    case "title": {
      const { data, error } = await supabase
        .from("transactions")
        .update({ title: newValue })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0] as Transaction;
    }
    case "type": {
      const { data, error } = await supabase
        .from("transactions")
        .update({ type: newValue })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0] as Transaction;
    }
    case "amount": {
      const { data, error } = await supabase
        .from("transactions")
        .update({ amount: newValue })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0] as Transaction;
    }
    case "date": {
      const { data, error } = await supabase
        .from("transactions")
        .update({ date: newValue })
        .eq("id", transactionId)
        .select();

      if (error) throw new Error(error.message);
      return data[0] as Transaction;
    }
  }
}

export async function upsertTransaction(
  transaction: Transaction,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .upsert(transaction)
    .select();

  if (error) throw new Error(error.message);
  return data[0] as Transaction;
}

export async function deleteCashflowItems(transactionIds: Transaction["id"][]) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds);

  if (error)
    throw new Error("Failed to delete transactions", { cause: error.message });

  return transactionIds;
}
