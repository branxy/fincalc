import { supabase } from "@/db/supabaseClient";
import { TransactionTemplate } from "@/features/types";

export async function fetchTransactionTemplatesFromDB(): Promise<
  TransactionTemplate[]
> {
  const { data, error } = await supabase.from("transactionTemplates").select();

  if (error) {
    console.error({ error });
    throw new Error("Failed to fetch templates", { cause: error.message });
  }

  return data;
}

export async function insertTransactionTemplate(
  template: Omit<TransactionTemplate, "id">,
) {
  const { data, error } = await supabase
    .from("transactionTemplates")
    .insert(template)
    .select();

  if (error) {
    console.error({ error });
    throw new Error("Failed to insert a template", { cause: error.message });
  }

  return data[0];
}
