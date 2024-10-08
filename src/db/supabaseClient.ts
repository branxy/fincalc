import type { Database } from "@/db/types_supabase";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient<Database>(url, key);
