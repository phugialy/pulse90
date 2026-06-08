import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let readClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseReadConfig() {
  return Boolean(supabaseUrl && publishableKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getSupabaseReadClient() {
  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  readClient ??= createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return readClient;
}

export function getSupabaseAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  adminClient ??= createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
