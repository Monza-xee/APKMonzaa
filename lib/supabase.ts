import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vpebmpjgbntoqxxmetwn.supabase.co";
const supabaseKey = "PASTE_API_KEY_LU";

export const supabase = createClient(supabaseUrl, supabaseKey);
