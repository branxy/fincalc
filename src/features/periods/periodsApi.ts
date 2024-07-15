import { EntityAdapter, EntityState } from "@reduxjs/toolkit";
import { FinancePeriod } from "../types";
import { v4 as uuidv4 } from "uuid";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/db/supabaseClient";

export async function getPeriods(
  periodsAdapter: EntityAdapter<FinancePeriod, string>
) {
  let initialState: EntityState<FinancePeriod, string> & {
    status: string;
    error: PostgrestError | null;
  };

  const { data, error } = await supabase.from("periods").select();

  if (error) {
    initialState = periodsAdapter.getInitialState({
      status: "idle",
      error,
    });
  }

  initialState = periodsAdapter.getInitialState(
    {
      status: "idle",
      error: null,
    },
    data!
  );

  return initialState;
}

export async function uploadPeriod(
  period: Omit<FinancePeriod, "id">
): Promise<FinancePeriod> {
  const id = uuidv4();
  const newPeriod: FinancePeriod = { id, ...period };
  return new Promise((resolve) => resolve(newPeriod));
}
