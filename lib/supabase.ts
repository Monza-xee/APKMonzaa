import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vpebmpjgbntoqxxmetwn.supabase.co";
const supabaseKey = "sb_publishable_vBcsnDyLfO0bkvvegDsT7Q_ac8OuWQd";

export const supabase = createClient(supabaseUrl, supabaseKey);
