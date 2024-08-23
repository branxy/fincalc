import { supabase } from "@/db/supabaseClient";
import { TTransactionTemplate } from "@/features/types";

export const fetchTransactionTemplatesFromDB = async (): Promise<
  TTransactionTemplate[]
> => {
  const { data, error } = await supabase.from("transactionTemplates").select();

  if (error) {
    console.error({ error });
    throw new Error("Failed to fetch templates", { cause: error.message });
  }

  return data;
};

export const insertTransactionTemplate = async (
  template: Omit<TTransactionTemplate, "id">,
) => {
  const { data, error } = await supabase
    .from("transactionTemplates")
    .insert(template)
    .select();

  if (error) {
    console.error({ error });
    throw new Error("Failed to insert a template", { cause: error.message });
  }

  return data[0];
};

export const updateTransactionTemplate = async (
  transactionId: TTransactionTemplate["id"],
  changes: Partial<Omit<TTransactionTemplate, "id" | "user_id">>,
) => {
  const { error, data } = await supabase
    .from("transactionTemplates")
    .update(changes)
    .eq("id", transactionId)
    .select();

  if (error) {
    console.error(error.message);
    throw new Error("Failed to insert a template", { cause: error.message });
  }

  return data[0];
};

export const deleteTransactionTemplate = async (
  transactionId: TTransactionTemplate["id"],
) => {
  const { error } = await supabase
    .from("transactionTemplates")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error(error.message);
    throw new Error("Failed to delete a template", { cause: error.message });
  }
};
