import { FinancePeriod, Periods } from "@/features/types";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/db/supabaseClient";

export async function fetchPeriodsFromDB() {
  const { data, error } = await supabase
    .from("periods")
    .select()
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);

  return data as Periods;
}

export async function uploadPeriod(period: Omit<FinancePeriod, "id">) {
  const id = uuidv4();
  const newPeriod: FinancePeriod = { id, ...period };
  const { data, error } = await supabase
    .from("periods")
    .insert(newPeriod)
    .select();
  if (error) throw new Error(error.message);

  return data[0];
}

export async function upsertPeriods(periodsToUpdate: Periods) {
  const { data, error } = await supabase
    .from("periods")
    .upsert(periodsToUpdate)
    .select();

  if (error) throw new Error(error.message);
  return data!;
}
