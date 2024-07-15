import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types_supabase";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient<Database>(url, key);
