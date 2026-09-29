import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Untyped view of the generated Supabase client.
 * The generated types lag behind migrations, so queries use this handle.
 */
export const db = supabase as unknown as SupabaseClient;

export { supabase };
